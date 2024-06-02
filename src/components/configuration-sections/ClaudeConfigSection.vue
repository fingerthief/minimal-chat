<template>
    <div class="control-grid">
        <InputField :labelText="'API Key'" :isSecret="true" :placeholderText="'Enter the API Key'"
            inputId="claude-api-key" :value="claudeKey" @update:value="handleUpdate('claudeKey', $event)" />
        <div class="flex-container">
            <div class="center-text">Temperature: ({{ claudeSliderValue }})</div>
            <div class="slider-container">
                <span>Serious</span>
                <input type="range" min="0" max="2" step="0.01" :value="claudeSliderValue"
                    @input="updateClaudeSliderValue($event.target.value)" />
                <span>Creative</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import InputField from '../InputField.vue';
import { claudeKey, claudeSliderValue } from '@/libs/state-management/state';
import { handleUpdate, updateClaudeSliderValue } from '@/libs/utils/settings-utils';
</script>

<style scoped>
.center-text {
    text-align: center;
    bottom: 10px;
    position: relative;
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
</style>