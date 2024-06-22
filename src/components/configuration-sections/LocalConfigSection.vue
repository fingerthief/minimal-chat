<template>
    <div class="control-grid">
        <InputField :isSecret="false" labelText="API Endpoint:" :placeholderText="'Enter the base API Endpoint URL'"
            inputId="local-model-endpoint" :value="localModelEndpoint"
            @update:value="handleUpdate('localModelEndpoint', $event)" />
        <InputField :isSecret="true" labelText="API Key:" :placeholderText="'Enter the API key if applicable'"
            inputId="local-model-key" :value="localModelKey" @update:value="handleUpdate('localModelKey', $event)" />
    </div>
    <br>
    <div class="config-section" :class="{ show: isParametersOpen }">
        <h3 @click="isParametersOpen = !isParametersOpen">
            Parameters
            <ChevronDown v-if="isParametersOpen" class="indicator" size="20" />
            <ChevronRight v-else class="indicator" size="20" />
        </h3>
        <div v-show="isParametersOpen" class="control-grid">
            <Slider label="Temperature" v-model="localSliderValue" :min="0" :max="1" :step="0.01" minLabel="Serious"
                maxLabel="Creative" @update:modelValue="updateLocalSliderValue" />
            <Slider label="Top_P" v-model="top_P" :min="0" :max="1" :step="0.01" minLabel="Lower" maxLabel="Higher"
                @update:modelValue="updateTopPSliderValue" />
            <Slider label="Repetition Penalty" v-model="repetitionPenalty" :min="0" :max="2" :step="0.01"
                minLabel="Lower" maxLabel="Higher" @update:modelValue="updateRepetitionSliderValue" />
            <Slider label="Max Tokens" v-model="maxTokens" :min="-1" :max="4096" :step="1" minLabel="Less"
                maxLabel="More" @update:modelValue="updateMaxTokensSliderValue" />
        </div>
    </div>
    <br>
    <div class="config-section" :class="{ show: isModelSelectorOpen }">
        <h3 @click="isModelSelectorOpen = !isModelSelectorOpen">
            Select a Model ({{ localModelName }})
            <ChevronDown v-if="isModelSelectorOpen" class="indicator" size="20" />
            <ChevronRight v-else class="indicator" size="20" />
        </h3>
        <div v-show="isModelSelectorOpen" class="control-grid">
            <div class="control select-dropdown select-listbox">
                <Listbox filter id="custom-model-selector" v-model="localModelName" :options="availableModels"
                    optionLabel="name" optionValue="id" @change="handleUpdate('localModelName', $event.value)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import InputField from '../controls/InputField.vue';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-vue-next';
import Listbox from 'primevue/listbox';
import Slider from '../controls/Slider.vue';
import { localModelEndpoint, localModelKey, localModelName, maxTokens, localSliderValue, top_P, repetitionPenalty, availableModels, selectedModel } from '@/libs/state-management/state';
import { handleUpdate, updateLocalSliderValue, updateTopPSliderValue, updateRepetitionSliderValue, customConfigs, selectedCustomConfigIndex, updateMaxTokensSliderValue } from '@/libs/utils/settings-utils';


const isModelSelectorOpen = ref(false);
const isParametersOpen = ref(false);
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

    .control-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 20px;
        transition: max-height 0.3s ease-in-out;
        overflow: hidden;
        max-height: 0;
    }

    &.show .control-grid {
        max-height: fit-content;
    }
}

.p-dropdown {
    background-color: transparent;
    border-bottom: 2px solid #157474;
    border-top: none;
    border-left: none;
    border-right: none;
    width: auto;
    max-width: 80%;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background-color: #262627;
    }

    &:focus {
        outline: none;
    }
}


.center-text {
    text-align: center;
    bottom: 10px;
    position: relative;
}

.saved-custom-configs {
    h4 {
        margin-bottom: 10px;
    }

    ul {
        list-style-type: none;
        padding: 0;
        max-height: 15vh;
        overflow-y: auto;
        text-overflow: ellipsis;
        scrollbar-width: none;
        text-wrap: nowrap;

        li {
            display: flex;
            align-items: center;
            padding: 8px;
            background-color: darken(#165951, 8%);
            border-radius: 4px;
            margin-bottom: 8px;
            max-height: 6vh;
            overflow: hidden;
            text-align: left;
            cursor: pointer;

            &.selected {
                background-color: #1a5951;
            }

            .delete-custom-config-btn {
                background-color: transparent;
                border: none;
                color: #ff5555;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;

                &:hover {
                    color: #ff3333;
                }
            }
        }
    }
}

.flex-container {
    align-items: center;
    gap: 10px;
    width: 100%;

    .slider-container {
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;

        input[type='range'] {
            -webkit-appearance: none;
            flex-grow: 1;
            height: 5px;
            background: #0c1928;
            outline: none;
            margin-left: 10px;
            margin-right: 10px;

            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                background: #1a5951;
                cursor: pointer;
            }

            background: #1a5951;
            cursor: pointer;
        }
    }
}

.select-listbox {
    label {
        font-size: 18px;
        margin-bottom: 10px;
        display: block;
        color: #e0e0e0;
    }

    :deep(.p-listbox) {
        background-color: #1e1e1e;
        border: 2px solid #157474;
        border-radius: 8px;
        width: 40vw;
        padding: 8px;
        font-size: 16px;
        height: 50vh;
        max-height: 50vh;
        overflow: auto;
        transition: all 0.3s ease;

        @media (max-width: 600px) {
            height: 78vh;
            max-height: 78vh;
            width: 95vw;
        }

        &:hover {
            border-color: #1a8f8f;
            box-shadow: 0 0 10px rgba(21, 116, 116, 0.2);
        }

        .p-listbox-list {
            padding: 0;
        }

        .p-listbox-item {
            padding: 12px 16px;
            color: #e0e0e0;
            transition: background-color 0.2s ease;
            border-radius: 4px;
            margin-bottom: 4px;

            &:hover {
                background-color: #2a2a2b;
            }

            &.p-highlight {
                background-color: #157474;
                color: #ffffff;
            }
        }

        .p-listbox-filter-container {
            padding: 8px;
            margin-bottom: 8px;

            .p-inputtext {
                background-color: #2a2a2b;
                border: 1px solid #3a3a3b;
                color: #e0e0e0;
                border-radius: 4px;
                padding: 8px 12px;
                width: 100%;

                &:focus {
                    border-color: #157474;
                    box-shadow: 0 0 0 2px rgba(21, 116, 116, 0.2);
                }
            }

            .p-listbox-filter-icon {
                color: #157474;
                right: 20px;
                top: 18px;
            }
        }
    }

    :deep(.p-component) {
        font-family: 'Arial', sans-serif;
    }
}

.select-dropdown select {
    appearance: none;
    background-color: #333;
    color: #fff;
    max-width: 65vw;
    height: 40px;
    width: 100%;
    padding-left: 6px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background-color: #444;
    }

    &:focus {
        outline: none;
    }
}

.select-dropdown option {
    background-color: #222;
    color: #fff;
}
</style>