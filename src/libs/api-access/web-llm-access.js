import { showToast } from '../utils/general-utils';
import { updateUI } from '../utils/general-utils';
import { messages } from '../state-management/state';
import { addMessage } from '../conversation-management/message-processing';

export let engine = undefined;

export async function loadNewModel(modelName, updateUIFunc) {
  const initProgressCallback = (report) => {
    showToast(report.text);
  };

  if (engine !== undefined) {
    engine.unload();
    showToast('Model Unloaded');
  }

  const webllm = await import('@mlc-ai/web-llm');

  const chatOpts = {
    repetition_penalty: parseFloat(localStorage.getItem('repetitionPenalty') || 1.0),
    temperature: parseFloat(localStorage.getItem('local-attitude')) || 0.6,
    top_p: parseFloat(localStorage.getItem('top_P')) || 1.0,
    initProgressCallback: initProgressCallback,
  };

  engine = await webllm.CreateEngine(modelName, chatOpts);
  showToast('Model Loaded');
}

export async function sendBrowserLoadedModelMessage(messagesTest, updateUIFunc) {
  const initProgressCallback = (report) => {
    if (engine === undefined) {
      showToast(report.text);
      return;
    }
    updateUI(report.text, messages.value, addMessage, false, false);
  };

  const selectedModel = localStorage.getItem('browserModelSelection');

  if (engine === undefined) {
    const webllm = await import('@mlc-ai/web-llm');

    const chatOpts = {
      repetition_penalty: parseFloat(localStorage.getItem('repetitionPenalty') || 1.0),
      temperature: parseFloat(localStorage.getItem('local-attitude')) || 0.6,
      top_p: parseFloat(localStorage.getItem('top_P')) || 1.0,
      initProgressCallback: initProgressCallback,
    };

    engine = await webllm.CreateEngine(selectedModel, chatOpts);
    showToast('Model Loaded');
  }

  const filteredMessages = filterMessages(messages.value);

  const request = {
    stream: true,
    messages: filteredMessages,
    logprobs: true,
    top_logprobs: 2,
  };

  const asyncChunkGenerator = await engine.chat.completions.create(request);
  let message = '';
  for await (const chunk of asyncChunkGenerator) {
    if (chunk.choices[0].delta.content) {
      // Last chunk has undefined content
      message += chunk.choices[0].delta.content;
      updateUI(chunk.choices[0].delta.content, messages.value, addMessage, true);
    }
  }

  return await engine.getMessage();
}

export async function getBrowserLoadedModelConversationTitle(messages) {
  const initProgressCallback = (report) => { };

  const selectedModel = localStorage.getItem('browserModelSelection');

  if (engine === undefined) {
    const webllm = await import('@mlc-ai/web-llm');
    engine = await webllm.CreateEngine(selectedModel, {
      initProgressCallback: initProgressCallback,
    });
  }

  const filteredMessages = filterMessages(messages);

  let tempMessages = filteredMessages.slice(0);
  tempMessages.push({ role: 'user', content: 'Summarize my inital request or greeting in 5 words or less.' });

  const request = {
    stream: true,
    messages: tempMessages,
    logprobs: true,
    top_logprobs: 2,
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
