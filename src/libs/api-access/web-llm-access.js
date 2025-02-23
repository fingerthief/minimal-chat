import { showToast, updateUI } from '../utils/general-utils';
import { messages } from '../state-management/state';
import { addMessage } from '../conversation-management/message-processing';

export let engine = undefined;

const DEFAULT_REPETITION_PENALTY = 1.0;
const DEFAULT_TEMPERATURE = 0.6;
const DEFAULT_TOP_P = 1.0;

// Helper function to get a float value from local storage with a default
const getFloatFromLocalStorage = (key, defaultValue) => {
    const value = localStorage.getItem(key);
    return value ? parseFloat(value) : defaultValue;
};

// Helper function to extract text content from a message
const extractMessageContent = (message) => {
    if (Array.isArray(message.content)) {
        return message.content[0]?.text || '';
    } else {
        return message.content;
    }
};

// Helper function to filter messages for relevant content
const filterMessages = (messages) => {
    return messages.map((message) => ({
        role: message.role,
        content: extractMessageContent(message),
    }));
};

// Common function to initialize the WebLLM engine
async function initializeEngine(modelName, progressCallback) {
    const webllm = await import('@mlc-ai/web-llm');

    const chatOpts = {
        repetition_penalty: getFloatFromLocalStorage('repetitionPenalty', DEFAULT_REPETITION_PENALTY),
        temperature: getFloatFromLocalStorage('local-attitude', DEFAULT_TEMPERATURE),
        top_p: getFloatFromLocalStorage('top_P', DEFAULT_TOP_P),
        initProgressCallback: progressCallback,
    };

    return await webllm.CreateMLCEngine(modelName, chatOpts);
}

// Function to load a new model
export async function loadNewModel(modelName) {
    const initProgressCallback = (report) => {
        showToast(report.text);
    };

    if (engine !== undefined) {
        engine.unload();
        showToast('Model Unloaded');
    }

    try {
        engine = await initializeEngine(modelName, initProgressCallback);
        showToast('Model Loaded');
    } catch (error) {
        console.error("Error loading model:", error);
        showToast(`Error loading model: ${error.message}`); // Provide user feedback
        engine = undefined; // Ensure engine is undefined if loading fails
    }
}

// Function to send a message to the loaded model
export async function sendBrowserLoadedModelMessage() {
    const initProgressCallback = (report) => {
        if (engine === undefined) {
            showToast(report.text);
            return;
        }
        updateUI(report.text, messages.value, addMessage, false, false);
    };

    const selectedModel = localStorage.getItem('browserModelSelection')?.replace(/^"|"$/g, '');

    if (!selectedModel) {
        showToast("No browser model selected.");
        return;
    }

    if (engine === undefined) {
        try {
            engine = await initializeEngine(selectedModel, initProgressCallback);
            showToast('Model Loaded');
        } catch (error) {
            console.error("Error loading model:", error);
            showToast(`Error loading model: ${error.message}`);
            return;
        }
    }

    const filteredMessages = filterMessages(messages.value);

    const request = {
        stream: true,
        messages: filteredMessages,
        logprobs: true,
        top_logprobs: 2,
    };

    try {
        const asyncChunkGenerator = await engine.chat.completions.create(request);
        let message = '';

        for await (const chunk of asyncChunkGenerator) {
            if (chunk.choices[0].delta.content) {
                message += chunk.choices[0].delta.content;
                updateUI(chunk.choices[0].delta.content, messages.value, addMessage, true);
            }
        }

        return await engine.getMessage();
    } catch (error) {
        console.error("Error during message sending:", error);
        showToast(`Error during message sending: ${error.message}`);
        return null; // Or throw, depending on your error handling strategy
    }
}

// Function to get a conversation title from the loaded model
export async function getBrowserLoadedModelConversationTitle() {
    const initProgressCallback = (report) => { };

    const selectedModel = localStorage.getItem('browserModelSelection');

    if (!selectedModel) {
        showToast("No browser model selected.");
        return null;
    }

    if (engine === undefined) {
        try {
            engine = await initializeEngine(selectedModel, initProgressCallback);
        } catch (error) {
            console.error("Error loading model:", error);
            showToast(`Error loading model: ${error.message}`);
            return null;
        }
    }

    const filteredMessages = filterMessages(messages.value);

    let tempMessages = filteredMessages.slice(0);
    tempMessages.push({ role: 'user', content: 'Summarize my inital request or greeting in 5 words or less.' });

    const request = {
        stream: true,
        messages: tempMessages,
        logprobs: true,
        top_logprobs: 2,
    };

    try {
        const asyncChunkGenerator = await engine.chat.completions.create(request);
        let message = '';

        for await (const chunk of asyncChunkGenerator) {
            if (chunk.choices[0].delta.content) {
                message += chunk.choices[0].delta.content;
            }
        }

        return await engine.getMessage();
    } catch (error) {
        console.error("Error during title generation:", error);
        showToast(`Error during title generation: ${error.message}`);
        return null;
    }
}