import { showToast, sleep, parseStreamResponseChunk, handleTextStreamEnd } from '../utils/general-utils';
import { updateUI } from '../utils/general-utils';
import { playAudio } from '../utils/audio-utils';
import { getCompleteSentences } from '../utils/sentence-utils';
import { whisperTemperature, audioSpeed, ttsModel, ttsVoice, messages, isInteractModeOpen } from '../state-management/state';

import { addMessage } from '../conversation-management/message-processing';
const MAX_RETRY_ATTEMPTS = 5;
let gptVisionRetryCount = 0;
let dalleRetryCount = 0;

export async function fetchGPTVisionResponse(visionMessages, apiKey) {
  const payload = {
    model: localStorage.getItem('selectedModel') || 'gpt-4-turbo',
    messages: visionMessages,
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
    showToast(`Request Failed for fetchGPTVisionResponse.`);
    return 'Error generating GPT Vision response.';
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
  let tempMessages = conversation.map((message) => ({
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

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
    const result = await readResponseStream(response, updateUiFunction, autoScrollToBottom);
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
  let buffer = '';
  let processedSentences = new Set();

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
        buffer += content;
        decodedResult += content;

        updateUI(content, messages.value, addMessage, autoScrollToBottom);

        if (isInteractModeOpen.value) {
          const sentences = getCompleteSentences(buffer);

          for (const sentence of sentences) {
            if (!processedSentences.has(sentence) && sentence.length <= 4096) {
              processedSentences.add(sentence);
              try {
                await fetchTTSResponse(sentence);
              } catch (error) {
                console.error('Error fetching TTS response:', error);
              }
            }
          }
          buffer = buffer.slice(sentences.join('').length);
        }
      }
    }
  }

  // Process any remaining content in the buffer
  if (buffer.length > 0 && isInteractModeOpen.value) {
    const sentences = getCompleteSentences(buffer);
    for (const sentence of sentences) {
      if (!processedSentences.has(sentence) && sentence.length <= 4096) {
        processedSentences.add(sentence);
        try {
          await fetchTTSResponse(sentence);
        } catch (error) {
          console.error('Error fetching TTS response:', error);
        }
      }
    }
  }

  return decodedResult;
}

// TTS function
export async function fetchTTSResponse(text) {
  const apiKey = localStorage.getItem('gptKey');

  if (!apiKey) {
    throw new Error('API key not found');
  }

  try {
    if (text.length > 4096) {
      console.error(`[TTS]: Input text exceeds 4096 characters.`);
      return;
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: ttsModel.value,
        input: text,
        voice: ttsVoice.value,
        speed: audioSpeed.value
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error from TTS API: ${errorText}`);
    }

    const audioBlob = await response.blob();
    playAudio(audioBlob);
  } catch (error) {
    console.error(`[TTS]: Error fetching TTS response: ${error.message}`);
  }
}

export async function fetchSTTResponse(file, mimeType) {
  const apiKey = localStorage.getItem('gptKey');

  if (!apiKey) {
    throw new Error('API key not found');
  }

  const formData = new FormData();

  // Append the file with the appropriate format
  const fileExtension = mimeType.includes("/") ? mimeType.split('/')[1] : mimeType;
  formData.append('file', new File([file], `audio.${fileExtension}`, { type: fileExtension }));

  const whisperParams = {
    model_size: "large",
    model: 'whisper-1',
    language: "en",
    temperature: whisperTemperature.value,
    beam_size: 5,
    best_of: 5,
    prompt: "Transcribe the following audio accurately",
    suppress_tokens: [],
    condition_on_previous_text: true,
    log_probability: false,
    timestamps: true,
    max_tokens: null,
    no_repeat_ngram_size: 3,
    timestamp_granularities: 'all',
    response_format: 'json'
  };

  // Append each parameter to formData
  for (const [key, value] of Object.entries(whisperParams)) {
    formData.append(key, value);
  }

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
