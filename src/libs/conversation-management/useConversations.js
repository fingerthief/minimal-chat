import { ref } from 'vue';
import { loadConversationTitles, loadStoredConversations } from '@/libs/api-access/gpt-api-access';
import { showToast } from '@/libs/utils/general-utils';
import {
    deleteConversation,
    saveMessages,
    selectConversation,
    editConversationTitle as editConversationTitleInManagement,
} from '@/libs/conversation-management/conversations-management';
import { messages, showConversationOptions } from '@/libs/state-management/state';

export function useConversations() {
    const conversations = ref(loadConversationTitles());
    const storedConversations = ref(loadStoredConversations());
    const lastLoadedConversationId = ref(parseInt(localStorage.getItem('lastConversationId')) || 0);
    const selectedConversation = ref(conversations.value[0]);

    function deleteCurrentConversation() {
        const updatedConversations = deleteConversation(conversations.value, lastLoadedConversationId.value);
        conversations.value = updatedConversations;
        messages.value = [];

        if (conversations.value.length > 0) {
            selectConversationHandler(conversations.value[conversations.value.length - 1].id);
        }

        localStorage.setItem('gpt-conversations', JSON.stringify(conversations.value));
    }

    async function saveMessagesHandler() {
        const result = await saveMessages(conversations.value, selectedConversation.value, messages.value, lastLoadedConversationId.value);
        conversations.value = result.conversations;
        messages.value = result.messages;
        selectedConversation.value = result.selectedConversation;
        lastLoadedConversationId.value = result.lastLoadedConversationId;
    }

    function selectConversationHandler(conversationId) {
        const result = selectConversation(conversations.value, conversationId, messages.value, lastLoadedConversationId.value, showToast);
        conversations.value = result.conversations;
        messages.value = result.messages;
        selectedConversation.value = result.selectedConversation;
        lastLoadedConversationId.value = result.lastLoadedConversationId;
        showConversationOptions.value = result.showConversationOptions;
    }

    async function editConversationTitle(oldConversation, newConversationTitle) {
        const updatedConversationsList = await editConversationTitleInManagement(conversations.value, oldConversation, newConversationTitle);
        if (updatedConversationsList) {
            conversations.value = updatedConversationsList;
            localStorage.setItem('gpt-conversations', JSON.stringify(conversations.value));
            showToast('Title Updated');
        } else {
            showToast('Failed to update title');
        }
    }

    return {
        conversations,
        storedConversations,
        lastLoadedConversationId,
        selectedConversation,
        showConversationOptions,
        deleteCurrentConversation,
        saveMessagesHandler,
        selectConversationHandler,
        editConversationTitle,
    };
}
