import { showToast, sleep, parseStreamResponseChunk } from '../utils/general-utils';
import { updateUI } from '../utils/general-utils';
import { messages, localModelKey } from '../state-management/state';
import { addMessage } from '../conversation-management/message-processing';

// Constants
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.25;
const MAX_RETRY_ATTEMPTS = 3;
const TITLE_MAX_TOKENS = 18;
const DEFAULT_IMAGE_COUNT = 2;
const DEFAULT_IMAGE_SIZE = '256x256';

// Retry counters
const retryCounters = {
    stream: 0,
    vision: 0,
    imageGen: 0,
    title: 0
};

// Helper Functions
const createRequestHeaders = (apiKey = localStorage.getItem('localModelKey')) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey || 'No Key Provided'}`
});

const createMessagePayload = (messages, model, options = {}) => {
    const basePayload = {
        model,
        messages,
        stream: options.stream || false,
    };

    const standardPayload = {
        ...basePayload,
        temperature: options.temperature || DEFAULT_TEMPERATURE,
        max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS
    };

    const reasoningPayload = {
        ...basePayload,
        reasoning_effort: "high"
    };

    return model.includes('o1') || model.includes('o3')
        ? reasoningPayload
        : standardPayload;
};

async function handleStreamResponse(response, updateUiFunction, autoScrollToBottom = true) {
    let decodedResult = '';
    const reader = await response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
        const { done, value } = await reader.read();
        if (done) return decodedResult;

        const chunk = decoder.decode(value);
        const parsedLines = parseStreamResponseChunk(chunk);

        for (const { choices: [{ delta: { content } }] } of parsedLines) {
            if (content) {
                decodedResult += content;
                if (updateUiFunction) {
                    updateUI(content, messages.value, addMessage, autoScrollToBottom);
                }
            }
        }
    }
}

async function handleRetry(operation, retryCounter, errorMessage) {
    if (retryCounter < MAX_RETRY_ATTEMPTS) {
        retryCounter++;
        showToast(`${errorMessage} Retrying...Attempt #${retryCounter}`);
        await sleep(1000);
        return true;
    }
    return false;
}

// Main Export Functions
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
    const tempMessages = conversation.map(({ role, content }) => ({ role, content }));
    const payload = createMessagePayload(tempMessages, model, {
        stream: true,
        temperature: parseFloat(attitude),
        maxTokens: parseInt(localStorage.getItem('maxTokens') || DEFAULT_MAX_TOKENS)
    });

    try {
        const response = await fetch(`${localModelEndpoint}/v1/chat/completions`, {
            method: 'POST',
            headers: createRequestHeaders(),
            body: JSON.stringify(payload),
            signal: abortController.signal
        });

        const result = await handleStreamResponse(response, updateUiFunction, autoScrollToBottom);
        retryCounters.stream = 0;
        return result;
    } catch (error) {
        if (error.name === 'AbortError') {
            showToast('Stream Request Aborted.');
            return;
        }
        console.error('Error fetching Custom Model response:', error);
        showToast('Stream Request Failed.');
    }
}

export async function fetchOpenAiLikeVisionResponse(visionMessages, apiKey, model, localModelEndpoint) {
    const payload = createMessagePayload(visionMessages, model);

    try {
        const response = await fetch(`${localModelEndpoint}/v1/chat/completions`, {
            method: 'POST',
            headers: createRequestHeaders(apiKey),
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        retryCounters.vision = 0;
        return data.choices[0].message.content;
    } catch (error) {
        if (await handleRetry(
            () => fetchOpenAiLikeVisionResponse(visionMessages, apiKey, model, localModelEndpoint),
            retryCounters.vision,
            'Failed fetchOpenAiLikeVisionResponse Request.'
        )) {
            return fetchOpenAiLikeVisionResponse(visionMessages, apiKey, model, localModelEndpoint);
        }
    }
}

export async function customModelImageGeneration(conversation, localModelEndpoint, model) {
    try {
        const response = await fetch(`${localModelEndpoint}/v1/images/generations`, {
            method: 'POST',
            model,
            quality: 'hd',
            headers: createRequestHeaders(),
            body: JSON.stringify({
                prompt: conversation,
                n: parseInt(localStorage.getItem('selectedDallEImageCount')) || DEFAULT_IMAGE_COUNT,
                size: localStorage.getItem('selectedDallEImageResolution') || DEFAULT_IMAGE_SIZE,
            }),
        });

        const result = await response.json();

        if (result.data?.length > 0) {
            retryCounters.imageGen = 0;
            return result;
        }
        return "I'm sorry, I couldn't generate an image. The prompt may not be allowed by the API.";
    } catch (error) {
        if (await handleRetry(
            () => customModelImageGeneration(conversation, localModelEndpoint, model),
            retryCounters.imageGen,
            'Failed customModelImageGeneration Request.'
        )) {
            return customModelImageGeneration(conversation, localModelEndpoint, model);
        }
        showToast('Retry Attempts Failed for customModelImageGeneration Request.');
        console.error('Error fetching image generation response:', error);
        return 'An error generating Custom Model Image.';
    }
}

export async function getConversationTitleFromLocalModel(messages, model, localModelEndpoint) {
    try {
        const tempMessages = [...messages, {
            role: 'user',
            content: 'Summarize my inital request or greeting in 5 words or less.'
        }];

        const payload = createMessagePayload(tempMessages, model, {
            stream: true,
            temperature: 0.25,
            maxTokens: TITLE_MAX_TOKENS
        });

        const response = await fetch(`${localModelEndpoint}/v1/chat/completions`, {
            method: 'POST',
            headers: createRequestHeaders(),
            body: JSON.stringify(payload)
        });

        const result = await handleStreamResponse(response);
        retryCounters.title = 0;
        return result;
    } catch (error) {
        if (await handleRetry(
            () => getConversationTitleFromLocalModel(messages, model, localModelEndpoint),
            retryCounters.title,
            'Failed to generate conversation title.'
        )) {
            return getConversationTitleFromLocalModel(messages, model, localModelEndpoint);
        }
        console.error('Error fetching Local Model response:', error);
        return 'An error occurred while generating conversation title.';
    }
}

export async function getOpenAICompatibleAvailableModels(localModelEndpoint) {
    try {
        const response = await fetch(`${localModelEndpoint}/v1/models`, {
            method: 'GET',
            headers: createRequestHeaders(localModelKey.value)
        });

        const data = await response.json();

        if (data?.data || Array.isArray(data)) {
            const modelList = data.data || data;
            return modelList.map(model => ({
                name: model.name || model.id,
                id: model.id
            }));
        }

        throw new Error('Invalid response format');
    } catch (error) {
        showToast('Error fetching models, double check the API endpoint configured');
        console.error('Error fetching available models:', error);
        return [];
    }
}