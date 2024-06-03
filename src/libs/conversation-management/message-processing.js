// message-sending.js

import { ref } from 'vue';
import { streamClaudeResponse } from '@/libs/api-access/claude-api-access';
import { showToast } from '@/libs/utils/general-utils';
import { sendBrowserLoadedModelMessage } from '@/libs/api-access/web-llm-access';
import { fetchLocalModelResponseStream } from '../api-access/open-ai-api-standard-access';
import { fetchGPTResponseStream, generateDALLEImage } from '../api-access/gpt-api-access';
import { setSystemPrompt } from './conversations-management';
import { systemPrompt, messages } from '../state-management/state';
const isLoading = ref(false);
const abortController = ref(null);

export async function sendMessage(
  event,
  userText,
  messages,
  selectedModel,
  claudeSliderValue,
  sliderValue,
  localModelName,
  localSliderValue,
  localModelEndpoint,
  updateUI,
  addMessage,
  saveMessagesHandler,
  imageInputElement,
  customEndpointDetails = {}
) {
  try {
    const messageText = userText.trim();

    if (userText.trim().length === 0) {
      showToast('Please Enter a Prompt First');
      return;
    }

    addMessage('user', [
      { type: 'text', text: messageText }
    ]);

    if (selectedModel && selectedModel.indexOf('claude') !== -1) {
      await sendClaudeMessage(messageText, messages, selectedModel, claudeSliderValue, updateUI, imageInputElement);
      return;
    }

    userText = '';

    if (!messageText || messageText === '' || isLoading.value) {
      return;
    }

    isLoading.value = true;

    if (messageText.toLowerCase().startsWith('image::')) {
      await sendImagePrompt(messageText, addMessage);
      return;
    }

    if (messageText.toLowerCase().startsWith('add image to conversation:: done')) {
      await sendVisionPrompt(imageInputElement);
      return;
    }

    if (selectedModel && selectedModel.indexOf('web-llm') !== -1) {
      await sendBrowserModelMessage(messages, updateUI);
      return;
    }

    await sendGPTMessage(messages, selectedModel, sliderValue, localModelName, localSliderValue, localModelEndpoint, updateUI, customEndpointDetails);
  } finally {
    await saveMessagesHandler();
    isLoading.value = false;
  }
}

export async function sendClaudeMessage(messageText, messages, selectedModel, claudeSliderValue, updateUI, imageInputElement) {
  if (messageText.toLowerCase().startsWith('add image to conversation:: done')) {
    isLoading.value = true;

    await sendVisionPrompt(imageInputElement);
    isLoading.value = false;
    return;
  }

  abortController.value = new AbortController();

  await streamClaudeResponse(messages, selectedModel, claudeSliderValue, updateUI, abortController.value);
}

export async function sendGPTMessage(messages, selectedModel, sliderValue, localModelName, localSliderValue, localModelEndpoint, updateUI, customEndpointDetails = {}) {
  try {
    abortController.value = new AbortController();

    if ((selectedModel && selectedModel.indexOf('open-ai-format') !== -1) || customEndpointDetails.type) {
      const {
        url = localModelEndpoint,
        type = selectedModel,
        apiKey = customEndpointDetails.apiKey || localStorage.getItem('apiKey'),
        model = customEndpointDetails.name || localModelName
      } = customEndpointDetails;

      // Convert additionalParams to dynamicParams
      const dynamicParams = customEndpointDetails.additionalParams.reduce((acc, param) => {
        let value = param.defaultValue;
        switch (param.type) {
          case 'int':
            value = parseInt(param.defaultValue);
            break;
          case 'float':
            value = parseFloat(param.defaultValue);
            break;
          case 'string':
            value = param.defaultValue;
            break;
        }
        acc[param.key] = value;
        return acc;
      }, {});

      await fetchLocalModelResponseStream(messages, sliderValue, model, url, updateUI, abortController.value, {
        apiKey,
        dynamicParams
      });
    } else {
      await fetchGPTResponseStream(messages, sliderValue, selectedModel, updateUI, abortController.value);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

export async function sendBrowserModelMessage(messages, updateUI) {
  await sendBrowserLoadedModelMessage(messages, updateUI);
}

export async function addMessage(role, content) {
  setSystemPrompt(messages.value, systemPrompt.value);

  const maxId = messages.value.reduce((max, message) => Math.max(max, message.id), 0);
  const newMessageId = maxId + 1;

  const newMessage = {
    id: newMessageId,
    role,
    content: Array.isArray(content) ? content : [{ type: 'text', text: content }],
  };

  messages.value.push(newMessage);
}

export async function sendVisionPrompt(imageInputElement) {
  imageInputElement.click();
}

export async function sendImagePrompt(imagePrompt, addMessage) {
  const response = await generateDALLEImage(imagePrompt.toLowerCase().split('image::')[1]);

  let imageURLStrings = `${imagePrompt.toLowerCase().split('image::')[1]} \n\n`;

  for (const image of response.data) {
    imageURLStrings += `![${imagePrompt.toLowerCase().split('image::')[1]}](${image.url}) \n`;
  }

  addMessage('assistant', imageURLStrings);
}

export async function visionimageUploadClick(
  userText,
  messages,
  selectedModel,
  claudeSliderValue,
  sliderValue,
  localModelName,
  localSliderValue,
  localModelEndpoint,
  updateUIWrapper,
  addMessage,
  saveMessagesHandler,
  imageInput,
  customEndpointDetails = {}  // Added custom endpoint details parameter
) {
  userText.value = 'Add Image To Conversation:: Done ' + userText.value;
  await sendMessage(
    null,
    userText.value,
    messages.value,
    selectedModel.value,
    claudeSliderValue.value,
    sliderValue.value,
    localModelName.value,
    localSliderValue.value,
    localModelEndpoint.value,
    updateUIWrapper,
    addMessage,
    saveMessagesHandler,
    imageInput.value,
    customEndpointDetails  // Pass the custom endpoint details
  );
}