import { fetchGPTVisionResponse } from './gpt-api-access.js';
import { fetchClaudeVisionResponse } from './claude-api-access.js';
import { fetchOpenAiLikeVisionResponse } from './open-ai-api-standard-access.js';

// Encode image as base64
async function encodeImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Get string after comma
function getStringAfterComma(str) {
    const [_, ...rest] = str.split(',');
    return rest.join(',');
}

// Get string after comma
function filterGPTMessages(conversation) {
    let lastMessageContent = '';
    return conversation.filter((message) => {
        const isGPT = !message.content.trim().toLowerCase().startsWith('image::') && !lastMessageContent.startsWith('image::');
        lastMessageContent = message.content.trim().toLowerCase();
        return isGPT;
    });
}

// Format messages for vision
function formatMessagesForVision(messages) {
    return messages.map((message) => ({
        type: 'text',
        text: message.content
    }));
}

// Analyze image
export async function analyzeImage(file, fileType, messages, model, localModelName, localModelEndpoint) {
    const base64Image = await encodeImage(file);
    const gptMessagesOnly = filterGPTMessages(messages);
    const visionFormattedMessages = formatMessagesForVision(gptMessagesOnly);

    if (model.indexOf('gpt') !== -1) {
        visionFormattedMessages.push({
            type: 'image_url',
            image_url: { url: base64Image }
        });

        return await fetchGPTVisionResponse(visionFormattedMessages, localStorage.getItem('gptKey'));
    }

    if (model.indexOf('claude') !== -1) {
        visionFormattedMessages.push({
            type: 'image',
            source: {
                type: 'base64',
                media_type: fileType,
                data: getStringAfterComma(base64Image)
            }
        });

        return await fetchClaudeVisionResponse(visionFormattedMessages, localStorage.getItem('claudeKey'), model);
    }

    if (model.indexOf('open-ai-format') !== -1) {
        visionFormattedMessages.push({
            type: 'image_url',
            image_url: { url: base64Image }
        });

        return await fetchOpenAiLikeVisionResponse(visionFormattedMessages, localStorage.getItem('localModelKey'), localModelName, localModelEndpoint);
    }

    return 'not implemented for selected model';
}
