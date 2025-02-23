import { ref } from 'vue';
import { loadConversationTitles, loadStoredConversations } from '@/libs/api-access/gpt-api-access';
import { showToast } from '@/libs/utils/general-utils';
import {
    saveMessages as saveMessagesInManagement,
    selectConversation as selectConversationInManagement,
    editConversationTitle as editConversationTitleInManagement,
} from '@/libs/conversation-management/conversations-management';
import { messages, showConversationOptions, conversations, selectedConversation, lastLoadedConversationId } from '@/libs/state-management/state';

const DELETE_ANIMATION_DURATION = 250; // ms

/**
 * Saves the current messages to local storage.
 */
export async function saveMessagesHandler() {
    await saveMessagesInManagement();
}

/**
 * Deletes the currently selected conversation.
 */
export function deleteCurrentConversation() {
    if (!selectedConversation.value) {
        showToast('No conversation selected');
        return;
    }

    const conversationId = selectedConversation.value.id;
    const conversationIndex = conversations.value.findIndex(convo => convo.id === conversationId);

    if (conversationIndex === -1) {
        console.warn(`Conversation with ID ${conversationId} not found in the conversations list.`);
        return;
    }

    const conversationElement = document.getElementById(`conversation-${conversationIndex}`);

    if (!conversationElement) {
        console.warn(`Conversation element with ID conversation-${conversationIndex} not found in the DOM.`);
        removeConversationFromState(conversationId); // Still remove from state even if element is missing
        return;
    }

    // Animate deletion
    conversationElement.classList.add('deleting');

    // Remove conversation after animation
    setTimeout(() => {
        removeConversationFromState(conversationId);
    }, DELETE_ANIMATION_DURATION);
}

/**
 * Removes a conversation from the state and local storage.
 * @param {string} conversationId The ID of the conversation to remove.
 */
function removeConversationFromState(conversationId) {
    conversations.value = conversations.value.filter(convo => convo.id !== conversationId);
    selectedConversation.value = null;
    messages.value = [];
    lastLoadedConversationId.value = null;
    localStorage.setItem('gpt-conversations', JSON.stringify(conversations.value));
    showToast('Conversation Deleted');
}


/**
 * Selects a conversation and loads its messages.
 * @param {string} conversationId The ID of the conversation to select.
 */
export function selectConversationHandler(conversationId) {
    const result = selectConversationInManagement(
        conversations.value,
        conversationId,
        messages.value,
        lastLoadedConversationId.value,
        showToast
    );

    conversations.value = result.conversations;
    messages.value = result.messages;
    selectedConversation.value = result.selectedConversation;
    lastLoadedConversationId.value = result.lastLoadedConversationId;
    showConversationOptions.value = result.showConversationOptions;
}

/**
 * Edits the title of a conversation.
 * @param {object} oldConversation The old conversation object.
 * @param {string} newConversationTitle The new title for the conversation.
 */
export async function editConversationTitle(oldConversation, newConversationTitle) {
    const updatedConversationsList = await editConversationTitleInManagement(
        conversations.value,
        oldConversation,
        newConversationTitle
    );

    if (updatedConversationsList) {
        conversations.value = updatedConversationsList;
        localStorage.setItem('gpt-conversations', JSON.stringify(conversations.value));
        showToast('Title Updated');
    } else {
        showToast('Failed to update title');
    }
}