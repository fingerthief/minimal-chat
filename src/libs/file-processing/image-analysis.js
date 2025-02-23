import { fetchGPTVisionResponse } from '../api-access/gpt-api-access.js';
import { fetchClaudeVisionResponse } from '../api-access/claude-api-access.js';
import { fetchOpenAiLikeVisionResponse } from '../api-access/open-ai-api-standard-access.js';
import { messages, selectedModel } from '../state-management/state.js';
import { addMessage } from '../conversation-management/message-processing.js';
import { storeFile } from '../utils/indexed-db-utils.js';

// Helper functions
const encodeImageToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const extractBase64Data = (base64String) => {
    const [_, ...rest] = base64String.split(',');
    return rest.join(',');
};

const formatMessagesForVisionAPI = (messageHistory, base64Image, lastMessageText) => {
    const formattedMessages = messageHistory.map(message => ({
        role: message.role,
        content: message.content,
    }));
    formattedMessages.pop(); // Remove last message as it will be added with image

    return formattedMessages;
};

const createGPTVisionMessage = (base64Image, lastMessageText) => ({
    role: 'user',
    content: [
        {
            type: 'image_url',
            image_url: { url: base64Image },
        },
        {
            type: "text",
            text: lastMessageText
        }
    ],
});

const createClaudeVisionMessage = (base64Image, fileType) => ({
    role: 'user',
    content: [
        {
            type: 'image',
            source: {
                type: 'base64',
                media_type: fileType,
                data: extractBase64Data(base64Image),
            },
        },
    ],
});

// Main functions
export const storeFileData = async (fileName, fileData, fileSize, fileType) => {
    try {
        const fileId = await storeFile(fileName, fileData, fileSize, fileType);
        console.log(`File stored successfully with ID: ${fileId}`);
        return fileId;
    } catch (error) {
        console.error('Error storing file data:', error);
        throw error;
    }
};

export async function analyzeImage(file, fileType, messages2, model, localModelName, localModelEndpoint) {
    // Encode and store image
    const base64Image = await encodeImageToBase64(file);
    await storeFileData(file.name, base64Image, file.size, file.type);

    const lastMessageText = messages.value[messages.value.length - 1].content[0].text;
    const formattedMessages = formatMessagesForVisionAPI(messages.value, base64Image, lastMessageText);

    // Handle different model types
    if (model.includes('gpt') || selectedModel.value.includes('open-ai-format')) {
        const visionMessage = createGPTVisionMessage(base64Image, lastMessageText);
        formattedMessages.push(visionMessage);

        // Update message history
        messages.value.pop();
        addMessage("user", visionMessage.content);

        if (selectedModel.value.includes("gpt")) {
            return await fetchGPTVisionResponse(formattedMessages, localStorage.getItem('gptKey'));
        }
        return await fetchOpenAiLikeVisionResponse(formattedMessages, localStorage.getItem('localModelKey'), localModelName, localModelEndpoint);
    }

    if (model.includes('claude')) {
        formattedMessages.push(createClaudeVisionMessage(base64Image, fileType));
        return await fetchClaudeVisionResponse(formattedMessages, localStorage.getItem('claudeKey'), model);
    }

    if (model.includes('open-ai-format')) {
        formattedMessages.push(createGPTVisionMessage(base64Image, lastMessageText));
        return await fetchOpenAiLikeVisionResponse(formattedMessages, localStorage.getItem('localModelKey'), localModelName, localModelEndpoint);
    }

    return 'not implemented for selected model';
}