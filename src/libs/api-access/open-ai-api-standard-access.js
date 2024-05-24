/* eslint-disable no-unused-vars */
import { showToast, sleep, parseStreamResponseChunk } from '../utils/general-utils';
import { updateUI } from '../utils/general-utils';
import { messages } from '../state-management/state';
import { addMessage } from '../conversation-management/message-processing';

let localStreamRetryCount = 0;
export async function fetchLocalModelResponseStream(
  conversation,
  attitude,
  model,
  localModelEndpoint,
  updateUiFunction,
  abortController,
  streamedMessageText,
  autoScrollToBottom = true
) {
  const gptMessagesOnly = filterLocalMessages(conversation);

  let tempMessages = gptMessagesOnly.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('localModelKey') || 'No Key Provided'}`,
    },
    body: JSON.stringify({
      model: model,
      stream: true,
      messages: tempMessages,
      temperature: parseFloat(attitude),
      max_tokens: parseInt(localStorage.getItem('maxTokens')),
      top_P: parseFloat(localStorage.getItem('top_P') || 1.0),
      repetition_penalty: parseFloat(localStorage.getItem('repetitionPenalty') || 1.0),
    }),
    signal: abortController.signal,
  };

  try {
    const response = await fetch(localModelEndpoint + `/v1/chat/completions`, requestOptions);

    const result = await readResponseStream(response, updateUiFunction, autoScrollToBottom);

    localStreamRetryCount = 0;
    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      showToast(`Stream Request Aborted.`);
      return;
    }

    console.error('Error fetching Custom Model response:', error);
    showToast(`Stream Request Failed.`);
    return;
  }
}

let localVisionRetryCount = 0;
export async function fetchOpenAiLikeVisionResponse(visionMessages, apiKey, model, localModelEndpoint) {
  const payload = {
    model: model,
    messages: [
      {
        role: 'user',
        content: visionMessages,
      },
    ],
    max_tokens: 4096,
    top_P: parseFloat(localStorage.getItem('top_P') || 1.0),
    repetition_penalty: parseFloat(localStorage.getItem('repetitionPenalty') || 1.0),
  };

  try {
    const response = await fetch(localModelEndpoint + `/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    localVisionRetryCount = 0;

    return data.choices[0].message.content;
  } catch (error) {
    if (localVisionRetryCount < 3) {
      localVisionRetryCount++;

      showToast(`Failed fetchOpenAiLikeVisionResponse Request. Retrying...Attempt #${localVisionRetryCount}`);

      await sleep(1000);

      return fetchOpenAiLikeVisionResponse(visionMessages, apiKey);
    }
  }
}

let imageGenerationRetryCount = 0;
export async function customModelImageGeneration(conversation, localModelEndpoint, model) {
  let storedApiKey = localStorage.getItem('localModelKey');

  try {
    const response = await fetch(`${localModelEndpoint}/v1/images/generations`, {
      method: 'POST',
      model: model,
      quality: 'hd',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedApiKey || 'Missing API Key'}`,
      },
      body: JSON.stringify({
        prompt: conversation,
        n: parseInt(localStorage.getItem('selectedDallEImageCount')) || 2,
        size: localStorage.getItem('selectedDallEImageResolution') || '256x256',
      }),
    });

    const result = await response.json();

    if (result.data && result.data.length > 0) {
      imageGenerationRetryCount = 0;
      return result;
    } else {
      return "I'm sorry, I couldn't generate an image. The prompt may not be allowed by the API.";
    }
  } catch (error) {
    if (imageGenerationRetryCount < 3) {
      imageGenerationRetryCount++;

      showToast(`Failed customModelImageGeneration Request. Retrying...Attempt #${imageGenerationRetryCount}`);

      await sleep(1000);

      return await customModelImageGeneration(conversation);
    }

    showToast(`Retry Attempts Failed for customModelImageGeneration Request.`);
    console.error('Error fetching image generation response:', error);
    return 'An error generating Custom Model Image.';
  }
}

let retryCount = 0;
export async function getConversationTitleFromLocalModel(messages, model, localModelEndpoint) {
  try {
    const apiKey = document.getElementById('api-key');
    apiKey.value = localStorage.getItem('gptKey');

    let tempMessages = messages.slice(0);
    tempMessages.push({ role: 'user', content: 'Summarize my inital request or greeting in 5 words or less.' });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('localModelKey') || 'No Key Provided'}`,
      },
      body: JSON.stringify({
        model: model,
        stream: true,
        messages: tempMessages,
        temperature: 0.25,
        max_tokens: 32,
        top_P: parseFloat(localStorage.getItem('top_P') || 1.0),
        repetition_penalty: parseFloat(localStorage.getItem('repetitionPenalty') || 1.0),
      }),
    };

    const response = await fetch(localModelEndpoint + `/v1/chat/completions`, requestOptions);

    const result = await readResponseStream(response);

    localStreamRetryCount = 0;
    return result;
  } catch (error) {
    if (retryCount < 3) {
      retryCount++;
      await getConversationTitleFromLocalModel(messages, model, localModelEndpoint);
    }

    console.error('Error fetching Local Model response:', error);
    return 'An error occurred while generating conversaton title.';
  }
}

export async function getOpenAICompatibleAvailableModels(localModelEndpoint) {
  try {
    const storedApiKey = localStorage.getItem('localModelKey');

    const response = await fetch(`${localModelEndpoint}/v1/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedApiKey || 'Missing API Key'}`,
      },
    });

    const data = await response.json();

    if (data?.data) {
      return data.data.map((model) => model.id);
    }

    if (Array.isArray(data)) {
      return data.map((model) => model.id);
    }

    showToast('Error fetching models, double check the API endpoint configured');
    console.error('Error fetching available models:', data);
    return [];
  } catch (error) {
    showToast('Error fetching models, double check the API endpoint configured');
    console.error('Error fetching available models:', error);
    return [];
  }
}

async function readResponseStream(response, updateUiFunction, autoScrollToBottom = true) {
  let decodedResult = '';

  const reader = await response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      return decodedResult;
    }
    const chunk = decoder.decode(value);
    const parsedLines = parseStreamResponseChunk(chunk);
    for (const parsedLine of parsedLines) {
      const { choices } = parsedLine;
      const { delta } = choices[0];
      const { content } = delta;
      if (content) {
        decodedResult += content;

        if (updateUiFunction) {
          updateUI(content, messages.value, addMessage, autoScrollToBottom);
        }
      }
    }
  }
}

function filterLocalMessages(conversation) {
  let lastMessageContent = '';
  return conversation.filter((message) => {
    const isGPT = !message.content.trim().toLowerCase().startsWith('image::') && !lastMessageContent.startsWith('image::');
    lastMessageContent = message.content.trim().toLowerCase();
    return isGPT;
  });
}
