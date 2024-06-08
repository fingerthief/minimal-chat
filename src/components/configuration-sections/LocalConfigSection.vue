<template>
    <div class="control-grid">
        <div v-if="customConfigs.length" class="saved-custom-configs">
            <h4>Saved Custom Configs</h4>
            <ul>
                <li v-for="(config, index) in customConfigs" :key="index"
                    :class="{ selected: index === selectedCustomConfigIndex }" @click="handleSelectCustomConfig(index)">
                    <Trash2 :size="18" :stroke-width="1.5" @click.stop="handleDeleteCustomConfig(index)" />
                    <span>&nbsp;&nbsp;{{ config.endpoint }}</span>
                </li>
            </ul>
        </div>
        <InputField :isSecret="false" labelText="API Endpoint:" :placeholderText="'Enter the base API Endpoint URL'"
            inputId="local-model-endpoint" :value="localModelEndpoint"
            @update:value="handleUpdate('localModelEndpoint', $event)" />
        <div class="control select-dropdown">
            <label for="custom-model-selector">Models Available:</label>
            <select id="custom-model-selector" :value="localModelName"
                @change="handleUpdate('localModelName', $event.target.value)">
                <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
            </select>
        </div>
        <InputField :isSecret="true" labelText="API Key:" :placeholderText="'Enter the API key if applicable'"
            inputId="local-model-key" :value="localModelKey" @update:value="handleUpdate('localModelKey', $event)" />
        <InputField labelText="Max Tokens:" :isSecret="false"
            :placeholderText="'Enter the max token limit if applicable'" inputId="max-tokens"
            :value="maxTokens.toString()" @update:value="handleUpdate('maxTokens', $event)" />
        <div class="flex-container">
            <div class="center-text">Temperature: ({{ localSliderValue }})</div>
            <div class="slider-container">
                <span>Serious</span>
                <input type="range" min="0" max="1" step="0.01" :value="localSliderValue"
                    @input="updateLocalSliderValue($event.target.value)" />
                <span>Creative</span>
            </div>
        </div>
        <div class="flex-container">
            <div class="center-text">Top_P: ({{ top_P }})</div>
            <div class="slider-container">
                <span>Lower</span>
                <input type="range" min="0" max="1" step="0.01" :value="top_P"
                    @input="updateTopPSliderValue($event.target.value)" />
                <span>Higher</span>
            </div>
        </div>
        <div class="flex-container">
            <div class="center-text">Repetition Penalty: ({{ repetitionPenalty }})</div>
            <div class="slider-container">
                <span>Lower</span>
                <input type="range" min="0" max="2" step="0.01" :value="repetitionPenalty"
                    @input="updateRepetitionSliderValue($event.target.value)" />
                <span>Higher</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import InputField from '../controls/InputField.vue';
import { Trash2 } from 'lucide-vue-next';
import { localModelEndpoint, localModelKey, localModelName, maxTokens, localSliderValue, top_P, repetitionPenalty, availableModels } from '@/libs/state-management/state';
import { handleUpdate, handleDeleteCustomConfig, handleSelectCustomConfig, updateLocalSliderValue, updateTopPSliderValue, updateRepetitionSliderValue, customConfigs, selectedCustomConfigIndex } from '@/libs/utils/settings-utils';
</script>

<style scoped lang="scss">
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