<template>
    <div class="control select-listbox">
        <label for="localModelsSelection">Select a Model To Load In Browser:</label>
        <Listbox filter id="localModelsSelection" :options="modelOptions" optionLabel="label" optionValue="value"
            v-model="browserModelSelection" @change="handleUpdate('browserModelSelection', browserModelSelection)" />
    </div>
</template>

<script setup>
import { browserModelSelection } from '@/libs/state-management/state';
import { handleUpdate } from '@/libs/utils/settings-utils';

const modelOptions = [
    { label: 'Llama-3-8B-Instruct-q4f32_1-MLC-1k (5.3gb VRAM)', value: 'Llama-3-8B-Instruct-q4f32_1-MLC-1k' },
    { label: 'Llama-3-8B-Instruct-q4f16_1-MLC-1k (4.6gb VRAM)', value: 'Llama-3-8B-Instruct-q4f16_1-MLC-1k' },
    { label: 'Llama-3-8B-Instruct-q4f32_1-MLC (6.1gb VRAM)', value: 'Llama-3-8B-Instruct-q4f32_1-MLC' },
    { label: 'Llama-3-8B-Instruct-q4f16_1-MLC (5.0gb VRAM)', value: 'Llama-3-8B-Instruct-q4f16_1-MLC' },
    { label: 'Llama-3-70B-Instruct-q3f16_1-MLC (31.15gb VRAM)', value: 'Llama-3-70B-Instruct-q3f16_1-MLC' },
    { label: 'Phi-3-mini-4k-instruct-q4f16_1-MLC (3.7gb VRAM)', value: 'Phi-3-mini-4k-instruct-q4f16_1-MLC' },
    { label: 'Phi-3-mini-4k-instruct-q4f32_1-MLC (5.5gb VRAM)', value: 'Phi-3-mini-4k-instruct-q4f32_1-MLC' },
    { label: 'Phi-3-mini-4k-instruct-q4f16_1-MLC-1k (2.5gb VRAM)', value: 'Phi-3-mini-4k-instruct-q4f16_1-MLC-1k' },
    { label: 'Phi-3-mini-4k-instruct-q4f32_1-MLC-1k (3.2gb VRAM)', value: 'Phi-3-mini-4k-instruct-q4f32_1-MLC-1k' },
    { label: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC (4.6gb VRAM)', value: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC' },
    { label: 'Mistral-7B-Instruct-v0.3-q4f32_1-MLC (5.6gb VRAM)', value: 'Mistral-7B-Instruct-v0.3-q4f32_1-MLC' },
    { label: 'Qwen2-1.5B-Instruct-q4f16_1-MLC (1.6gb VRAM)', value: 'Qwen2-1.5B-Instruct-q4f16_1-MLC' },
    { label: 'Qwen2-1.5B-Instruct-q4f32_1-MLC (1.9gb VRAM)', value: 'Qwen2-1.5B-Instruct-q4f32_1-MLC' },
    { label: 'Qwen2-7B-Instruct-q4f16_1-MLC (5.1gb VRAM)', value: 'Qwen2-7B-Instruct-q4f16_1-MLC' },
    { label: 'Qwen2-7B-Instruct-q4f32_1-MLC (5.9gb VRAM)', value: 'Qwen2-7B-Instruct-q4f32_1-MLC' },
    { label: 'Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC (5.0gb VRAM)', value: 'Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC' },
    { label: 'Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC (6.1gb VRAM)', value: 'Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC' },
    { label: 'Hermes-2-Pro-Mistral-7B-q4f16_1-MLC (4.0gb VRAM)', value: 'Hermes-2-Pro-Mistral-7B-q4f16_1-MLC' },
    { label: 'OpenHermes-2.5-Mistral-7B-q4f16_1-MLC (4.6gb VRAM)', value: 'OpenHermes-2.5-Mistral-7B-q4f16_1-MLC' },
    { label: 'NeuralHermes-2.5-Mistral-7B-q4f16_1-MLC (4.6gb VRAM)', value: 'NeuralHermes-2.5-Mistral-7B-q4f16_1-MLC' },
    { label: 'WizardMath-7B-V1.1-q4f16_1-MLC (4.6gb VRAM)', value: 'WizardMath-7B-V1.1-q4f16_1-MLC' },
    { label: 'gemma-2b-it-q4f32_1-MLC (1.8gb VRAM)', value: 'gemma-2b-it-q4f32_1-MLC' },
    { label: 'stablelm-2-zephyr-1_6b-q4f16_1-MLC (1.18gb VRAM)', value: 'stablelm-2-zephyr-1_6b-q4f16_1-MLC' },
    { label: 'stablelm-2-zephyr-1_6b-q4f32_1-MLC (1.51gb VRAM)', value: 'stablelm-2-zephyr-1_6b-q4f32_1-MLC' },
    { label: 'RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC (2.97gb VRAM)', value: 'RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC' },
    { label: 'RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC (3.93gb VRAM)', value: 'RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC' },
    { label: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC (0.7gb VRAM)', value: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC' },
    { label: 'TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC (0.84gb VRAM)', value: 'TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC' }
];
</script>

<style scoped lang="scss">
.select-listbox {

    label {
        font-size: 18px
    }

    .p-listbox {
        background-color: transparent;
        border: 2px solid #157474;
        width: 99%;
        max-width: 99%;
        cursor: pointer;
        font-size: 16px;
        height: 50vh;
        max-height: 50vh;
        overflow: auto;

        @media (max-width: 600px) {
            height: 78vh;
            max-height: 78vh;
        }

        &:hover {
            background-color: #262627;
        }

        &:focus {
            outline: none;
        }
    }

}
</style>
