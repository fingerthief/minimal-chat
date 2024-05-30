import { showToast, sleep, parseStreamResponseChunk, handleTextStreamEnd } from '../utils/general-utils';
import { updateUI } from '../utils/general-utils';
import { messages } from '../state-management/state';
import { addMessage } from '../conversation-management/message-processing';
const MAX_RETRY_ATTEMPTS = 5;
let gptVisionRetryCount = 0;
let dalleRetryCount = 0;

export async function fetchGPTVisionResponse(visionMessages, apiKey) {
  const payload = {
    model: localStorage.getItem('selectedModel') || 'gpt-4-turbo',
    messages: [
      {
        role: 'user',
        content: visionMessages,
      },
    ],
    max_tokens: 4096,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    gptVisionRetryCount = 0;

    return data.choices[0].message.content;
  } catch (error) {
    if (gptVisionRetryCount < MAX_RETRY_ATTEMPTS) {
      gptVisionRetryCount++;
      showToast(`Failed fetchGPTVisionResponse Request. Retrying...Attempt #${gptVisionRetryCount}`);
      await sleep(1000);
      return fetchGPTVisionResponse(visionMessages, apiKey);
    } else {
      showToast(`Retry Attempts Failed for fetchGPTVisionResponse Request.`);
      return 'Error generating GPT Vision response.';
    }
  }
}

export async function generateDALLEImage(conversation) {
  const apiKey = localStorage.getItem('gptKey');

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      model: 'dall-e-3',
      quality: 'hd',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey || 'Missing API Key'}`,
      },
      body: JSON.stringify({
        prompt: conversation,
        n: parseInt(localStorage.getItem('selectedDallEImageCount')) || 2,
        size: localStorage.getItem('selectedDallEImageResolution') || '256x256',
      }),
    });

    const result = await response.json();

    if (result.data && result.data.length > 0) {
      dalleRetryCount = 0;
      return result;
    } else {
      return "I'm sorry, I couldn't generate an image. The prompt may not be allowed by the API.";
    }
  } catch (error) {
    if (dalleRetryCount < MAX_RETRY_ATTEMPTS) {
      dalleRetryCount++;
      showToast(`Failed generateDALLEImage Request. Retrying...Attempt #${dalleRetryCount}`);
      await sleep(1000);
      return await generateDALLEImage(conversation);
    } else {
      showToast(`Retry Attempts Failed for generateDALLEImage Request.`);
      console.error('Error fetching DALL-E response:', error);
      return 'An error generating DALL-E image.';
    }
  }
}

export async function fetchGPTResponseStream(
  conversation,
  attitude,
  model,
  updateUiFunction,
  abortController,
  streamedMessageText,
  autoScrollToBottom = true
) {
  const gptMessagesOnly = filterGPTMessages(conversation);

  let tempMessages = gptMessagesOnly.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('gptKey')}`,
    },
    body: JSON.stringify({
      model: model,
      stream: true,
      messages: tempMessages,
      temperature: attitude,
    }),
    signal: abortController.signal,
  };
  let result;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);

    result = await readResponseStream(response, updateUiFunction, autoScrollToBottom);

    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      showToast(`Stream Request Aborted.`);
      return;
    }

    console.error('Error fetching GPT response:', error);
    showToast(`Stream Request Failed.`);
    return;
  }
}

async function readResponseStream(response, updateUiFunction, autoScrollToBottom = true) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let decodedResult = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const parsedLines = parseStreamResponseChunk(chunk);

    for (const {
      choices: [
        {
          delta: { content },
        },
      ],
    } of parsedLines) {
      if (content) {
        decodedResult += content;
        updateUI(content, messages.value, addMessage, autoScrollToBottom);
      }
    }
  }

  handleTextStreamEnd(decodedResult);

  return decodedResult;
}

// TTS function
export async function fetchTTSResponse(text) {
  const apiKey = localStorage.getItem('gptKey');

  if (!apiKey) {
    throw new Error('API key not found');
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1', // Adding the model parameter as required
      input: text,    // Changing 'text' to 'input' as required
      voice: 'alloy'  // Default voice, adjust as needed
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error from TTS API: ${errorText}`);
  }

  const audioBlob = await response.blob(); // Get the audio content as a blob
  playAudio(audioBlob);
}

function playAudio(audioBlob) {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}

export async function fetchSTTResponse(file) {
  const apiKey = localStorage.getItem('gptKey');

  if (!apiKey) {
    throw new Error('API key not found');
  }

  const formData = new FormData();
  
  // Append the file with the appropriate format
  formData.append('file', new File([file], 'audio.webm', { type: 'audio/webm' }));
  formData.append('model', 'whisper-1'); // Default model, adjust as needed

  // Add default parameters
  formData.append('response_format', 'json');
  formData.append('timestamp_granularities', 'all');
  formData.append('prompt', 'Transcribe the following audio');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const jsonResponse = await response.json();
  if (jsonResponse.error) {
    throw new Error(jsonResponse.error.message);
  }

  const content = jsonResponse.text;
  console.log('fetchSTTResponse - Transcription response:', content);

  // Return the transcribed text
  return content;
}


function filterGPTMessages(conversation) {
  let lastMessageContent = '';
  return conversation.filter((message) => {
    const isGPT = !message.content.trim().toLowerCase().startsWith('image::') && !lastMessageContent.startsWith('image::');
    lastMessageContent = message.content.trim().toLowerCase();
    return isGPT;
  });
}

export function loadConversationTitles() {
  const storedConversations = localStorage.getItem('gpt-conversations');
  let parsedConversations = storedConversations ? JSON.parse(storedConversations) : [];
  return parsedConversations;
}

export function loadStoredConversations() {
  const storedConversations = localStorage.getItem('gpt-conversations');
  return storedConversations ? JSON.parse(storedConversations) : [];
}
