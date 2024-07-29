import { fetchGPTResponseStream } from '../api-access/gpt-api-access';
import { fetchLocalModelResponseStream, getConversationTitleFromLocalModel } from '../api-access/open-ai-api-standard-access';
import { streamClaudeResponse, fetchClaudeConversationTitle } from '../api-access/claude-api-access';
import { sendBrowserLoadedModelMessage, getBrowserLoadedModelConversationTitle } from '../api-access/web-llm-access';
import { getConversationTitleFromGPT } from '@/libs/utils/general-utils';
import { conversations, messages, selectedConversation, lastLoadedConversationId } from '../state-management/state';

export async function createNewConversationWithTitle(messages, selectedModel, localModelName, localModelEndpoint, sliderValue) {
  if (selectedModel.indexOf('claude') !== -1) {
    return await fetchClaudeConversationTitle(messages);
  }

  if (selectedModel.indexOf('open-ai-format') !== -1) {
    return await getConversationTitleFromLocalModel(messages, localModelName, localModelEndpoint);
  }

  if (selectedModel.indexOf('gpt') !== -1) {
    return await getConversationTitleFromGPT(messages, selectedModel, sliderValue);
  }

  if (selectedModel.indexOf('web-llm') !== -1) {
    return await getBrowserLoadedModelConversationTitle(messages);
  }

  return 'Error Generating Title';
}

export function createConversation(conversations, title, messages) {
  const maxId = conversations.length > 0 ? Math.max(...conversations.map((c) => c.id)) : 0;
  const newId = maxId + 1;

  const newConversation = {
    title: title,
    id: newId,
    messageHistory: messages,
  };

  conversations.push(newConversation);
  return conversations;
}

export function updateConversation(conversations, id, updatedConversation) {
  const index = conversations.findIndex((conversation) => conversation.id === id);
  if (index !== -1) {
    conversations[index] = { ...conversations[index], ...updatedConversation };
  }
  return conversations;
}

export function deleteConversation(conversations, id) {
  return conversations.filter((conversation) => conversation.id !== id);
}

export async function saveMessages() {
  const updatedConversation = selectedConversation.value;

  if (!selectedConversation || selectedConversation.value === null || !conversations.value.length) {

    if (messages.value.length === 0) {
      localStorage.setItem('gpt-conversations', JSON.stringify(conversations.value));
      selectedConversation.value = [];
      return;
    }

    const title = await createNewConversationWithTitle(
      messages.value,
      localStorage.getItem('selectedModel') || 'gpt-4o',
      localStorage.getItem('localModelName') || '',
      localStorage.getItem('localModelEndpoint') || '',
      localStorage.getItem('gpt-attitude') || 50
    );
    const uniqueMessages = createUniqueMessagesWithIds(messages.value);

    const updatedConversations = createConversation(conversations.value, title, uniqueMessages);

    messages.value = uniqueMessages;

    conversations.value = updatedConversations;

    lastLoadedConversationId.value = updatedConversations[updatedConversations.length - 1].id;
    localStorage.setItem('lastConversationId', lastLoadedConversationId.value);

    localStorage.setItem('gpt-conversations', JSON.stringify(conversations.value));
    selectedConversation.value = conversations.value[conversations.value.length - 1];
    return;
  }

  updatedConversation.messageHistory = messages.value;

  const result = updateConversation(conversations.value, updatedConversation.id, updatedConversation);

  conversations.value = result;

  localStorage.setItem('gpt-conversations', JSON.stringify(conversations.value));

  selectedConversation.value = conversations.value[conversations.value.length - 1];
}

export function selectConversation(conversations, conversationId, messages, lastLoadedConversationId, showToast) {
  if (!conversations.length) {
    return { conversations, messages, selectedConversation: null, lastLoadedConversationId };
  }

  const conversation = conversations.find((c) => c.id === conversationId);

  if (conversation) {
    lastLoadedConversationId = conversationId;
    localStorage.setItem('lastConversationId', lastLoadedConversationId);

    let maxId = messages.reduce((max, message) => (message.id ? Math.max(max, message.id) : max), 0);

    // Process each message to ensure it has a unique ID
    const processedMessages = conversation.messageHistory.map((message) => {
      if (!message.id) {
        maxId++; // Increment maxId to ensure a unique ID
        return { ...message, id: maxId }; // Assign the new ID
      }
      return message;
    });

    messages = processedMessages;

    return { conversations, messages, selectedConversation: conversation, lastLoadedConversationId, showConversationOptions: false };
  } else {
    showToast('Conversations ID not found');
    console.error('Conversation with ID ' + conversationId + ' not found.');
    return { conversations, messages, selectedConversation: null, lastLoadedConversationId };
  }
}

export async function regenerateMessageResponse(
  conversations,
  messages,
  content,
  sliderValue,
  selectedModel,
  localSliderValue,
  localModelName,
  localModelEndpoint,
  claudeSliderValue,
  updateUI,
  abortController,
  streamedMessageText
) {
  let baseMessages = messages.value.slice();

  const messageIndex = baseMessages.findIndex((message) => message.content === content && message.role === 'user');

  if (messageIndex !== -1) {
    const regenMessages = baseMessages.slice(0, messageIndex + 1);
    const messagesAfter = baseMessages.slice(messageIndex + 2);
    abortController.value = new AbortController();

    messages.value = regenMessages;

    let response = '';

    if (selectedModel.indexOf('gpt') !== -1) {
      response = await fetchGPTResponseStream(regenMessages, sliderValue, selectedModel, updateUI, abortController.value, streamedMessageText, false);
    } else if (selectedModel.indexOf('web-llm') !== -1) {
      response = await sendBrowserLoadedModelMessage(regenMessages, updateUI);
    } else if (selectedModel.indexOf('claude') !== -1) {
      response = await streamClaudeResponse(
        regenMessages,
        selectedModel,
        claudeSliderValue,
        updateUI,
        abortController.value,
        streamedMessageText,
        false
      );
    } else {
      response = await fetchLocalModelResponseStream(
        regenMessages,
        localSliderValue,
        localModelName,
        localModelEndpoint,
        updateUI,
        abortController.value,
        streamedMessageText,
        false
      );
    }

    // Append the response and any messages that existed after the messageIndex
    baseMessages = [...regenMessages, ...messagesAfter];
    baseMessages = createUniqueMessagesWithIds(baseMessages);
  }
  return { conversations, baseMessages };
}

export async function editPreviousMessage(
  conversations,
  messages,
  oldContent,
  newContent,
  sliderValue,
  selectedModel,
  localSliderValue,
  localModelName,
  localModelEndpoint,
  claudeSliderValue,
  updateUI,
  abortController,
  streamedMessageText
) {
  let baseMessages = messages.value.slice();

  const messageIndex = baseMessages.findIndex((message) => message.content === oldContent.content && message.role === 'user');

  if (messageIndex !== -1) {
    const regenMessages = baseMessages.slice(0, messageIndex + 1);
    const messagesAfter = baseMessages.slice(messageIndex + 2);
    abortController.value = new AbortController();

    regenMessages[regenMessages.length - 1].content = newContent;

    messages.value = regenMessages;

    let response = '';
    if (selectedModel.indexOf('gpt') !== -1) {
      response = await fetchGPTResponseStream(regenMessages, sliderValue, selectedModel, updateUI, abortController.value, streamedMessageText, false);
    } else if (selectedModel.indexOf('claude') !== -1) {
      response = await streamClaudeResponse(
        regenMessages,
        selectedModel,
        claudeSliderValue,
        updateUI,
        abortController.value,
        streamedMessageText,
        false
      );
    } else {
      response = await fetchLocalModelResponseStream(
        regenMessages,
        localSliderValue,
        localModelName,
        localModelEndpoint,
        updateUI,
        abortController.value,
        streamedMessageText,
        false
      );
    }

    baseMessages = [...regenMessages, ...messagesAfter];
    baseMessages = createUniqueMessagesWithIds(baseMessages);
  }
  return { conversations, baseMessages };
}

export async function editConversationTitle(conversations, oldConversation, newConversationTitle) {
  const updatedConversation = {
    ...oldConversation,
    title: newConversationTitle,
  };

  const updatedConversationsList = await updateConversation(conversations, oldConversation.id, updatedConversation);

  return updatedConversationsList;
}

export function handleExportConversations() {
  const filename = 'conversations.json';
  const text = localStorage.getItem('gpt-conversations');

  let element = document.createElement('a');

  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function setSystemPrompt(messages, prompt) {
  // Find the index of the existing system prompt (if any)
  const systemPromptIndex = messages.findIndex((message) => message.role === 'system');

  if (systemPromptIndex === 0) {
    // Trim the prompt and check if it is empty
    if (prompt.trim() === '') {
      // Remove the system entry from the messages ref if the prompt is an empty string
      messages.shift();
      return;
    }

    messages[0].content = prompt;
    return;
  }

  if (prompt.trim() === '') {
    return; // Do not add an empty system prompt
  }

  // Add a new system prompt at the beginning of the messages
  messages.unshift({
    role: 'system',
    content: prompt,
  });
}

export function deleteMessageFromHistory(messages, content) {
  const messageIndex = messages.findIndex((message) => message.content === content && message.role === 'user');

  if (messageIndex !== -1) {
    // Use a single slice operation to create the new messages array
    return messages.slice(0, messageIndex).concat(messages.slice(messageIndex + 2));
  }

  return messages;
}

export function createUniqueMessagesWithIds(messages) {
  let maxId = messages.reduce((max, message) => (message.id ? Math.max(max, message.id) : max), 0);

  // Process each message to ensure it has a unique ID
  return messages.map((message) => {
    if (!message.id) {
      maxId++; // Increment maxId to ensure a unique ID
      return { ...message, id: maxId }; // Assign the new ID
    }
    return message;
  });
}
