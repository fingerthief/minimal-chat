// state.js
import { ref, computed } from 'vue';
import { loadConversationTitles, loadStoredConversations } from '@/libs/api-access/gpt-api-access';
import { removeAPIEndpoints } from '@/libs/utils/general-utils';

export const contextMenuOpened = ref(false);
export const shouldShowScrollButton = ref(false);
export const userText = ref('');
export const isLoading = ref(false);
export const hasFilterText = ref(false);
export const selectedModel = ref(localStorage.getItem('selectedModel') || 'gpt-4o');
export const isSidebarOpen = ref(false);
export const showConversationOptions = ref(false);
export const messages = ref([]);
export const streamedMessageText = ref('');
export const modelDisplayName = ref('Unknown');
export const higherContrastMessages = ref(localStorage.getItem("higherContrastMessages") || false);
export const isInteractModeOpen = ref(false);

export const localModelKey = ref(localStorage.getItem('localModelKey') || '');
export const localModelName = ref(localStorage.getItem('localModelName') || '');
export const localModelEndpoint = ref(removeAPIEndpoints(localStorage.getItem('localModelEndpoint') || ''));
export const localSliderValue = ref(parseFloat(localStorage.getItem('local-attitude')) || 0.6);
export const gptKey = ref(localStorage.getItem('gptKey') || '');
export const sliderValue = ref(parseInt(localStorage.getItem('gpt-attitude')) || 0.5);
export const claudeKey = ref(localStorage.getItem('claudeKey') || '');
export const claudeSliderValue = ref(parseInt(localStorage.getItem('claude-attitude')) || 0.5);
export const selectedDallEImageCount = ref(parseInt(localStorage.getItem('selectedDallEImageCount')) || 1);
export const selectedDallEImageResolution = ref(localStorage.getItem('selectedDallEImageResolution') || '256x256');
export const selectedAutoSaveOption = ref(localStorage.getItem('selectedAutoSaveOption') || true);

export const browserModelSelection = ref(localStorage.getItem('browserModelSelection') || undefined);

export const maxTokens = ref(parseInt(localStorage.getItem('maxTokens')) || -1);
export const top_P = ref(parseFloat(localStorage.getItem('top_P')) || 1.0);
export const repetitionPenalty = ref(parseFloat(localStorage.getItem('repetitionPenalty')) || 1.0);

export const systemPrompt = ref(localStorage.getItem('systemPrompt') || '');

export const conversations = ref(loadConversationTitles());
export const storedConversations = ref(loadStoredConversations());
export const lastLoadedConversationId = ref(parseInt(localStorage.getItem('lastConversationId')) || 0);
export const selectedConversation = ref(conversations.value[0]);
export const abortController = ref(null);
export const imageInput = ref(null);

// Add a computed property to check the screen width
export const isSmallScreen = computed(() => window.innerWidth <= 600);
export const isSidebarVisible = ref(!isSmallScreen.value);

// Watch for window resize events to update the computed property
window.addEventListener('resize', () => {
    isSmallScreen.value = window.innerWidth <= 600;
    if (isSmallScreen.value) {
        isSidebarVisible.value = false;
    } else {
        isSidebarVisible.value = true;
    }
});