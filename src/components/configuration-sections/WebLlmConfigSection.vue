<template>
    <div class="webllm-config-card">
        <div class="card-header">
            <Globe size="18" class="header-icon" />
            <h3>Browser ML Models</h3>
        </div>
        <div class="card-content">
            <div class="info-section">
                <p class="description">
                    These models run entirely in your browser using WebGPU. No data is sent to any server, 
                    providing complete privacy. Model size is indicated by VRAM requirements.
                </p>
                <div class="stats-container">
                    <div class="stat-item">
                        <Cpu size="16" />
                        <div class="stat-content">
                            <span class="stat-label">Selected Model</span>
                            <span class="stat-value">{{ getSelectedModelName() }}</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <HardDrive size="16" />
                        <div class="stat-content">
                            <span class="stat-label">VRAM Required</span>
                            <span class="stat-value">{{ getSelectedModelVRAM() }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="model-selection">
                <label for="localModelsSelection">Choose a model to load:</label>
                <div class="filter-info">
                    <Search size="14" />
                    <span>Filter by name, size, or model family</span>
                </div>
                <Listbox filter id="localModelsSelection" :options="modelOptions" optionLabel="label" optionValue="value"
                    v-model="browserModelSelection" @change="handleUpdate('browserModelSelection', browserModelSelection)" />
            </div>
        </div>
    </div>
</template>
<script setup>
import { browserModelSelection } from '@/libs/state-management/state';
import { handleUpdate } from '@/libs/utils/settings-utils';
import { Globe, Cpu, HardDrive, Search } from 'lucide-vue-next';

const model_list = [
    // Llama-3.2
    {
        model: "https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC",
        model_id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Llama-3.2-1B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1128.82,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC",
        model_id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Llama-3.2-1B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 879.04,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q0f32-MLC",
        model_id: "Llama-3.2-1B-Instruct-q0f32-MLC",
        model_lib:

            "/Llama-3.2-1B-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 5106.26,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q0f16-MLC",
        model_id: "Llama-3.2-1B-Instruct-q0f16-MLC",
        model_lib:

            "/Llama-3.2-1B-Instruct-q0f16-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2573.13,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f32_1-MLC",
        model_id: "Llama-3.2-3B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Llama-3.2-3B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2951.51,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f16_1-MLC",
        model_id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Llama-3.2-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2263.69,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },
    // Llama-3.1
    {
        model: "https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f32_1-MLC",
        model_id: "Llama-3.1-8B-Instruct-q4f32_1-MLC-1k",
        model_lib:

            "/Llama-3_1-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 5295.7,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f16_1-MLC",
        model_id: "Llama-3.1-8B-Instruct-q4f16_1-MLC-1k",
        model_lib:

            "/Llama-3_1-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4598.34,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f32_1-MLC",
        model_id: "Llama-3.1-8B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Llama-3_1-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 6101.01,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f16_1-MLC",
        model_id: "Llama-3.1-8B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Llama-3_1-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 5001.0,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    // DeepSeek-R1-Distill-Qwen
    // TODO(Charlie): Qwen2-1.5B is experiencing correctness issue, hence commented for now.
    // {
    //   model: "https://huggingface.co/mlc-ai/DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC",
    //   model_id: "DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC",
    //   model_lib:
    //     modelLibURLPrefix +
    //     modelVersion +
    //     "/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
    //   low_resource_required: true,
    //   vram_required_MB: 1629.75,
    //   overrides: {
    //     context_window_size: 4096,
    //   },
    // },
    // {
    //   model: "https://huggingface.co/mlc-ai/DeepSeek-R1-Distill-Qwen-1.5B-q4f32_1-MLC",
    //   model_id: "DeepSeek-R1-Distill-Qwen-1.5B-q4f32_1-MLC",
    //   model_lib:
    //     modelLibURLPrefix +
    //     modelVersion +
    //     "/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
    //   low_resource_required: true,
    //   vram_required_MB: 1888.97,
    //   overrides: {
    //     context_window_size: 4096,
    //   },
    // },
    {
        model:
            "https://huggingface.co/mlc-ai/DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC",
        model_id: "DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC",
        model_lib:

            "/Qwen2-7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: false,
        vram_required_MB: 5106.67,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/DeepSeek-R1-Distill-Qwen-7B-q4f32_1-MLC",
        model_id: "DeepSeek-R1-Distill-Qwen-7B-q4f32_1-MLC",
        model_lib:

            "/Qwen2-7B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: false,
        vram_required_MB: 5900.09,
        overrides: {
            context_window_size: 4096,
        },
    },
    // DeepSeek-R1-Distill-Llama
    {
        model:
            "https://huggingface.co/mlc-ai/DeepSeek-R1-Distill-Llama-8B-q4f32_1-MLC",
        model_id: "DeepSeek-R1-Distill-Llama-8B-q4f32_1-MLC",
        model_lib:

            "/Llama-3_1-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 6101.01,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC",
        model_id: "DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC",
        model_lib:

            "/Llama-3_1-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 5001.0,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    // Hermes-3 and Hermes-2
    {
        model:
            "https://huggingface.co/mlc-ai/Hermes-2-Theta-Llama-3-8B-q4f16_1-MLC",
        model_id: "Hermes-2-Theta-Llama-3-8B-q4f16_1-MLC",
        model_lib:

            "/Llama-3-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4976.13,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Hermes-2-Theta-Llama-3-8B-q4f32_1-MLC",
        model_id: "Hermes-2-Theta-Llama-3-8B-q4f32_1-MLC",
        model_lib:

            "/Llama-3-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 6051.27,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC",
        model_id: "Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC",
        model_lib:

            "/Llama-3-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4976.13,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC",
        model_id: "Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC",
        model_lib:

            "/Llama-3-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 6051.27,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Hermes-3-Llama-3.2-3B-q4f32_1-MLC",
        model_id: "Hermes-3-Llama-3.2-3B-q4f32_1-MLC",
        model_lib:

            "/Llama-3.2-3B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2951.51,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Hermes-3-Llama-3.2-3B-q4f16_1-MLC",
        model_id: "Hermes-3-Llama-3.2-3B-q4f16_1-MLC",
        model_lib:

            "/Llama-3.2-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2263.69,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Hermes-3-Llama-3.1-8B-q4f32_1-MLC",
        model_id: "Hermes-3-Llama-3.1-8B-q4f32_1-MLC",
        model_lib:

            "/Llama-3_1-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 5779.27,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Hermes-3-Llama-3.1-8B-q4f16_1-MLC",
        model_id: "Hermes-3-Llama-3.1-8B-q4f16_1-MLC",
        model_lib:

            "/Llama-3_1-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4876.13,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Hermes-2-Pro-Mistral-7B-q4f16_1-MLC",
        model_id: "Hermes-2-Pro-Mistral-7B-q4f16_1-MLC",
        model_lib:

            "/Mistral-7B-Instruct-v0.3-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4033.28,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
            sliding_window_size: -1,
        },
    },
    // Phi3.5-mini-instruct
    {
        model: "https://huggingface.co/mlc-ai/Phi-3.5-mini-instruct-q4f16_1-MLC",
        model_id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
        model_lib:

            "/Phi-3.5-mini-instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 3672.07,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Phi-3.5-mini-instruct-q4f32_1-MLC",
        model_id: "Phi-3.5-mini-instruct-q4f32_1-MLC",
        model_lib:

            "/Phi-3.5-mini-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 5483.12,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Phi-3.5-mini-instruct-q4f16_1-MLC",
        model_id: "Phi-3.5-mini-instruct-q4f16_1-MLC-1k",
        model_lib:

            "/Phi-3.5-mini-instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2520.07,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Phi-3.5-mini-instruct-q4f32_1-MLC",
        model_id: "Phi-3.5-mini-instruct-q4f32_1-MLC-1k",
        model_lib:

            "/Phi-3.5-mini-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 3179.12,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    // Phi-3.5-vision-instruct
    {
        model:
            "https://huggingface.co/mlc-ai/Phi-3.5-vision-instruct-q4f16_1-MLC",
        model_id: "Phi-3.5-vision-instruct-q4f16_1-MLC",
        model_lib:

            "/Phi-3.5-vision-instruct-q4f16_1-ctx4k_cs2k-webgpu.wasm",
        vram_required_MB: 3952.18,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
        model_type: '',
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Phi-3.5-vision-instruct-q4f32_1-MLC",
        model_id: "Phi-3.5-vision-instruct-q4f32_1-MLC",
        model_lib:

            "/Phi-3.5-vision-instruct-q4f32_1-ctx4k_cs2k-webgpu.wasm",
        vram_required_MB: 5879.84,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
        model_type: '',
    },
    // Mistral variants
    {
        model:
            "https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
        model_id: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
        model_lib:

            "/Mistral-7B-Instruct-v0.3-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4573.39,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
            sliding_window_size: -1,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.3-q4f32_1-MLC",
        model_id: "Mistral-7B-Instruct-v0.3-q4f32_1-MLC",
        model_lib:

            "/Mistral-7B-Instruct-v0.3-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 5619.27,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
            sliding_window_size: -1,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.2-q4f16_1-MLC",
        model_id: "Mistral-7B-Instruct-v0.2-q4f16_1-MLC",
        model_lib:

            "/Mistral-7B-Instruct-v0.3-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4573.39,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
            sliding_window_size: -1,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/OpenHermes-2.5-Mistral-7B-q4f16_1-MLC",
        model_id: "OpenHermes-2.5-Mistral-7B-q4f16_1-MLC",
        model_lib:

            "/Mistral-7B-Instruct-v0.3-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4573.39,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
            sliding_window_size: -1,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/NeuralHermes-2.5-Mistral-7B-q4f16_1-MLC",
        model_id: "NeuralHermes-2.5-Mistral-7B-q4f16_1-MLC",
        model_lib:

            "/Mistral-7B-Instruct-v0.3-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4573.39,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
            sliding_window_size: -1,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/WizardMath-7B-V1.1-q4f16_1-MLC",
        model_id: "WizardMath-7B-V1.1-q4f16_1-MLC",
        model_lib:

            "/Mistral-7B-Instruct-v0.3-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4573.39,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
            sliding_window_size: -1,
        },
    },
    // SmolLM2
    {
        model: "https://huggingface.co/mlc-ai/SmolLM2-1.7B-Instruct-q4f16_1-MLC",
        model_id: "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
        model_lib:

            "/SmolLM2-1.7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1774.19,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/SmolLM2-1.7B-Instruct-q4f32_1-MLC",
        model_id: "SmolLM2-1.7B-Instruct-q4f32_1-MLC",
        model_lib:

            "/SmolLM2-1.7B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2692.38,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },

    {
        model: "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q0f16-MLC",
        model_id: "SmolLM2-360M-Instruct-q0f16-MLC",
        model_lib:

            "/SmolLM2-360M-Instruct-q0f16-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 871.99,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q0f32-MLC",
        model_id: "SmolLM2-360M-Instruct-q0f32-MLC",
        model_lib:

            "/SmolLM2-360M-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1743.99,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q4f16_1-MLC",
        model_id: "SmolLM2-360M-Instruct-q4f16_1-MLC",
        model_lib:

            "/SmolLM2-360M-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 376.06,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q4f32_1-MLC",
        model_id: "SmolLM2-360M-Instruct-q4f32_1-MLC",
        model_lib:

            "/SmolLM2-360M-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 579.61,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/SmolLM2-135M-Instruct-q0f16-MLC",
        model_id: "SmolLM2-135M-Instruct-q0f16-MLC",
        model_lib:

            "/SmolLM2-135M-Instruct-q0f16-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 359.69,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/SmolLM2-135M-Instruct-q0f32-MLC",
        model_id: "SmolLM2-135M-Instruct-q0f32-MLC",
        model_lib:

            "/SmolLM2-135M-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 719.38,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },
    // Gemma2
    {
        model: "https://huggingface.co/mlc-ai/gemma-2-2b-it-q4f16_1-MLC",
        model_id: "gemma-2-2b-it-q4f16_1-MLC",
        model_lib:

            "/gemma-2-2b-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1895.3,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/gemma-2-2b-it-q4f32_1-MLC",
        model_id: "gemma-2-2b-it-q4f32_1-MLC",
        model_lib:

            "/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2508.75,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/gemma-2-2b-it-q4f16_1-MLC",
        model_id: "gemma-2-2b-it-q4f16_1-MLC-1k",
        model_lib:

            "/gemma-2-2b-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1583.3,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/gemma-2-2b-it-q4f32_1-MLC",
        model_id: "gemma-2-2b-it-q4f32_1-MLC-1k",
        model_lib:

            "/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1884.75,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/gemma-2-9b-it-q4f16_1-MLC",
        model_id: "gemma-2-9b-it-q4f16_1-MLC",
        model_lib:

            "/gemma-2-9b-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 6422.01,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/gemma-2-9b-it-q4f32_1-MLC",
        model_id: "gemma-2-9b-it-q4f32_1-MLC",
        model_lib:

            "/gemma-2-9b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 8383.33,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    // Gemma2-2b-jpn
    {
        model: "https://huggingface.co/mlc-ai/gemma-2-2b-jpn-it-q4f16_1-MLC",
        model_id: "gemma-2-2b-jpn-it-q4f16_1-MLC",
        model_lib:

            "/gemma-2-2b-jpn-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1895.3,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/gemma-2-2b-jpn-it-q4f32_1-MLC",
        model_id: "gemma-2-2b-jpn-it-q4f32_1-MLC",
        model_lib:

            "/gemma-2-2b-jpn-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2508.75,
        low_resource_required: true,
        overrides: {
            context_window_size: 4096,
        },
    },
    // Qwen-2
    {
        model: "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2-0.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 944.62,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2.5-0.5B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2-0.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1060.2,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q0f16-MLC",
        model_id: "Qwen2.5-0.5B-Instruct-q0f16-MLC",
        model_lib:

            "/Qwen2-0.5B-Instruct-q0f16-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1624.12,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q0f32-MLC",
        model_id: "Qwen2.5-0.5B-Instruct-q0f32-MLC",
        model_lib:

            "/Qwen2-0.5B-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 2654.75,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1629.75,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2.5-1.5B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1888.97,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2.5-3B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2.5-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 2504.76,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2.5-3B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2.5-3B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2.5-3B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 2893.64,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2.5-7B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2.5-7B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2-7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: false,
        vram_required_MB: 5106.67,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2.5-7B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2.5-7B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2-7B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: false,
        vram_required_MB: 5900.09,
        overrides: {
            context_window_size: 4096,
        },
    },
    // Qwen2.5-Coder
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2-0.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 944.62,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2.5-Coder-0.5B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2.5-Coder-0.5B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2-0.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1060.2,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2.5-Coder-0.5B-Instruct-q0f16-MLC",
        model_id: "Qwen2.5-Coder-0.5B-Instruct-q0f16-MLC",
        model_lib:

            "/Qwen2-0.5B-Instruct-q0f16-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1624.12,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2.5-Coder-0.5B-Instruct-q0f32-MLC",
        model_id: "Qwen2.5-Coder-0.5B-Instruct-q0f32-MLC",
        model_lib:

            "/Qwen2-0.5B-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 2654.75,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: false,
        vram_required_MB: 1629.75,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: false,
        vram_required_MB: 1888.97,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2.5-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 2504.76,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2.5-Coder-3B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2.5-Coder-3B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2.5-3B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 2893.64,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2-7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: false,
        vram_required_MB: 5106.67,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2.5-Coder-7B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2.5-Coder-7B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2-7B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: false,
        vram_required_MB: 5900.09,
        overrides: {
            context_window_size: 4096,
        },
    },
    // Qwen2.5-Math
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2.5-Math-1.5B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2.5-Math-1.5B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1629.75,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2.5-Math-1.5B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2.5-Math-1.5B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1888.97,
        overrides: {
            context_window_size: 4096,
        },
    },
    // StableLM-zephyr-1.6B
    {
        model: "https://huggingface.co/mlc-ai/stablelm-2-zephyr-1_6b-q4f16_1-MLC",
        model_id: "stablelm-2-zephyr-1_6b-q4f16_1-MLC",
        model_lib:

            "/stablelm-2-zephyr-1_6b-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2087.66,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/stablelm-2-zephyr-1_6b-q4f32_1-MLC",
        model_id: "stablelm-2-zephyr-1_6b-q4f32_1-MLC",
        model_lib:

            "/stablelm-2-zephyr-1_6b-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2999.33,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/stablelm-2-zephyr-1_6b-q4f16_1-MLC",
        model_id: "stablelm-2-zephyr-1_6b-q4f16_1-MLC-1k",
        model_lib:

            "/stablelm-2-zephyr-1_6b-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1511.66,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/stablelm-2-zephyr-1_6b-q4f32_1-MLC",
        model_id: "stablelm-2-zephyr-1_6b-q4f32_1-MLC-1k",
        model_lib:

            "/stablelm-2-zephyr-1_6b-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1847.33,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    // RedPajama
    {
        model:
            "https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
        model_id: "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
        model_lib:

            "/RedPajama-INCITE-Chat-3B-v1-q4f16_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 2972.09,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 2048,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC",
        model_id: "RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC",
        model_lib:

            "/RedPajama-INCITE-Chat-3B-v1-q4f32_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 3928.09,
        low_resource_required: false,
        overrides: {
            context_window_size: 2048,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
        model_id: "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC-1k",
        model_lib:

            "/RedPajama-INCITE-Chat-3B-v1-q4f16_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 2041.09,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC",
        model_id: "RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC-1k",
        model_lib:

            "/RedPajama-INCITE-Chat-3B-v1-q4f32_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 2558.09,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    // TinyLlama v1.0
    {
        model:
            "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
        model_id: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
        model_lib:

            "/TinyLlama-1.1B-Chat-v1.0-q4f16_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 697.24,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 2048,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC",
        model_id: "TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC",
        model_lib:

            "/TinyLlama-1.1B-Chat-v1.0-q4f32_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 839.98,
        low_resource_required: true,
        overrides: {
            context_window_size: 2048,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
        model_id: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC-1k",
        model_lib:

            "/TinyLlama-1.1B-Chat-v1.0-q4f16_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 675.24,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC",
        model_id: "TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC-1k",
        model_lib:

            "/TinyLlama-1.1B-Chat-v1.0-q4f32_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 795.98,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    // BELOW ARE MODELS OF OLDER VERSIONS OR NOT AS PRACTICAL
    // Llama-3.1 70B
    {
        model: "https://huggingface.co/mlc-ai/Llama-3.1-70B-Instruct-q3f16_1-MLC",
        model_id: "Llama-3.1-70B-Instruct-q3f16_1-MLC",
        model_lib:

            "/Llama-3_1-70B-Instruct-q3f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 31153.13,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    // Qwen-2
    {
        model: "https://huggingface.co/mlc-ai/Qwen2-0.5B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2-0.5B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2-0.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 944.62,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2-0.5B-Instruct-q0f16-MLC",
        model_id: "Qwen2-0.5B-Instruct-q0f16-MLC",
        model_lib:

            "/Qwen2-0.5B-Instruct-q0f16-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1624.12,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2-0.5B-Instruct-q0f32-MLC",
        model_id: "Qwen2-0.5B-Instruct-q0f32-MLC",
        model_lib:

            "/Qwen2-0.5B-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 2654.75,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2-1.5B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2-1.5B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1629.75,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2-1.5B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2-1.5B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1888.97,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2-7B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2-7B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2-7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: false,
        vram_required_MB: 5106.67,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2-7B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2-7B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2-7B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: false,
        vram_required_MB: 5900.09,
        overrides: {
            context_window_size: 4096,
        },
    },
    // Qwen2-Math
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2-Math-1.5B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2-Math-1.5B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1629.75,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/Qwen2-Math-1.5B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2-Math-1.5B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: true,
        vram_required_MB: 1888.97,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2-Math-7B-Instruct-q4f16_1-MLC",
        model_id: "Qwen2-Math-7B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Qwen2-7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: false,
        vram_required_MB: 5106.67,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Qwen2-Math-7B-Instruct-q4f32_1-MLC",
        model_id: "Qwen2-Math-7B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Qwen2-7B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        low_resource_required: false,
        vram_required_MB: 5900.09,
        overrides: {
            context_window_size: 4096,
        },
    },
    // Llama-3
    {
        model: "https://huggingface.co/mlc-ai/Llama-3-8B-Instruct-q4f32_1-MLC",
        model_id: "Llama-3-8B-Instruct-q4f32_1-MLC-1k",
        model_lib:

            "/Llama-3-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 5295.7,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC",
        model_id: "Llama-3-8B-Instruct-q4f16_1-MLC-1k",
        model_lib:

            "/Llama-3-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4598.34,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-3-8B-Instruct-q4f32_1-MLC",
        model_id: "Llama-3-8B-Instruct-q4f32_1-MLC",
        model_lib:

            "/Llama-3-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 6101.01,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC",
        model_id: "Llama-3-8B-Instruct-q4f16_1-MLC",
        model_lib:

            "/Llama-3-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 5001.0,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-3-70B-Instruct-q3f16_1-MLC",
        model_id: "Llama-3-70B-Instruct-q3f16_1-MLC",
        model_lib:

            "/Llama-3-70B-Instruct-q3f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 31153.13,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    // Phi3-mini-instruct
    {
        model: "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f16_1-MLC",
        model_id: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
        model_lib:

            "/Phi-3-mini-4k-instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 3672.07,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f32_1-MLC",
        model_id: "Phi-3-mini-4k-instruct-q4f32_1-MLC",
        model_lib:

            "/Phi-3-mini-4k-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 5483.12,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f16_1-MLC",
        model_id: "Phi-3-mini-4k-instruct-q4f16_1-MLC-1k",
        model_lib:

            "/Phi-3-mini-4k-instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2520.07,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f32_1-MLC",
        model_id: "Phi-3-mini-4k-instruct-q4f32_1-MLC-1k",
        model_lib:

            "/Phi-3-mini-4k-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 3179.12,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    // Llama-2
    {
        model: "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f32_1-MLC",
        model_id: "Llama-2-7b-chat-hf-q4f32_1-MLC-1k",
        model_lib:

            "/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 5284.01,
        low_resource_required: false,
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f16_1-MLC",
        model_id: "Llama-2-7b-chat-hf-q4f16_1-MLC-1k",
        model_lib:

            "/Llama-2-7b-chat-hf-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4618.52,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f32_1-MLC",
        model_id: "Llama-2-7b-chat-hf-q4f32_1-MLC",
        model_lib:

            "/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 9109.03,
        low_resource_required: false,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f16_1-MLC",
        model_id: "Llama-2-7b-chat-hf-q4f16_1-MLC",
        model_lib:

            "/Llama-2-7b-chat-hf-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 6749.02,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/Llama-2-13b-chat-hf-q4f16_1-MLC",
        model_id: "Llama-2-13b-chat-hf-q4f16_1-MLC",
        model_lib:

            "/Llama-2-13b-chat-hf-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 11814.09,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
        },
    },
    // Gemma-2B
    {
        model: "https://huggingface.co/mlc-ai/gemma-2b-it-q4f16_1-MLC",
        model_id: "gemma-2b-it-q4f16_1-MLC",
        model_lib:

            "/gemma-2b-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1476.52,
        low_resource_required: false,
        buffer_size_required_bytes: 262144000,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/gemma-2b-it-q4f32_1-MLC",
        model_id: "gemma-2b-it-q4f32_1-MLC",
        model_lib:

            "/gemma-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1750.66,
        low_resource_required: false,
        buffer_size_required_bytes: 262144000,
        overrides: {
            context_window_size: 4096,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/gemma-2b-it-q4f16_1-MLC",
        model_id: "gemma-2b-it-q4f16_1-MLC-1k",
        model_lib:

            "/gemma-2b-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1476.52,
        low_resource_required: true,
        buffer_size_required_bytes: 262144000,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/gemma-2b-it-q4f32_1-MLC",
        model_id: "gemma-2b-it-q4f32_1-MLC-1k",
        model_lib:

            "/gemma-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1750.66,
        low_resource_required: true,
        buffer_size_required_bytes: 262144000,
        overrides: {
            context_window_size: 1024,
        },
    },
    // Phi-2
    {
        model: "https://huggingface.co/mlc-ai/phi-2-q4f16_1-MLC",
        model_id: "phi-2-q4f16_1-MLC",
        model_lib:

            "/phi-2-q4f16_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 3053.97,
        low_resource_required: false,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 2048,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/phi-2-q4f32_1-MLC",
        model_id: "phi-2-q4f32_1-MLC",
        model_lib:

            "/phi-2-q4f32_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 4032.48,
        low_resource_required: false,
        overrides: {
            context_window_size: 2048,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/phi-2-q4f16_1-MLC",
        model_id: "phi-2-q4f16_1-MLC-1k",
        model_lib:

            "/phi-2-q4f16_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 2131.97,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/phi-2-q4f32_1-MLC",
        model_id: "phi-2-q4f32_1-MLC-1k",
        model_lib:

            "/phi-2-q4f32_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 2740.48,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    // Phi-1.5
    {
        model: "https://huggingface.co/mlc-ai/phi-1_5-q4f16_1-MLC",
        model_id: "phi-1_5-q4f16_1-MLC",
        model_lib:

            "/phi-1_5-q4f16_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 1210.09,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 2048,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/phi-1_5-q4f32_1-MLC",
        model_id: "phi-1_5-q4f32_1-MLC",
        model_lib:

            "/phi-1_5-q4f32_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 1682.09,
        low_resource_required: true,
        overrides: {
            context_window_size: 2048,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/phi-1_5-q4f16_1-MLC",
        model_id: "phi-1_5-q4f16_1-MLC-1k",
        model_lib:

            "/phi-1_5-q4f16_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 1210.09,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model: "https://huggingface.co/mlc-ai/phi-1_5-q4f32_1-MLC",
        model_id: "phi-1_5-q4f32_1-MLC-1k",
        model_lib:

            "/phi-1_5-q4f32_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 1682.09,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    // TinyLlama v0.4
    {
        model:
            "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
        model_id: "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
        model_lib:

            "/TinyLlama-1.1B-Chat-v0.4-q4f16_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 697.24,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 2048,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
        model_id: "TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
        model_lib:

            "/TinyLlama-1.1B-Chat-v0.4-q4f32_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 839.98,
        low_resource_required: true,
        overrides: {
            context_window_size: 2048,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
        model_id: "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC-1k",
        model_lib:

            "/TinyLlama-1.1B-Chat-v0.4-q4f16_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 675.24,
        low_resource_required: true,
        required_features: ["shader-f16"],
        overrides: {
            context_window_size: 1024,
        },
    },
    {
        model:
            "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
        model_id: "TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC-1k",
        model_lib:

            "/TinyLlama-1.1B-Chat-v0.4-q4f32_1-ctx2k_cs1k-webgpu.wasm",
        vram_required_MB: 795.98,
        low_resource_required: true,
        overrides: {
            context_window_size: 1024,
        },
    },
    // Embedding models
    // -b means max_batch_size this model allows. The smaller it is, the less memory the model consumes.
    {
        model: "https://huggingface.co/mlc-ai/snowflake-arctic-embed-m-q0f32-MLC",
        model_id: "snowflake-arctic-embed-m-q0f32-MLC-b32",
        model_lib:

            "/snowflake-arctic-embed-m-q0f32-ctx512_cs512_batch32-webgpu.wasm",
        vram_required_MB: 1407.51,
        model_type: '',
    },
    {
        model: "https://huggingface.co/mlc-ai/snowflake-arctic-embed-m-q0f32-MLC",
        model_id: "snowflake-arctic-embed-m-q0f32-MLC-b4",
        model_lib:

            "/snowflake-arctic-embed-m-q0f32-ctx512_cs512_batch4-webgpu.wasm",
        vram_required_MB: 539.4,
        model_type: '',
    },
    {
        model: "https://huggingface.co/mlc-ai/snowflake-arctic-embed-s-q0f32-MLC",
        model_id: "snowflake-arctic-embed-s-q0f32-MLC-b32",
        model_lib:

            "/snowflake-arctic-embed-s-q0f32-ctx512_cs512_batch32-webgpu.wasm",
        vram_required_MB: 1022.82,
        model_type: '',
    },
    {
        model: "https://huggingface.co/mlc-ai/snowflake-arctic-embed-s-q0f32-MLC",
        model_id: "snowflake-arctic-embed-s-q0f32-MLC-b4",
        model_lib:

            "/snowflake-arctic-embed-s-q0f32-ctx512_cs512_batch4-webgpu.wasm",
        vram_required_MB: 238.71,
        model_type: '',
    },
];

const modelOptions = model_list.map(({ model_id, vram_required_MB }) => {
    // Convert MB → GB and show two decimals
    const gb = vram_required_MB ? (vram_required_MB / 1024).toFixed(2) : "N/A";
    return { label: `${model_id} (${gb}GB VRAM)`, value: model_id };
});

function getSelectedModelName() {
    const selectedId = browserModelSelection.value;
    if (!selectedId) return "None selected";
    
    // Clean up the model name for display
    const cleanName = selectedId
        .replace(/-MLC.*$/, '')  // Remove MLC suffix and anything after
        .replace(/-q[0-9]f[0-9]+_[0-9]+$/, ''); // Remove quantization details
        
    return cleanName;
}

function getSelectedModelVRAM() {
    const selectedId = browserModelSelection.value;
    if (!selectedId) return "N/A";
    
    const model = model_list.find(m => m.model_id === selectedId);
    if (!model || !model.vram_required_MB) return "Unknown";
    
    const gb = (model.vram_required_MB / 1024).toFixed(2);
    return `${gb} GB`;
}

</script>

<style scoped lang="scss">
$primary-color: #157474;
$primary-light: #1a8f8f;
$primary-dark: #0f5454;
$bg-dark: #1d1e1e;
$bg-card: #252629;

.webllm-config-card {
    background-color: rgba(16, 56, 51, 0.1);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    
    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .card-header {
        background-color: rgba(21, 116, 116, 0.15);
        padding: 14px 16px;
        display: flex;
        align-items: center;
        
        h3 {
            margin: 0;
            font-size: 17px;
            font-weight: 600;
            margin-left: 8px;
        }
        
        .header-icon {
            color: $primary-color;
        }
    }
    
    .card-content {
        padding: 16px;
        
        .info-section {
            margin-bottom: 20px;
            
            .description {
                margin: 0 0 16px 0;
                font-size: 14px;
                line-height: 1.5;
                color: #9fa6ac;
            }
            
            .stats-container {
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
                background-color: rgba(16, 56, 51, 0.15);
                padding: 14px;
                border-radius: 6px;
                
                .stat-item {
                    display: flex;
                    align-items: center;
                    flex: 1;
                    min-width: 200px;
                    
                    svg {
                        color: $primary-color;
                        margin-right: 10px;
                    }
                    
                    .stat-content {
                        display: flex;
                        flex-direction: column;
                        
                        .stat-label {
                            font-size: 12px;
                            color: #9fa6ac;
                        }
                        
                        .stat-value {
                            font-size: 15px;
                            font-weight: 500;
                            color: #e0e0e0;
                        }
                    }
                }
            }
        }
        
        .model-selection {
            label {
                font-size: 16px;
                margin-bottom: 10px;
                display: block;
                color: #e0e0e0;
                font-weight: 500;
            }
            
            .filter-info {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                color: #9fa6ac;
                font-size: 13px;
                
                svg {
                    margin-right: 5px;
                    color: $primary-color;
                }
            }
            
            :deep(.p-listbox) {
                background-color: rgba(30, 30, 30, 0.6);
                border: 1px solid rgba(21, 116, 116, 0.3);
                border-radius: 8px;
                width: 100%;
                padding: 10px;
                font-size: 15px;
                height: 40vh;
                max-height: 40vh;
                overflow: auto;
                transition: all 0.2s ease;
                
                @media (max-width: 600px) {
                    height: 50vh;
                    max-height: 50vh;
                }
                
                &:hover {
                    border-color: rgba(21, 116, 116, 0.5);
                    box-shadow: 0 0 10px rgba(21, 116, 116, 0.1);
                }
                
                .p-listbox-list {
                    padding: 0;
                }
                
                .p-listbox-item {
                    padding: 12px 14px;
                    color: #e0e0e0;
                    transition: background-color 0.2s ease;
                    border-radius: 4px;
                    margin-bottom: 4px;
                    
                    &:hover {
                        background-color: rgba(42, 42, 43, 0.7);
                    }
                    
                    &.p-highlight {
                        background-color: rgba(21, 116, 116, 0.3);
                        border-left: 3px solid $primary-color;
                        color: #ffffff;
                    }
                }
                
                .p-listbox-filter-container {
                    padding: 0 0 10px 0;
                    
                    .p-inputtext {
                        background-color: rgba(42, 42, 43, 0.5);
                        border: 1px solid rgba(58, 58, 59, 0.5);
                        color: #e0e0e0;
                        border-radius: 6px;
                        padding: 10px 12px;
                        width: 100%;
                        transition: all 0.2s ease;
                        
                        &:focus {
                            border-color: $primary-color;
                            background-color: rgba(42, 42, 43, 0.8);
                            box-shadow: 0 0 0 2px rgba(21, 116, 116, 0.2);
                        }
                    }
                    
                    .p-listbox-filter-icon {
                        color: $primary-color;
                        right: 20px;
                        top: 10px;
                    }
                }
            }
            
            :deep(.p-component) {
                font-family: inherit;
            }
        }
    }
}
</style>
