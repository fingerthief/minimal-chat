// state.js
import { ref } from 'vue';

export const showStoredFiles = ref(false);
export const contextMenuOpened = ref(false);
export const shouldShowScrollButton = ref(false);
export const userText = ref('');
export const isLoading = ref(false);
export const hasFilterText = ref(false);
export const showConversationOptions = ref(false);
export const messages = ref([]);
export const streamedMessageText = ref('');
export const isInteractModeOpen = ref(false);
export const selectedConversation = ref(null);
export const abortController = ref(null);
export const imageInput = ref(null);

window.addEventListener('resize', () => {
    isSmallScreen.value = window.innerWidth <= 600;
});