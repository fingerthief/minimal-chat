import { defineStore } from 'pinia';
import { getOpenAICompatibleAvailableModels } from '@/libs/api-access/open-ai-api-standard-access';
import { removeAPIEndpoints } from '@/libs/utils/general-utils';
import { loadConversationTitles, loadStoredConversations } from '@/libs/api-access/gpt-api-access';
import { onMounted, ref } from 'vue';

export const useConfigStore = defineStore('config', {
    state: () => ({
        pushToTalkMode: ref(JSON.parse(localStorage.getItem("use-push-to-talk")) || false),
        useWhisper: ref(JSON.parse(localStorage.getItem("use-whisper")) || false),
        audioSpeed: ref(parseFloat(localStorage.getItem("audio-speed")) || 1.0),
        ttsModel: ref(localStorage.getItem("tts-model") || 'tts-1'),
        whisperTemperature: ref(parseFloat(localStorage.getItem("whisper-temperature")) || 0.35),
        audioQueue: ref([]),
        audioIsPlaying: ref(false),
        availableModels: ref([]),
        showStoredFiles: ref(false),
        contextMenuOpened: ref(false),
        shouldShowScrollButton: ref(false),
        userText: ref(''),
        isLoading: ref(false),
        hasFilterText: ref(false),
        selectedModel: ref(localStorage.getItem('selectedModel') || 'gpt-4'),
        isSidebarOpen: ref(false),
        showConversationOptions: ref(false),
        messages: ref([]),
        streamedMessageText: ref(''),
        modelDisplayName: ref('Unknown'),
        higherContrastMessages: ref(localStorage.getItem("higherContrastMessages") || false),
        isInteractModeOpen: ref(false),
        localModelKey: ref(localStorage.getItem('localModelKey') || ''),
        localModelName: ref(localStorage.getItem('localModelName') || ''),
        localModelEndpoint: ref(removeAPIEndpoints(localStorage.getItem('localModelEndpoint') || '')),
        localSliderValue: ref(parseFloat(localStorage.getItem('local-attitude')) || 0.6),
        gptKey: ref(localStorage.getItem('gptKey') || ''),
        sliderValue: ref(parseFloat(localStorage.getItem('gpt-attitude')) || 0.5),
        claudeKey: ref(localStorage.getItem('claudeKey') || ''),
        claudeSliderValue: ref(parseFloat(localStorage.getItem('claude-attitude')) || 0.5),
        selectedDallEImageCount: ref(parseInt(localStorage.getItem('selectedDallEImageCount')) || 1),
        selectedDallEImageResolution: ref(localStorage.getItem('selectedDallEImageResolution') || '256x256'),
        selectedAutoSaveOption: ref(localStorage.getItem('selectedAutoSaveOption') || true),
        browserModelSelection: ref(localStorage.getItem('browserModelSelection') || undefined),
        maxTokens: ref(parseInt(localStorage.getItem('maxTokens')) || -1),
        top_P: ref(parseFloat(localStorage.getItem('top_P')) || 1.0),
        repetitionPenalty: ref(parseFloat(localStorage.getItem('repetitionPenalty')) || 1.0),
        systemPrompt: ref(localStorage.getItem('systemPrompt') || ''),
        conversations: ref(loadConversationTitles()),
        storedConversations: ref(loadStoredConversations()),
        lastLoadedConversationId: ref(parseInt(localStorage.getItem('lastConversationId')) || 0),
        selectedConversation: ref(null),
        abortController: ref(null),
        imageInput: ref(null),
        isSmallScreen: ref(window.innerWidth <= 600),
        isSidebarVisible: ref(false),
        customConfigs: ref([]),
        selectedCustomConfigIndex: ref(-1),
    }),
    actions: {
        selectModel(model) {
            this.selectedModel.value = model;
            this.showingGeneralConfig.value = false;
            this.isClaudeConfigOpen.value = false;
            this.isGPTConfigOpen.value = false;

            if (model === 'open-ai-format') {
                this.fetchAvailableModels();
            }

            this.isSidebarVisible.value = false;
        },
        async fetchAvailableModels() {
            try {
                if (this.localModelEndpoint.trim() !== '') {
                    const models = await getOpenAICompatibleAvailableModels(removeAPIEndpoints(this.localModelEndpoint));
                    this.availableModels.value = models;
                }
            } catch (error) {
                console.error('Error fetching available models:', error);
            }
        },
        toggleSidebar() {
            this.isSidebarVisible.value = !this.isSidebarVisible.value;
        },
        showGeneralConfigSection() {
            this.showingGeneralConfig.value = true;
            this.isSidebarVisible.value = false;
        },
        selectCustomConfig(index, endpoint, apiKey, maxTokens, temperature, top_P, repetitionPenalty) {
            this.selectedCustomConfigIndex.value = index;
            this.localModelEndpoint.value = endpoint;
            this.localModelKey.value = apiKey;
            this.maxTokens.value = maxTokens;
            this.localSliderValue.value = temperature;
            this.top_P.value = top_P;
            this.repetitionPenalty.value = repetitionPenalty;
        },
    },
});

onMounted(() => {
    // Subscribe to state changes and update localStorage accordingly
    const configStore = useConfigStore();
    configStore.$subscribe((mutation, state) => {
        localStorage.setItem("use-push-to-talk", JSON.stringify(state.pushToTalkMode.value));
        localStorage.setItem("use-whisper", JSON.stringify(state.useWhisper.value));
        localStorage.setItem("audio-speed", state.audioSpeed.value.toString());
        localStorage.setItem("tts-model", state.ttsModel.value);
        localStorage.setItem("whisper-temperature", state.whisperTemperature.value.toString());
        localStorage.setItem("higherContrastMessages", state.higherContrastMessages.value.toString());
        localStorage.setItem('selectedModel', state.selectedModel.value);
        localStorage.setItem('localModelKey', state.localModelKey.value);
        localStorage.setItem('localModelName', state.localModelName.value);
        localStorage.setItem('localModelEndpoint', state.localModelEndpoint.value);
        localStorage.setItem('local-attitude', state.localSliderValue.value.toString());
        localStorage.setItem('gptKey', state.gptKey.value);
        localStorage.setItem('gpt-attitude', state.sliderValue.value.toString());
        localStorage.setItem('claudeKey', state.claudeKey.value);
        localStorage.setItem('claude-attitude', state.claudeSliderValue.value.toString());
        localStorage.setItem('selectedDallEImageCount', state.selectedDallEImageCount.value.toString());
        localStorage.setItem('selectedDallEImageResolution', state.selectedDallEImageResolution.value);
        localStorage.setItem('selectedAutoSaveOption', state.selectedAutoSaveOption.value.toString());
        localStorage.setItem('browserModelSelection', state.browserModelSelection.value);
        localStorage.setItem('maxTokens', state.maxTokens.value.toString());
        localStorage.setItem('top_P', state.top_P.value.toString());
        localStorage.setItem('repetitionPenalty', state.repetitionPenalty.value.toString());
        localStorage.setItem('systemPrompt', state.systemPrompt.value);
        localStorage.setItem('lastConversationId', state.lastLoadedConversationId.value.toString());
    });
});