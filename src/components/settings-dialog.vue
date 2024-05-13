<!-- eslint-disable no-unused-vars -->
<script setup>
import { RefreshCcw } from 'lucide-vue-next';
import InputField from './InputField.vue';
import { ref } from 'vue';

const props = defineProps({
    isSidebarOpen: Boolean,
    selectedModel: String,
    localModelName: String,
    localModelEndpoint: String,
    localModelKey: String,
    huggingFaceEndpoint: String,
    localSliderValue: Number,
    gptKey: String,
    sliderValue: Number,
    claudeKey: String,
    claudeSliderValue: Number,
    selectedDallEImageCount: Number,
    selectedDallEImageResolution: String,
    selectedAutoSaveOption: String,
    browserModelSelection: String,
    maxTokens: Number,
    top_P: Number,
    repetitionPenalty: Number,
    systemPrompt: String
});

const showGPTConfig = ref((props.selectedModel.indexOf("gpt") !== -1));
const showLocalConfig = ref((props.selectedModel.indexOf("open-ai-format") !== -1));
const showClaudeConfig = ref((props.selectedModel.indexOf("claude") !== -1));
const showBrowserModelConfig = ref((props.selectedModel.indexOf("web-llm") !== -1));

// New visibility states for collapsible config sections
const isGeneralConfigOpen = ref(true);
const isBrowserModelConfigOpen = ref(true);
const isLocalConfigOpen = ref(true);
const isGPTConfigOpen = ref(true);
const isDALLEConfigOpen = ref(true);
const isClaudeConfigOpen = ref(true);

const emit = defineEmits([
    'update:repetitionPenalty',
    'update:maxTokens',
    'update:top_P',
    'update:model',
    'update:localModelName',
    'update:localModelKey',
    'update:localModelEndpoint',
    'update:localSliderValue',
    'update:gptKey',
    'update:sliderValue',
    'update:claudeKey',
    'update:claudeSliderValue',
    'update:selectedDallEImageCount',
    'update:selectedDallEImageResolution',
    'update:selectedAutoSaveOption',
    'update:browserModelSelection',
    'toggle-sidebar',
    'update:systemPrompt'
]);

const update = (field, value) => {
    if (field === "model") {
        showGPTConfig.value = (value.indexOf("gpt") !== -1);
        showLocalConfig.value = (value.indexOf("open-ai-format") !== -1);
        showClaudeConfig.value = (value.indexOf("claude") !== -1);
        showBrowserModelConfig.value = (value.indexOf("web-llm") !== -1);
    }

    emit(`update:${field}`, value);
};

function reloadPage() {
    window.location.reload();
}

function toggleSidebar() {
    emit('toggle-sidebar');
}

const updateLocalSliderValue = (value) => {
    update('localSliderValue', parseFloat(value));
};

const updateTopPSliderValue = (value) => {
    update('top_P', parseFloat(value));
};

const updateRepetitionSliderValue = (value) => {
    update('repetitionPenalty', parseFloat(value));
};
</script>

<template>
    <div class="settings-dialog">
        <div class="settings-header">
            <h2>
                <span @click="reloadPage">
                    <RefreshCcw :size="23" :stroke-width="2" />
                </span>
                Settings | V6.0.9
            </h2>
        </div>
        <div class="sidebar-content-container">
            <div class="config-section" :class="{ 'show': isGeneralConfigOpen }">
                <h3 @click="isGeneralConfigOpen = !isGeneralConfigOpen">
                    General Config
                    <span class="indicator">{{ isGeneralConfigOpen ? '-' : '+' }}</span>
                </h3>
                <div v-show="isGeneralConfigOpen" class="control-grid">
                    <div class="control select-dropdown">
                        <label for="model-selector">Model:</label>
                        <select id="model-selector" :value="selectedModel"
                            @change="update('model', $event.target.value)">
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                            <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                            <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                            <option value="open-ai-format">Custom API Endpoint</option>
                            <option value="web-llm">Local Browser Model</option>
                        </select>
                    </div>
                    <div class="control select-dropdown">
                        <label for="auto-save-conversations">Auto Save Conversations:</label>
                        <select id="auto-save-conversations" :value="selectedAutoSaveOption"
                            @change="update('selectedAutoSaveOption', $event.target.value)">
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <InputField labelText="System Prompt:" inputId="system-prompt" :value="systemPrompt"
                        @update:value="update('systemPrompt', $event)" :isSecret="false" :isMultiline="true"
                        :placeholderText="'Enter the system prompt if applicable.'" />
                </div>
            </div>

            <div class="config-section" :class="{ 'show': isBrowserModelConfigOpen }" v-show="showBrowserModelConfig">
                <h3 @click="isBrowserModelConfigOpen = !isBrowserModelConfigOpen">
                    Local Browser Model (Chrome and Edge Only)
                    <span class="indicator">{{ isBrowserModelConfigOpen ? '-' : '+' }}</span>
                </h3>
                <div v-show="isBrowserModelConfigOpen" class="control select-dropdown">
                    <label for="localModelsSelection">Model To Load In Browser:</label>
                    <select id="localModelsSelection" :value="browserModelSelection"
                        @change="update('browserModelSelection', $event.target.value)">
                        @change="update('browserModelSelection', $event.target.value)">

                        <option value="Llama-3-8B-Instruct-q4f32_1">Llama-3-8B-Instruct-q4f32 (~6.1gb VRAM)</option>
                        <option value="Llama-3-8B-Instruct-q4f16_1-1k">Llama-3-8B-Instruct-q4f16 1k Context (~4.6gb
                            VRAM)</option>
                        <option value="Llama-3-8B-Instruct-q4f32_1-1k">Llama-3-8B-Instruct-q4f32 1k Context (~5.2gb
                            VRAM)</option>
                        <option value="Llama-2-7b-chat-hf-q4f16_1">Llama-2-7b-chat-hf-q4f16 (~6.8gb VRAM)</option>
                        <option value="TinyLlama-1.1B-Chat-v0.4-q4f32_1-1k">TinyLlama-1.1B-Chat-v0.4-q4f32 1k Context
                            (~1.0gb
                            VRAM)</option>
                        <option value="TinyLlama-1.1B-Chat-v0.4-q0f32">TinyLlama-1.1B-Chat-v0.4-q0f32 (~5.3gb VRAM)
                        </option>
                        <option value="Mistral-7B-Instruct-v0.2-q4f16_1">Mistral-7B-Instruct-v0.2 (~6.1gb VRAM)</option>
                        <option value="OpenHermes-2.5-Mistral-7B-q4f16_1">OpenHermes-2.5-Mistral-7B (~6.1gb VRAM)
                        </option>
                        <option value="WizardMath-7B-V1.1-q4f16_1">WizardMath-7B-V1.1-q4f16 (~6.1gb VRAM)
                        </option>
                        <option value="NeuralHermes-2.5-Mistral-7B-q4f16_1">NeuralHermes-2.5-Mistral-7B-q4f16 (~6.1gb
                            VRAM)
                        </option>
                        <option value="gemma-2b-it-q4f32_1">gemma-2b-it-q4f32 (~1.8gb VRAM)
                        </option>
                        <option value="gemma-2b-it-q4f32_1-1k">gemma-2b-it-q4f32 1k Context (~1.6gb VRAM)
                        </option>
                    </select>
                </div>
            </div>

            <div class="config-section" :class="{ 'show': isLocalConfigOpen }" v-show="showLocalConfig">
                <h3 @click="isLocalConfigOpen = !isLocalConfigOpen">
                    Custom Endpoint Config (Open AI Format)
                    <span class="indicator">{{ isLocalConfigOpen ? '-' : '+' }}</span>
                </h3>
                <div v-show="isLocalConfigOpen" class="control-grid">
                    <InputField v-show="showLocalConfig" labelText="Model Name:" inputId="model-name"
                        :value="localModelName" @update:value="update('localModelName', $event)" :isSecret="false"
                        :placeholderText="'Enter the model name'" />
                    <InputField v-show="showLocalConfig" :isSecret="false" labelText="API Endpoint:"
                        :placeholderText="'Enter the base API Endpoint URL'" inputId="local-model-endpoint"
                        :value="localModelEndpoint" @update:value="update('localModelEndpoint', $event)" />
                    <InputField v-show="showLocalConfig" :isSecret="true" labelText="API Key:"
                        :placeholderText="'Enter the API key if applicable'" inputId="local-model-key"
                        :value="localModelKey" @update:value="update('localModelKey', $event)" />
                    <InputField v-show="showLocalConfig" labelText="Max Tokens:" :isSecret="false"
                        :placeholderText="'Enter the max token limit if applicable'" inputId="max-tokens"
                        :value="maxTokens.toString()" @update:value="update('maxTokens', $event)" />
                    <InputField v-show="showLocalConfig || showBrowserModelConfig" labelText="Temperature (0.0-2.0):"
                        :isSecret="false" :placeholderText="'Enter the temperature value for the model.'"
                        inputId="localSliderValue" :value="localSliderValue.toString()"
                        @update:value="update('localSliderValue', $event)" />
                    <div class="slider-container">
                        <span>Serious</span>
                        <input type="range" min="0" max="2" step="0.01" :value="localSliderValue"
                            @input="updateLocalSliderValue($event.target.value)">
                        <span>Creative</span>
                    </div>
                    <InputField v-show="showLocalConfig || showBrowserModelConfig" labelText="Top_P Value (0.0-1.0):"
                        :isSecret="false" :placeholderText="'Enter the top_P value if applicable'" inputId="top_P"
                        :value="top_P.toString()" @update:value="update('top_P', $event)" />
                    <div class="slider-container">
                        <span>Lower</span>
                        <input type="range" min="0" max="1" step="0.01" :value="top_P"
                            @input="updateTopPSliderValue($event.target.value)">
                        <span>Higher</span>
                    </div>
                    <InputField v-show="showLocalConfig || showBrowserModelConfig"
                        labelText="Repetition Penalty (0.0-2.0):" :isSecret="false"
                        :placeholderText="'Enter the repetition penalty value if applicable'"
                        inputId="repetitionPenalty" :value="repetitionPenalty.toString()"
                        @update:value="update('repetitionPenalty', $event)" />
                    <div class="slider-container">
                        <span>Less</span>
                        <input type="range" min="0" max="2" step="0.01" :value="repetitionPenalty"
                            @input="updateRepetitionSliderValue($event.target.value)">
                        <span>More</span>
                    </div>
                </div>
            </div>

            <div class="config-section" :class="{ 'show': isGPTConfigOpen }" v-show="showGPTConfig">
                <h3 @click="isGPTConfigOpen = !isGPTConfigOpen">
                    GPT Config
                    <span class="indicator">{{ isGPTConfigOpen ? '-' : '+' }}</span>
                </h3>
                <div v-show="isGPTConfigOpen" class="control-grid">
                    <InputField :labelText="'API Key'" :isSecret="true" :placeholderText="'Enter the API Key'"
                        inputId="api-key" :value="gptKey" @update:value="update('gptKey', $event)" />
                    <div class="slider-container">
                        <span>Serious</span>
                        <input type="range" min="0" max="100" :value="sliderValue"
                            @blur="update('sliderValue', $event.target.value)">
                        <span>Creative</span>
                    </div>
                </div>
            </div>

            <div class="config-section" :class="{ 'show': isClaudeConfigOpen }" v-show="showClaudeConfig">
                <h3 @click="isClaudeConfigOpen = !isClaudeConfigOpen">
                    Claude Config
                    <span class="indicator">{{ isClaudeConfigOpen ? '-' : '+' }}</span>
                </h3>
                <div v-show="isClaudeConfigOpen" class="control-grid">
                    <InputField :labelText="'API Key'" :isSecret="true" :placeholderText="'Enter the API Key'"
                        inputId="claude-api-key" :value="claudeKey" @update:value="update('claudeKey', $event)" />
                    <div class="slider-container">
                        <span>Serious</span>
                        <input type="range" min="0" max="100" :value="claudeSliderValue"
                            @blur="update('claudeSliderValue', $event.target.value)">
                        <span>Creative</span>
                    </div>
                </div>
            </div>

            <div class="config-section" :class="{ 'show': isDALLEConfigOpen }" v-show="showGPTConfig">
                <h3 @click="isDALLEConfigOpen = !isDALLEConfigOpen">
                    DALL-E Config
                    <span class="indicator">{{ isDALLEConfigOpen ? '-' : '+' }}</span>
                </h3>
                <div v-show="isDALLEConfigOpen" class="control-grid">
                    <div class="control select-dropdown">
                        <label for="dalle-image-count">DALL-E Image Count:</label>
                        <select id="dalle-image-count" :value="selectedDallEImageCount"
                            @change="update('selectedDallEImageCount', $event.target.value)">
                            <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                        </select>
                    </div>
                    <div class="control select-dropdown">
                        <label for="dalle-image-resolution">Image Resolution:</label>
                        <select id="dalle-image-resolution" :value="selectedDallEImageResolution"
                            @change="update('selectedDallEImageResolution', $event.target.value)">
                            <option value="256x256">256x256</option>
                            <option value="512x512">512x512</option>
                            <option value="1024x1024">1024x1024</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom-panel">
            <button class="close-btn" @click="toggleSidebar">Close</button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$shadow-color: #252629;
$shadow-offset-x: 0px;
$shadow-offset-y: 1px;
$shadow-blur-radius: 2px;
$shadow-spread-radius: 0px;
$icon-color: rgb(187, 187, 187);

.settings-dialog {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 99vw;
}

.sidebar-content-container {
    flex-grow: 1;
    overflow-y: auto;
    padding: 6px;
    overflow: hidden;
    z-index: 10000;
    background-color: #181f20;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: auto;
    scrollbar-width: none;
}

.select-dropdown {
    select {
        appearance: none;
        background-color: #333;
        color: #fff;
        padding: 6px;
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

    option {
        background-color: #222;
        color: #fff;
    }
}

.config-section {
    margin-bottom: 30px;

    h3 {
        margin-bottom: 15px;
        background-color: #181f20;
        font-size: 16px;
        font-weight: bold;
        text-align: left;
        position: relative;
        border-bottom: 3px solid #1b6a72c4;
        // width: 112%;
        // left: -21px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 8px;

    }

    .control-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        transition: max-height 0.3s ease-in-out;
        overflow: hidden;
        max-height: 0;
        /* Start collapsed */
    }

    &.show .control-grid {
        max-height: fit-content;
    }

}

.settings-header {
    font-size: 19px;
    font-weight: bold;
    text-align: center;
    margin-top: -7px;
    position: relative;
    border-bottom: 5px solid #583e72b5;
    padding-bottom: 25px;
    padding-top: 25px;
    background-color: #212121;
}

.close-btn {
    align-self: flex-end;
    padding: 10px;
    border: none;
    color: white;
    cursor: pointer;
    width: 100%;
    font-size: 16px;
    height: 40px;
    outline: none;
    transition: background-color 0.3s ease;
    background-color: #1e1e1e;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: bold;
    border-bottom: 3px solid #865757cf;

    &:hover {
        background-color: #6f383889;
    }

    &:active {
        background-color: #2c3e50;
        transform: translateY(1px);
    }
}

.box {
    box-shadow: $shadow-offset-x $shadow-offset-y $shadow-blur-radius $shadow-spread-radius $shadow-color;
}

.no-style-link {
    text-decoration: none;
    color: $icon-color;

    &:hover,
    &:focus {
        text-decoration: none;
    }
}

.slider-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    input[type="range"] {
        -webkit-appearance: none;
        flex-grow: 1;
        height: 15px;
        border-radius: 5px;
        background: #1c302e;
        outline: none;
        margin-left: 10px;

        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: #1a5951;
            cursor: pointer;
        }

        &::-moz-range-thumb {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: #1a5951;
            cursor: pointer;
        }
    }
}

.control {
    margin-bottom: 0;
}

.bottom-panel {
    padding: 20px;
    background-color: #1e1e1e;
    border-top: 2px solid #5f4575cf;

}
</style>
