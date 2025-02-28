<template>
    <div class="config-card">
        <div class="section-header" @click="isImportExportConfigOpen = !isImportExportConfigOpen">
            <h3>
                <Save size="18" class="section-icon" />
                Import/Export Configuration
            </h3>
            <ChevronDown v-if="isImportExportConfigOpen" class="indicator" size="20" />
            <ChevronRight v-else class="indicator" size="20" />
        </div>
        <transition name="slide-fade">
            <div v-show="isImportExportConfigOpen" class="card-content">
                <div class="description">
                    <p>
                        Export your current settings to a JSON file for backup or to easily set up the application on
                        another device. You can also import settings from a JSON file.
                    </p>
                </div>

                <div class="action-buttons">
                    <button class="action-button" @click="
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
                        )">
                        <Download :stroke-width="1.5" size="18" />
                        <span class="button-text">Export Settings</span>
                    </button>
                    <label class="action-button">
                        <Upload :stroke-width="1.5" size="18" />
                        <span class="button-text">Import Settings</span>
                        <input type="file" accept=".json"
                            @change="(event) => handleImportSettings(event, (data) => importSettings(data, update))"
                            style="display: none" />
                    </label>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { ChevronDown, ChevronRight, Download, Upload, Save } from 'lucide-vue-next';
import { handleExportSettings, exportSettingsToFile, handleImportSettings, importSettings } from '@/libs/utils/settings-utils';
import { shouldShowScrollButton, userText, isLoading, hasFilterText, selectedModel, isSidebarOpen, showConversationOptions, messages, streamedMessageText, modelDisplayName, localModelKey, localModelName, localModelEndpoint, localSliderValue, gptKey, sliderValue, claudeKey, claudeSliderValue, selectedDallEImageCount, selectedDallEImageResolution, selectedAutoSaveOption, browserModelSelection, maxTokens, top_P, repetitionPenalty, systemPrompt, conversations, storedConversations, lastLoadedConversationId, selectedConversation, abortController, imageInput } from '@/libs/state-management/state';

const isImportExportConfigOpen = ref(false);

</script>

<style scoped lang="scss">
// Variables
$primary-color: #157474;
$primary-light: #1a8f8f;
$primary-dark: #0f5454;
$transition-speed: 0.2s;

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all $transition-speed ease;
    max-height: 90vh;
    overflow: hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px);
}

.config-card {
    background-color: rgba(16, 56, 51, 0.1);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow $transition-speed ease;
    margin-bottom: 20px;
    
    @media (max-width: 600px) {
        margin-bottom: 15px;
    }
    
    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    background-color: rgba(21, 116, 116, 0.15);
    transition: background-color $transition-speed ease;
    
    @media (max-width: 600px) {
        padding: 10px 12px;
    }
    
    &:hover {
        background-color: rgba(21, 116, 116, 0.25);
    }
    
    h3 {
        margin: 0;
        display: flex;
        align-items: center;
        font-size: 17px;
        font-weight: 600;
        
        .section-icon {
            margin-right: 8px;
            color: $primary-color;
        }
        
        @media (max-width: 600px) {
            font-size: 16px;
        }
    }
    
    .indicator {
        color: $primary-color;
    }
}

.card-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    @media (max-width: 600px) {
        padding: 12px;
    }
    
    .description {
        p {
            margin: 0;
            font-size: 14px;
            color: #9fa6ac;
            line-height: 1.4;
        }
    }
}

.action-buttons {
    display: flex;
    gap: 12px;
    
    @media (max-width: 600px) {
        flex-direction: column;
        gap: 10px;
    }
    
    .action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        background-color: rgba(21, 116, 116, 0.2);
        border: 1px solid rgba(21, 116, 116, 0.5);
        border-radius: 6px;
        color: #e0e0e0;
        cursor: pointer;
        transition: all $transition-speed ease;
        flex: 1;
        
        &:hover {
            background-color: rgba(21, 116, 116, 0.3);
            border-color: $primary-color;
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        &:active {
            transform: translateY(0);
            background-color: rgba(21, 116, 116, 0.4);
        }
        
        svg {
            color: $primary-color;
        }
        
        .button-text {
            font-family: inherit;
            font-size: 15px;
            font-weight: 500;
            letter-spacing: 0;
        }
    }
}
</style>
