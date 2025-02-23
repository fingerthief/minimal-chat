// message-processing.js

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

// Constants for special message prefixes
const IMAGE_PROMPT_PREFIX = 'image::';
const ADD_IMAGE_TO_CONVERSATION_PREFIX = 'add image to conversation:: done';

/**
 * Sends a message to the selected model and updates the UI.
 *
 * @param {Event} event - The event that triggered the message send (optional).
 * @param {string} userText - The text entered by the user.
 * @param {Array} messages - The array of messages in the conversation.
 * @param {string} selectedModel - The identifier of the selected model.
 * @param {number} claudeSliderValue - The value of the Claude slider (if applicable).
 * @param {number} sliderValue - The value of the general slider (if applicable).
 * @param {string} localModelName - The name of the local model (if applicable).
 * @param {number} localSliderValue - The value of the local model slider (if applicable).
 * @param {string} localModelEndpoint - The endpoint of the local model (if applicable).
 * @param {function} updateUI - A function to update the UI with new messages.
 * @param {function} addMessage - A function to add a new message to the conversation.
 * @param {function} saveMessagesHandler - A function to save the conversation messages.
 * @param {HTMLInputElement} imageInputElement - The file input element for image uploads.
 */
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
    imageInputElement
) {
    try {
        const messageText = userText.trim();

        if (messageText.length === 0) {
            showToast('Please Enter a Prompt First');
            return;
        }

        addMessage('user', [{ type: 'text', text: messageText }]);

        if (selectedModel.includes('claude')) {
            await handleClaudeMessage(messageText, messages, selectedModel, claudeSliderValue, updateUI, imageInputElement);
            return;
        }

        // Reset userText (assuming it's bound to an input field)
        userText = '';

        if (isLoading.value) {
            return;
        }

        isLoading.value = true;

        if (messageText.toLowerCase().startsWith(IMAGE_PROMPT_PREFIX)) {
            await handleImagePrompt(messageText, addMessage);
            return;
        }

        if (messageText.toLowerCase().startsWith(ADD_IMAGE_TO_CONVERSATION_PREFIX)) {
            await handleVisionPrompt(imageInputElement);
            return;
        }

        if (selectedModel.includes('web-llm')) {
            await handleBrowserModelMessage(messages, updateUI);
            return;
        }

        await handleGPTMessage(messages, selectedModel, sliderValue, localModelName, localSliderValue, localModelEndpoint, updateUI);
    } finally {
        await saveMessagesHandler();
        isLoading.value = false;
    }
}

/**
 * Handles sending a message to a Claude model.
 *
 * @param {string} messageText - The text of the message.
 * @param {Array} messages - The array of messages in the conversation.
 * @param {string} selectedModel - The identifier of the selected Claude model.
 * @param {number} claudeSliderValue - The value of the Claude slider.
 * @param {function} updateUI - A function to update the UI with new messages.
 * @param {HTMLInputElement} imageInputElement - The file input element for image uploads.
 */
async function handleClaudeMessage(messageText, messages, selectedModel, claudeSliderValue, updateUI, imageInputElement) {
    if (messageText.toLowerCase().startsWith(ADD_IMAGE_TO_CONVERSATION_PREFIX)) {
        isLoading.value = true;
        await handleVisionPrompt(imageInputElement);
        isLoading.value = false;
        return;
    }

    abortController.value = new AbortController();
    await streamClaudeResponse(messages, selectedModel, claudeSliderValue, updateUI, abortController.value);
}

/**
 * Handles sending a message to a GPT model (either OpenAI or local).
 *
 * @param {Array} messages - The array of messages in the conversation.
 * @param {string} selectedModel - The identifier of the selected GPT model.
 * @param {number} sliderValue - The value of the general slider.
 * @param {string} localModelName - The name of the local model (if applicable).
 * @param {number} localSliderValue - The value of the local model slider (if applicable).
 * @param {string} localModelEndpoint - The endpoint of the local model (if applicable).
 * @param {function} updateUI - A function to update the UI with new messages.
 */
async function handleGPTMessage(messages, selectedModel, sliderValue, localModelName, localSliderValue, localModelEndpoint, updateUI) {
    try {
        abortController.value = new AbortController();

        if (selectedModel.includes('open-ai-format')) {
            // Retrieve local model settings from localStorage
            localModelName = localStorage.getItem('localModelName') || '';
            localSliderValue = localStorage.getItem('local-attitude') || 0.6;
            localModelEndpoint = localStorage.getItem('localModelEndpoint') || '';

            await fetchLocalModelResponseStream(messages, localSliderValue, localModelName, localModelEndpoint, updateUI, abortController.value);
        } else {
            await fetchGPTResponseStream(messages, sliderValue, selectedModel, updateUI, abortController.value);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

/**
 * Handles sending a message to a browser-based model.
 *
 * @param {Array} messages - The array of messages in the conversation.
 * @param {function} updateUI - A function to update the UI with new messages.
 */
async function handleBrowserModelMessage(messages, updateUI) {
    await sendBrowserLoadedModelMessage(messages, updateUI);
}

/**
 * Adds a new message to the conversation.
 *
 * @param {string} role - The role of the message sender ('user' or 'assistant').
 * @param {string|Array} content - The content of the message (either a string or an array of content objects).
 */
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

/**
 * Triggers a click event on the image input element to open the file selection dialog.
 *
 * @param {HTMLInputElement} imageInputElement - The file input element.
 */
async function handleVisionPrompt(imageInputElement) {
    imageInputElement.click();
}

/**
 * Generates an image using the DALL-E API based on the user's prompt.
 *
 * @param {string} imagePrompt - The prompt for the image generation.
 * @param {function} addMessage - A function to add the generated image URL to the conversation.
 */
async function handleImagePrompt(imagePrompt, addMessage) {
    const promptText = imagePrompt.toLowerCase().split(IMAGE_PROMPT_PREFIX)[1];
    const response = await generateDALLEImage(promptText);

    let imageURLStrings = `${promptText} \n\n`;

    for (const image of response.data) {
        imageURLStrings += `![${promptText}](${image.url}) \n`;
    }

    addMessage('assistant', imageURLStrings);
}

/**
 * Handles the click event for uploading a vision image.
 *
 * @param {ref<string>} userText - A Vue ref containing the user's text input.
 * @param {ref<Array>} messages - A Vue ref containing the conversation messages.
 * @param {ref<string>} selectedModel - A Vue ref containing the selected model.
 * @param {ref<number>} claudeSliderValue - A Vue ref containing the Claude slider value.
 * @param {ref<number>} sliderValue - A Vue ref containing the general slider value.
 * @param {ref<string>} localModelName - A Vue ref containing the local model name.
 * @param {ref<number>} localSliderValue - A Vue ref containing the local slider value.
 * @param {ref<string>} localModelEndpoint - A Vue ref containing the local model endpoint.
 * @param {function} updateUIWrapper - A function to update the UI.
 * @param {function} addMessage - A function to add a message to the conversation.
 * @param {function} saveMessagesHandler - A function to save the conversation messages.
 * @param {ref<HTMLInputElement>} imageInput - A Vue ref containing the image input element.
 */
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
    imageInput
) {
    userText.value = `${ADD_IMAGE_TO_CONVERSATION_PREFIX} ${userText.value}`;
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
        imageInput.value
    );
}