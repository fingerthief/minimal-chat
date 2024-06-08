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
                <div class="settings-item-button" @click="
                    handleExportSettings(
                        {
                            shouldShowScrollButton,
                            userText,
                            isLoading,
                            hasFilterText,
                            selectedModel,
                            isSidebarOpen,
                            showConversationOptions,
                            messages,
                            streamedMessageText,
                            modelDisplayName,
                            localModelKey,
                            localModelName,
                            localModelEndpoint,
                            localSliderValue,
                            gptKey,
                            sliderValue,
                            claudeKey,
                            claudeSliderValue,
                            selectedDallEImageCount,
                            selectedDallEImageResolution,
                            selectedAutoSaveOption,
                            browserModelSelection,
                            maxTokens,
                            top_P,
                            repetitionPenalty,
                            systemPrompt,
                            conversations,
                            storedConversations,
                            lastLoadedConversationId,
                            selectedConversation,
                            abortController,
                            imageInput,
                        },
                        exportSettingsToFile
                    )
                    ">
                    <span class="action-text">Export Settings</span>
                    <Download :stroke-width="1.5" />
                </div>
                <label class="settings-item-button">
                    <span class="action-text">Import Settings</span>
                    <Upload :stroke-width="1.5" />
                    <input type="file" accept=".json"
                        @change="(event) => handleImportSettings(event, (data) => importSettings(data, update))"
                        style="display: none" />
                </label>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Download, Upload } from 'lucide-vue-next';
import { handleExportSettings, exportSettingsToFile, handleImportSettings, importSettings } from '@/libs/utils/settings-utils';
import { shouldShowScrollButton, userText, isLoading, hasFilterText, selectedModel, isSidebarOpen, showConversationOptions, messages, streamedMessageText, modelDisplayName, localModelKey, localModelName, localModelEndpoint, localSliderValue, gptKey, sliderValue, claudeKey, claudeSliderValue, selectedDallEImageCount, selectedDallEImageResolution, selectedAutoSaveOption, browserModelSelection, maxTokens, top_P, repetitionPenalty, systemPrompt, conversations, storedConversations, lastLoadedConversationId, selectedConversation, abortController, imageInput } from '@/libs/state-management/state';

const isImportExportConfigOpen = ref(false);

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
