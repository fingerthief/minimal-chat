import * as webllm from '@mlc-ai/web-llm';
import { showToast } from './utils';

export let engine = undefined;

export async function loadNewModel(modelName, updateUI) {
    const initProgressCallback = (report) => {
        updateUI(report.text, false, false);
    };

    if (engine !== undefined) {
        engine.unload();
        showToast('Model Unloaded');
    }

    const chatOpts = {
        repetition_penalty: parseFloat(localStorage.getItem('repetitionPenalty') || 1.0),
        temperature: parseFloat(localStorage.getItem('local-attitude')) || 0.6,
        top_p: parseFloat(localStorage.getItem('top_P')) || 1.0,
        initProgressCallback: initProgressCallback
    };

    engine = await webllm.CreateEngine(modelName, chatOpts);
    showToast('Model Loaded');
}

export async function sendBrowserLoadedModelMessage(messages, updateUI) {
    const initProgressCallback = (report) => {
        updateUI(report.text, false, false);
    };

    const selectedModel = localStorage.getItem('browserModelSelection');

    if (engine === undefined) {
        const chatOpts = {
            repetition_penalty: parseFloat(localStorage.getItem('repetitionPenalty') || 1.0),
            temperature: parseFloat(localStorage.getItem('local-attitude')) || 0.6,
            top_p: parseFloat(localStorage.getItem('top_P')) || 1.0,
            initProgressCallback: initProgressCallback
        };

        engine = await webllm.CreateEngine(selectedModel, chatOpts);
        showToast('Model Loaded');
    }

    const filteredMessages = filterMessages(messages);

    const request = {
        stream: true,
        messages: filteredMessages,
        logprobs: true,
        top_logprobs: 2
    };

    const asyncChunkGenerator = await engine.chat.completions.create(request);
    let message = '';
    for await (const chunk of asyncChunkGenerator) {
        if (chunk.choices[0].delta.content) {
            // Last chunk has undefined content
            message += chunk.choices[0].delta.content;
        }

        updateUI(message, true, false);
    }

    return await engine.getMessage();
}

export async function getBrowserLoadedModelConversationTitle(messages) {
    const initProgressCallback = (report) => {};

    const selectedModel = localStorage.getItem('browserModelSelection');

    if (engine === undefined) {
        engine = await webllm.CreateEngine(selectedModel, {
            initProgressCallback: initProgressCallback
        });
    }

    const filteredMessages = filterMessages(messages);

    let tempMessages = filteredMessages.slice(0);
    tempMessages.push({ role: 'user', content: 'Summarize my inital request or greeting in 5 words or less.' });

    const request = {
        stream: true,
        messages: tempMessages,
        logprobs: true,
        top_logprobs: 2
    };

    const asyncChunkGenerator = await engine.chat.completions.create(request);
    let message = '';

    for await (const chunk of asyncChunkGenerator) {
        if (chunk.choices[0].delta.content) {
            // Last chunk has undefined content
            message += chunk.choices[0].delta.content;
        }
    }

    return await engine.getMessage();
}

function filterMessages(conversation) {
    let lastMessageContent = '';
    return conversation.filter((message) => {
        const isGPT = !message.content.trim().toLowerCase().startsWith('image::') && !lastMessageContent.startsWith('image::');
        lastMessageContent = message.content.trim().toLowerCase();
        return isGPT;
    });
}
