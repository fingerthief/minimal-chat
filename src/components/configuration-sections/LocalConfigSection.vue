<template>
    <div class="local-config-container">
        <!-- Connection Settings Card -->
        <div class="config-card">
            <div class="card-header">
                <NetworkIcon class="header-icon" size="18" />
                <h3>Connection Settings</h3>
                <ToolTip targetId="local-model-endpoint">Updating API endpoint will automatically save a new custom config entry</ToolTip>
            </div>
            <div class="card-content">
                <InputField :isSecret="false" labelText="API Endpoint" inputId="local-model-endpoint" 
                    :value="localModelEndpoint" @update:value="handleUpdate('localModelEndpoint', $event)"
                    :placeholderText="'Enter the base API Endpoint URL'" />
                    
                <InputField :isSecret="true" labelText="API Key" inputId="local-model-key" 
                    :value="localModelKey" @update:value="updateSettingAndFetchModels('localModelKey', $event)"
                    :placeholderText="'Enter the API key if applicable'" />
            </div>
        </div>
        
        <!-- Model Selection Card -->
        <div class="config-card">
            <div class="card-header clickable" @click="isModelSelectorOpen = !isModelSelectorOpen">
                <ServerIcon class="header-icon" size="18" />
                <h3>Available Models</h3>
                <div class="card-actions">
                    <span class="model-name">{{ localModelName || 'No model selected' }}</span>
                    <ChevronDown v-if="isModelSelectorOpen" class="indicator" size="18" />
                    <ChevronRight v-else class="indicator" size="18" />
                </div>
            </div>
            <transition name="slide-fade">
                <div v-show="isModelSelectorOpen" class="card-content">
                    <div class="model-list-container">
                        <Listbox filter id="custom-model-selector" v-model="localModelName" 
                            :options="availableModels" optionLabel="name" optionValue="id" 
                            @change="handleUpdate('localModelName', $event.value)" class="model-listbox" />
                            
                        <div v-if="!availableModels.length" class="empty-models">
                            <ServerOffIcon size="24" />
                            <p>No models available. Enter a valid API endpoint and key.</p>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
        
        <!-- Parameters Card -->
        <div class="config-card">
            <div class="card-header clickable" @click="isParametersOpen = !isParametersOpen">
                <SlidersIcon class="header-icon" size="18" />
                <h3>Model Parameters</h3>
                <div class="card-actions">
                    <ChevronDown v-if="isParametersOpen" class="indicator" size="18" />
                    <ChevronRight v-else class="indicator" size="18" />
                </div>
            </div>
            <transition name="slide-fade">
                <div v-show="isParametersOpen" class="card-content">
                    <div class="parameter-sliders">
                        <Slider label="Temperature" v-model="localSliderValue" :min="0" :max="1" :step="0.01" 
                            minLabel="Serious" maxLabel="Creative" @update:modelValue="updateLocalSliderValue" />
                            
                        <Slider label="Top_P" v-model="top_P" :min="0" :max="1" :step="0.01" 
                            minLabel="Lower" maxLabel="Higher" @update:modelValue="updateTopPSliderValue" />
                            
                        <Slider label="Repetition Penalty" v-model="repetitionPenalty" :min="0" :max="2" :step="0.01"
                            minLabel="Lower" maxLabel="Higher" @update:modelValue="updateRepetitionSliderValue" />
                            
                        <Slider label="Max Tokens" v-model="maxTokens" :min="0" :max="4096" :step="1" 
                            minLabel="Less" maxLabel="More" @update:modelValue="updateMaxTokensSliderValue" />
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import InputField from '../controls/InputField.vue';
import { ChevronDown, ChevronRight, Network as NetworkIcon, Server as ServerIcon, ServerOff as ServerOffIcon, Sliders as SlidersIcon } from 'lucide-vue-next';
import Listbox from 'primevue/listbox';
import Slider from '../controls/Slider.vue';
import { localModelEndpoint, localModelKey, localModelName, maxTokens, localSliderValue, top_P, repetitionPenalty, availableModels, selectedModel } from '@/libs/state-management/state';
import { handleUpdate, updateLocalSliderValue, updateTopPSliderValue, updateRepetitionSliderValue, customConfigs, selectedCustomConfigIndex, updateMaxTokensSliderValue, fetchAvailableModels } from '@/libs/utils/settings-utils';
import ToolTip from '../controls/ToolTip.vue';


const isModelSelectorOpen = ref(false);
const isParametersOpen = ref(false);

async function updateSettingAndFetchModels(field, value) {
    handleUpdate(field, value)

    await fetchAvailableModels();
}
</script>

<style scoped lang="scss">
// Variables
$primary-color: #157474;
$primary-light: #1a8f8f;
$primary-dark: #0f5454;
$bg-dark: #1d1e1e;
$bg-card: #252629;
$bg-hover: rgba(21, 116, 116, 0.15);
$text-color: #e0e0e0;
$border-radius: 8px;
$transition-speed: 0.2s;

// Animations
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

// Main container
.local-config-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    @media (max-width: 600px) {
        gap: 16px;
    }
}

// Card styling
.config-card {
    background-color: rgba(16, 56, 51, 0.1);
    border-radius: $border-radius;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow $transition-speed ease;
    
    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .card-header {
        background-color: rgba(21, 116, 116, 0.15);
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        
        &.clickable {
            cursor: pointer;
            transition: background-color $transition-speed ease;
            
            &:hover {
                background-color: rgba(21, 116, 116, 0.25);
            }
        }
        
        h3 {
            margin: 0;
            font-size: 17px;
            font-weight: 600;
            flex-grow: 1;
            
            @media (max-width: 600px) {
                font-size: 16px;
            }
        }
        
        .header-icon {
            color: $primary-color;
            opacity: 0.9;
        }
        
        .card-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .model-name {
                font-size: 14px;
                opacity: 0.8;
                max-width: 150px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                
                @media (max-width: 600px) {
                    max-width: 100px;
                }
            }
            
            .indicator {
                color: $primary-color;
            }
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
    }
}

// Model list
.model-list-container {
    margin-top: 8px;
    
    .model-listbox {
        width: 100%;
        
        :deep(.p-listbox) {
            background-color: rgba(16, 56, 51, 0.05);
            border: 1px solid rgba(21, 116, 116, 0.3);
            border-radius: $border-radius;
            width: 100%;
            height: auto;
            max-height: 300px;
            font-size: 15px;
            
            @media (max-width: 600px) {
                max-height: 250px;
            }
            
            &:hover {
                border-color: rgba(21, 116, 116, 0.5);
                box-shadow: 0 0 8px rgba(21, 116, 116, 0.2);
            }
            
            .p-listbox-header {
                background-color: rgba(21, 116, 116, 0.1);
                padding: 10px;
                
                .p-listbox-filter-container {
                    width: 100%;
                    
                    .p-inputtext {
                        background-color: #1d1e1e;
                        border: 1px solid rgba(21, 116, 116, 0.3);
                        border-radius: 4px;
                        padding: 8px 12px;
                        color: $text-color;
                        width: 100%;
                        
                        &:focus {
                            border-color: $primary-color;
                            box-shadow: 0 0 0 2px rgba(21, 116, 116, 0.2);
                        }
                    }
                    
                    .p-listbox-filter-icon {
                        color: $primary-color;
                    }
                }
            }
            
            .p-listbox-list {
                padding: 8px;
                
                .p-listbox-item {
                    padding: 10px 12px;
                    color: $text-color;
                    border-radius: 4px;
                    transition: all $transition-speed ease;
                    margin-bottom: 4px;
                    
                    &:hover {
                        background-color: rgba(21, 116, 116, 0.15);
                    }
                    
                    &.p-highlight {
                        background-color: rgba(21, 116, 116, 0.25);
                        color: white;
                        border-left: 3px solid $primary-color;
                    }
                }
            }
        }
    }
    
    .empty-models {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        text-align: center;
        color: #9fa6ac;
        background-color: rgba(16, 56, 51, 0.05);
        border-radius: $border-radius;
        border: 1px dashed rgba(21, 116, 116, 0.3);
        
        p {
            margin-top: 10px;
            font-size: 14px;
        }
    }
}

// Parameter sliders
.parameter-sliders {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    @media (max-width: 600px) {
        gap: 24px;
    }
}
</style>