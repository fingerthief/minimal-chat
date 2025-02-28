import { fetchGPTResponseStream } from '../api-access/gpt-api-access';
import { fetchLocalModelResponseStream, getConversationTitleFromLocalModel } from '../api-access/open-ai-api-standard-access';
import { streamClaudeResponse, fetchClaudeConversationTitle } from '../api-access/claude-api-access';
import { sendBrowserLoadedModelMessage, getBrowserLoadedModelConversationTitle } from '../api-access/web-llm-access';
import { getConversationTitleFromGPT } from '@/libs/utils/general-utils';
import { conversations, messages, selectedConversation, lastLoadedConversationId } from '../state-management/state';

// Helper function to determine the appropriate API call based on the selected model
const getConversationTitle = async (selectedModel, messages, localModelName, localModelEndpoint, sliderValue) => {
  if (selectedModel.includes('claude')) {
    return fetchClaudeConversationTitle(messages);
  }

  if (selectedModel.includes('open-ai-format')) {
    return getConversationTitleFromLocalModel(messages, localModelName, localModelEndpoint);
  }

  if (selectedModel.includes('gpt')) {
    return getConversationTitleFromGPT(messages, selectedModel, sliderValue);
  }

  if (selectedModel.includes('web-llm')) {
    return getBrowserLoadedModelConversationTitle(messages);
  }

  return 'Error Generating Title';
};

// Function to create a new conversation
export const createConversation = (conversations, title, messages) => {
  const newId = conversations.length > 0 ? Math.max(...conversations.map((c) => c.id)) + 1 : 1;

  const newConversation = {
    title: title,
    id: newId,
    messageHistory: messages,
  };

  return [...conversations, newConversation];
};

// Function to update an existing conversation
export const updateConversation = (conversations, id, updatedConversation) => {
  return conversations.map((conversation) =>
    conversation.id === id ? { ...conversation, ...updatedConversation } : conversation
  );
};

// Function to delete a conversation
export const deleteConversation = (conversations, id) => {
  return conversations.filter((conversation) => conversation.id !== id);
};

// Function to save messages to local storage and update conversations
export const saveMessages = async () => {
  const updatedConversation = selectedConversation.value;

  // If there is no selected conversation, create a new one
  if (!updatedConversation) {
    // If there are no messages, just save the empty conversations array and return
    if (messages.value.length === 0) {
      localStorage.setItem('gpt-conversations', JSON.stringify(conversations.value));
      selectedConversation.value = null;
      return;
    }

    // Create a title for the new conversation
    const title = await getConversationTitle(
      localStorage.getItem('selectedModel') || 'gpt-4o',
      messages.value,
      localStorage.getItem('localModelName') || '',
      localStorage.getItem('localModelEndpoint') || '',
      localStorage.getItem('gpt-attitude') || 50
    );

    // Ensure all messages have unique IDs
    const uniqueMessages = createUniqueMessagesWithIds(messages.value);

    // Create the new conversation
    const updatedConversations = createConversation(conversations.value, title, uniqueMessages);

    // Update the state
    messages.value = uniqueMessages;
    conversations.value = updatedConversations;
    lastLoadedConversationId.value = updatedConversations[updatedConversations.length - 1].id;

    // Save to local storage
    localStorage.setItem('lastConversationId', lastLoadedConversationId.value);
    localStorage.setItem('gpt-conversations', JSON.stringify(conversations.value));
    selectedConversation.value = conversations.value[conversations.value.length - 1];

    return;
  }

  // Update the message history of the selected conversation
  updatedConversation.messageHistory = messages.value;

  // Update the conversation in the conversations array
  const updatedConversations = updateConversation(conversations.value, updatedConversation.id, updatedConversation);

  // Update the state
  conversations.value = updatedConversations;

  // Save to local storage
  localStorage.setItem('gpt-conversations', JSON.stringify(conversations.value));
  // Keep the current selected conversation instead of always selecting the last one
  const currentConversation = conversations.value.find(c => c.id === updatedConversation.id);
  selectedConversation.value = currentConversation || null;
};

// Function to select a conversation and load its messages
export const selectConversation = (conversations, conversationId, messages, lastLoadedConversationId, showToast) => {
  if (!conversations.length) {
    return { conversations, messages, selectedConversation: null, lastLoadedConversationId };
  }

  const conversation = conversations.find((c) => c.id === conversationId);

  if (!conversation) {
    showToast('Conversations ID not found');
    console.error('Conversation with ID ' + conversationId + ' not found.');
    return { conversations, messages, selectedConversation: null, lastLoadedConversationId };
  }

  lastLoadedConversationId = conversationId;
  localStorage.setItem('lastConversationId', lastLoadedConversationId);

  // Ensure all messages have unique IDs
  const processedMessages = createUniqueMessagesWithIds(conversation.messageHistory);

  messages = processedMessages;

  return { conversations, messages, selectedConversation: conversation, lastLoadedConversationId, showConversationOptions: false };
};

// Helper function to fetch the response stream based on the selected model
const fetchResponseStream = async (
  selectedModel,
  regenMessages,
  sliderValue,
  localSliderValue,
  localModelName,
  localModelEndpoint,
  claudeSliderValue,
  updateUI,
  abortController,
  streamedMessageText,
  autoScrollToBottom
) => {
  if (selectedModel.includes('gpt')) {
    return fetchGPTResponseStream(regenMessages, sliderValue, selectedModel, updateUI, abortController, streamedMessageText, autoScrollToBottom);
  }

  if (selectedModel.includes('web-llm')) {
    return sendBrowserLoadedModelMessage(regenMessages, updateUI);
  }

  if (selectedModel.includes('claude')) {
    return streamClaudeResponse(
      regenMessages,
      selectedModel,
      claudeSliderValue,
      updateUI,
      abortController,
      streamedMessageText,
      autoScrollToBottom
    );
  }

  return fetchLocalModelResponseStream(
    regenMessages,
    localSliderValue,
    localModelName,
    localModelEndpoint,
    updateUI,
    abortController,
    streamedMessageText,
    autoScrollToBottom
  );
};

// Function to regenerate a message response
export const regenerateMessageResponse = async (
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
) => {
  const messageIndex = messages.value.findIndex((message) => message.content === content && message.role === 'user');

  if (messageIndex === -1) {
    return { conversations, baseMessages: messages.value };
  }

  const regenMessages = messages.value.slice(0, messageIndex + 1);
  const messagesAfter = messages.value.slice(messageIndex + 2);

  abortController.value = new AbortController();

  messages.value = regenMessages;

  // Fetch the response stream
  await fetchResponseStream(
    selectedModel,
    regenMessages,
    sliderValue,
    localSliderValue,
    localModelName,
    localModelEndpoint,
    claudeSliderValue,
    updateUI,
    abortController.value,
    streamedMessageText,
    false
  );

  // Combine the messages and ensure unique IDs
  const baseMessages = createUniqueMessagesWithIds([...regenMessages, ...messagesAfter]);

  return { conversations, baseMessages };
};

// Function to edit a previous message
export const editPreviousMessage = async (
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
) => {
  const messageIndex = messages.value.findIndex((message) => message.content === oldContent.content && message.role === 'user');

  if (messageIndex === -1) {
    return { conversations, baseMessages: messages.value };
  }

  const regenMessages = messages.value.slice(0, messageIndex + 1);
  const messagesAfter = messages.value.slice(messageIndex + 2);

  abortController.value = new AbortController();

  regenMessages[regenMessages.length - 1].content = newContent;

  messages.value = regenMessages;

  // Fetch the response stream
  await fetchResponseStream(
    selectedModel,
    regenMessages,
    sliderValue,
    localSliderValue,
    localModelName,
    localModelEndpoint,
    claudeSliderValue,
    updateUI,
    abortController.value,
    streamedMessageText,
    false
  );

  const baseMessages = createUniqueMessagesWithIds([...regenMessages, ...messagesAfter]);

  return { conversations, baseMessages };
};

// Function to edit a conversation title
export const editConversationTitle = async (conversations, oldConversation, newConversationTitle) => {
  const updatedConversation = {
    ...oldConversation,
    title: newConversationTitle,
  };

  const updatedConversationsList = updateConversation(conversations, oldConversation.id, updatedConversation);

  return updatedConversationsList;
};

// Function to handle exporting conversations
export const handleExportConversations = () => {
  const filename = 'conversations.json';
  const text = localStorage.getItem('gpt-conversations');

  const element = document.createElement('a');

  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

// Function to set the system prompt
export const setSystemPrompt = (messages, prompt) => {
  const systemPromptIndex = messages.findIndex((message) => message.role === 'system');

  if (systemPromptIndex === 0) {
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt === '') {
      messages.shift();
    } else {
      messages[0].content = prompt;
    }
    return;
  }

  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt === '') {
    return;
  }

  messages.unshift({
    role: 'system',
    content: prompt,
  });
};

// Function to delete a message from history
export const deleteMessageFromHistory = (messages, content) => {
  const messageIndex = messages.findIndex((message) => message.content === content && message.role === 'user');

  if (messageIndex === -1) {
    return messages;
  }

  return [...messages.slice(0, messageIndex), ...messages.slice(messageIndex + 2)];
};

// Function to create unique message IDs
export const createUniqueMessagesWithIds = (messages) => {
  let maxId = messages.reduce((max, message) => (message.id ? Math.max(max, message.id) : max), 0);

  return messages.map((message) => {
    if (!message.id) {
      maxId++;
      return { ...message, id: maxId };
    }
    return message;
  });
};