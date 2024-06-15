<template>
    <div class="control select-dropdown">
        <label for="localModelsSelection">Model To Load In Browser:</label>
        <Dropdown id="localModelsSelection" :options="modelOptions" optionLabel="label" optionValue="value"
            v-model="browserModelSelection" @change="handleUpdate('browserModelSelection', browserModelSelection)" />
    </div>
</template>

<script setup>
import { browserModelSelection } from '@/libs/state-management/state';
import { handleUpdate } from '@/libs/utils/settings-utils';

const modelOptions = [
    { label: 'Llama-3-8B-Instruct-q4f32 (~6.1gb VRAM)', value: 'Llama-3-8B-Instruct-q4f32_1' },
    { label: 'Llama-3-8B-Instruct-q4f16 1k Context (~4.6gb VRAM)', value: 'Llama-3-8B-Instruct-q4f16_1-1k' },
    { label: 'Llama-3-8B-Instruct-q4f32 1k Context (~5.2gb VRAM)', value: 'Llama-3-8B-Instruct-q4f32_1-1k' },
    { label: 'Llama-2-7b-chat-hf-q4f16 (~6.8gb VRAM)', value: 'Llama-2-7b-chat-hf-q4f16_1' },
    { label: 'TinyLlama-1.1B-Chat-v0.4-q4f32 1k Context (~1.0gb VRAM)', value: 'TinyLlama-1.1B-Chat-v0.4-q4f32_1-1k' },
    { label: 'TinyLlama-1.1B-Chat-v0f32 (~5.3gb VRAM)', value: 'TinyLlama-1.1B-Chat-v0f32' },
    { label: 'Mistral-7B-Instruct-v0.2 (~6.1gb VRAM)', value: 'Mistral-7B-Instruct-v0.2-q4f16_1' },
    { label: 'OpenHermes-2.5-Mistral-7B (~6.1gb VRAM)', value: 'OpenHermes-2.5-Mistral-7B-q4f16_1' },
    { label: 'WizardMath-7B-V1.1-q4f16 (~6.1gb VRAM)', value: 'WizardMath-7B-V1.1-q4f16_1' },
    { label: 'NeuralHermes-2.5-Mistral-7B-q4f16 (~6.1gb VRAM)', value: 'NeuralHermes-2.5-Mistral-7B-q4f16_1' },
    { label: 'gemma-2b-it-q4f32 (~1.8gb VRAM)', value: 'gemma-2b-it-q4f32_1' },
    { label: 'gemma-2b-it-q4f32 1k Context (~1.6gb VRAM)', value: 'gemma-2b-it-q4f32_1-1k' }
];
</script>

<style scoped lang="scss">
.select-dropdown {
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

}
</style>
