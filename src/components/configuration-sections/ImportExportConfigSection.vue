<template>
    <div class="config-section" :class="{ show: isImportExportConfigOpen }">
        <h3 @click="isImportExportConfigOpen = !isImportExportConfigOpen">
            Import/Export Configuration
            <span class="indicator">{{ isImportExportConfigOpen ? '-' : '+' }}</span>
        </h3>
        <div v-show="isImportExportConfigOpen" class="control-grid">
            <h4>
                Manage Settings
                <p class="config-info">
                    Export your current settings to a JSON file for backup or to easily set up the application on
                    another
                    device. You can also import
                    settings from a JSON file.
                </p>
            </h4>

            <div class="settings-list">
                <div class="settings-item-button" @click="handleExportSettings">
                    <span class="action-text">Export Settings</span>
                    <Download :stroke-width="1.5" />
                </div>
                <label class="settings-item-button">
                    <span class="action-text">Import Settings</span>
                    <Upload :stroke-width="1.5" />
                    <input type="file" accept=".json" @change="handleImportSettings" style="display: none" />
                </label>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Download, Upload } from 'lucide-vue-next';
import { useConfigStore } from '@/stores/ConfigStore';

const configStore = useConfigStore();
const isImportExportConfigOpen = ref(false);

function handleExportSettings() {
    const settingsData = {
        shouldShowScrollButton: configStore.shouldShowScrollButton,
        userText: configStore.userText,
        isLoading: configStore.isLoading,
        hasFilterText: configStore.hasFilterText,
        selectedModel: configStore.selectedModel,
        isSidebarOpen: configStore.isSidebarOpen,
        showConversationOptions: configStore.showConversationOptions,
        messages: configStore.messages,
        streamedMessageText: configStore.streamedMessageText,
        modelDisplayName: configStore.modelDisplayName,
        localModelKey: configStore.localModelKey,
        localModelName: configStore.localModelName,
        localModelEndpoint: configStore.localModelEndpoint,
        localSliderValue: configStore.localSliderValue,
        gptKey: configStore.gptKey,
        sliderValue: configStore.sliderValue,
        claudeKey: configStore.claudeKey,
        claudeSliderValue: configStore.claudeSliderValue,
        selectedDallEImageCount: configStore.selectedDallEImageCount,
        selectedDallEImageResolution: configStore.selectedDallEImageResolution,
        selectedAutoSaveOption: configStore.selectedAutoSaveOption,
        browserModelSelection: configStore.browserModelSelection,
        maxTokens: configStore.maxTokens,
        top_P: configStore.top_P,
        repetitionPenalty: configStore.repetitionPenalty,
        systemPrompt: configStore.systemPrompt,
        conversations: configStore.conversations,
        storedConversations: configStore.storedConversations,
        lastLoadedConversationId: configStore.lastLoadedConversationId,
        selectedConversation: configStore.selectedConversation,
        abortController: configStore.abortController,
        imageInput: configStore.imageInput,
    };

    const jsonData = JSON.stringify(settingsData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'settings.json';
    link.click();
    URL.revokeObjectURL(url);
}

function handleImportSettings(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const jsonData = e.target.result;
        const settingsData = JSON.parse(jsonData);

        // Update the config store with the imported settings
        Object.assign(configStore, settingsData);
    };

    reader.readAsText(file);
}
</script>

<style scoped lang="scss">
.config-section {
    margin-bottom: 15px;

    h3 {
        margin-bottom: 15px;
        background-color: transparent;
        border-bottom: 4px solid #1a4c47e6;
        text-align: left;
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 8px;
    }

    .config-info {
        font-size: 12px;
    }

    .control-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        transition: max-height 0.3s ease-in-out;
        overflow: hidden;
        max-height: 0;

        @media (max-width: 600px) {
            grid-template-columns: repeat(1, 1fr);
        }
    }

    &.show .control-grid {
        max-height: fit-content;
    }
}

.control-grid .settings-list {
    display: flex;
    gap: 0.5rem;

    .settings-item-button {
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        margin: 6px 0;
        border-radius: 6px;
        cursor: pointer;
        background: #1a5951;
        flex-direction: column-reverse;
        transition: background 0.3s ease;

        &:hover {
            background: darken(#165951, 5%);
        }
    }
}
</style>
