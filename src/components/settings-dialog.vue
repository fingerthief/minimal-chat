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
    repetitionPenalty: Number
});

const showGPTConfig = ref((props.selectedModel.indexOf("gpt") !== -1));
const showLocalConfig = ref((props.selectedModel.indexOf("open-ai-format") !== -1));
const showClaudeConfig = ref((props.selectedModel.indexOf("claude") !== -1));
const showBrowserModelConfig = ref((props.selectedModel.indexOf("web-llm") !== -1));

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
    'toggle-sidebar'
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

</script>

<template>
    <div class="settings-header">
        <h2>
            <span @click="reloadPage">
                <RefreshCcw :size="23" :stroke-width="2" />
            </span>
            Settings | V6.0.0
        </h2>
    </div>
    <div class="sidebar-content-container">
        <div class="config-section">
            <h3>General Config</h3>
        </div>

        <!-- Model Selection -->
        <div class="control select-dropdown">
            <label for="model-selector">Model:</label>
            <select id="model-selector" :value="selectedModel" @change="update('model', $event.target.value)">
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                <option value="open-ai-format">Custom API Endpoint (Open AI Format)</option>
                <option value="web-llm">Local Browser Model (Chrome and Edge Only)</option>
            </select>
        </div>
        <!-- Auto Save Conversations -->
        <div class="control select-dropdown">
            <span>Auto Save Conversations: </span>
            <select id="auto-save-conversations" :value="selectedAutoSaveOption"
                @change="update('selectedAutoSaveOption', $event.target.value)">
                <option value="true">Yes</option>
                <option value="false">No</option>
            </select>
        </div>
        <div class="config-section" v-show="showBrowserModelConfig">
            <h3>Local Browser Model</h3>
        </div>
        <br>
        <div class="control select-dropdown" v-show="showBrowserModelConfig">
            <span>Model To Load In Browser: </span>
            <select id="localModelsSelection" :value="browserModelSelection"
                @change="update('browserModelSelection', $event.target.value)">
                <option value="Llama-3-8B-Instruct-q4f32_1">Llama-3-8B-Instruct-q4f32 (~6.1gb VRAM)</option>
                <option value="Llama-3-8B-Instruct-q4f16_1-1k">Llama-3-8B-Instruct-q4f16 (~4.6gb VRAM)</option>
                <option value="Llama-3-8B-Instruct-q4f32_1-1k">Llama-3-8B-Instruct-q4f32 (~5.2gb VRAM)</option>
                <option value="Mistral-7B-Instruct-v0.2-q4f16_1">Mistral-7B-Instruct-v0.2 (~6.1gb VRAM)</option>
                <option value="OpenHermes-2.5-Mistral-7B-q4f16_1">OpenHermes-2.5-Mistral-7B (~6.1gb VRAM)
                </option>
                <option value="RedPajama-INCITE-Chat-3B-v1-q4f16_1">RedPajama-INCITE-Chat-3B-v1 (~3.0gb VRAM)
                </option>
                <option value="gemma-2b-it-q4f32_1">gemma-2b-it (~1.8gb VRAM)
                </option>
            </select>
        </div>
        <div class="config-section" v-show="showLocalConfig">
            <h3>OpenAI Format Model Config</h3>
        </div>
        <!-- Model Name -->
        <InputField v-show="showLocalConfig" label="Model:" :labelText="'Model Name'" inputId="model-name"
            :value="localModelName" @update:value="update('localModelName', $event)" :isSecret="false"
            :placeholderText="'Enter the model name'" />
        <!-- Model Endpoint -->
        <InputField v-show="showLocalConfig" :isSecret="false" :labelText="'API Endpoint'" label="API Endpoint:"
            :placeholderText="'Enter the base API Endpoint URL'" inputId="local-model-endpoint"
            :value="localModelEndpoint" @update:value="update('localModelEndpoint', $event)" />
        <!-- API key -->
        <InputField v-show="showLocalConfig" :isSecret="true" label="Key:" :labelText="'API Key'"
            :placeholderText="'Enter the API key if applicable'" inputId="local-model-key" :value="localModelKey"
            @update:value="update('localModelKey', $event)" />
        <!-- Temp -->
        <InputField v-show="showLocalConfig || showBrowserModelConfig"
            :labelText="'Temperature (0.0-2.0) Default: (0.6)'" :isSecret="false"
            :placeholderText="'Enter the temperature value for the model.'" label="localSliderValue"
            inputId="localSliderValue" :value="localSliderValue" @update:value="update('localSliderValue', $event)" />
        <!-- Top_P -->
        <InputField v-show="showLocalConfig || showBrowserModelConfig"
            :labelText="'Top_P Value (0.0-1.0) Default: (1.0)'" :isSecret="false"
            :placeholderText="'Enter the top_P value if applicable'" label="Top_P:" inputId="top_P" :value="top_P"
            @update:value="update('top_P', $event)" />
        <!-- Repetition Penalty -->
        <InputField v-show="showLocalConfig || showBrowserModelConfig"
            :labelText="'Repetition Penalty  (0.0-2.0) Default: (1.0)'" :isSecret="false"
            :placeholderText="'Enter the repetition penalty value if applicable'" label="repetitionPenalty:"
            inputId="repetitionPenalty" :value="repetitionPenalty"
            @update:value="update('repetitionPenalty', $event)" />
        <!-- Max Tokens -->
        <InputField v-show="showLocalConfig" :labelText="'Max Tokens (Default: -1 disabled)'" :isSecret="false"
            :placeholderText="'Enter the max token limit if applicable'" label="Max Tokens:" inputId="max-tokens"
            :value="maxTokens" @update:value="update('maxTokens', $event)" />
        <!-- GPT Key -->
        <InputField v-show="showGPTConfig" :labelText="'API Key'" :isSecret="true" label="Key:"
            :placeholderText="'Enter the API Key'" inputId="api-key" :value="gptKey"
            @update:value="update('gptKey', $event)" />
        <!-- Slider Value -->
        <div class="slider-container" v-show="showGPTConfig">
            <span>Serious</span>
            <input type="range" min="0" max="100" :value="sliderValue"
                @blur="update('sliderValue', $event.target.value)">
            <span>Creative</span>
        </div>
        <div class="config-section" v-show="showClaudeConfig">
            <h3>Claude Config</h3>
        </div>
        <!-- Claude Key -->
        <InputField v-show="showClaudeConfig" :labelText="'API Key'" :isSecret="true" label="Key:"
            :placeholderText="'Enter the API Key'" inputId="claude-api-key" :value="claudeKey"
            @update:value="update('claudeKey', $event)" />
        <!-- Claude Slider Value -->
        <div class="slider-container" v-show="showClaudeConfig">
            <span>Serious</span>
            <input type="range" min="0" max="100" :value="claudeSliderValue"
                @blur="update('claudeSliderValue', $event.target.value)">
            <span>Creative</span>
        </div>
        <div class="config-section" v-show="showGPTConfig">
            <h3>DALL-E Config</h3>
        </div>
        <!-- DALL-E Image Count -->
        <div class="control select-dropdown" v-show="showGPTConfig">
            <span>DALL-E Image Count: </span>
            <select id="dalle-image-count" :value="selectedDallEImageCount"
                @change="update('selectedDallEImageCount', $event.target.value)">
                <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
            </select>
        </div>
        <!-- DALL-E Image Resolution -->
        <div class="control select-dropdown" v-show="showGPTConfig">
            <span>Image Resolution: </span>
            <select id="dalle-image-resolution" :value="selectedDallEImageResolution"
                @change="update('selectedDallEImageResolution', $event.target.value)">
                <option value="256x256">256x256</option>
                <option value="512x512">512x512</option>
                <option value="1024x1024">1024x1024</option>
            </select>
        </div>
    </div>
    <div class="bottom-panel">
        <button class="close-btn" @click="toggleSidebar">Close</button>
    </div>
</template>

<style lang="scss">
$shadow-color: #252629;
$shadow-offset-x: 0px;
$shadow-offset-y: 1px;
$shadow-blur-radius: 2px;
$shadow-spread-radius: 0px;
$icon-color: rgb(187, 187, 187);



.sidebar-content-container {
    overflow: auto;
    text-overflow: clip;
    overflow: hidden;
    padding: 6px;
    z-index: 10000;
    background-color: #000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

}

.select-dropdown {
    select {
        appearance: none;
        background-color: #333;
        color: #fff;
        margin-top: 6px;
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

.close-btn {
    align-self: flex-end; // Align the button to the right
    padding: 5px 10px;
    border: 1px solid #444;
    background-color: #3d3c3e;
    color: white;
    cursor: pointer;
    width: 98%;
    font-size: 18px;
    height: 50px;
    outline: none;
    margin-bottom: 10px; // Add some margin at the bottom
    transition: background-color 0.2s ease, transform 0.2s ease;

    &:hover {
        background-color: #3e3e3f;
        transform: scale(1.03);
    }
}

.bottom-panel {
    display: flex;
    justify-content: center;
}

.config-section {
    background-color: #1c302e;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    position: relative;
    border-bottom: 1px solid rgb(57, 56, 56);
    padding-bottom: 8px;
    padding-top: 8px;
}

.settings-header {
    font-size: 19px;
    font-weight: bold;
    text-align: center;
    margin-top: -7px;
    position: relative;
    border-bottom: 5px solid #3f4151;
    padding-bottom: 25px;
    padding-top: 25px;
    background-color: #212121;
}

.close-btn {
    align-self: flex-end; // Align the button to the right
    padding: 5px 10px;
    border: 1px solid #444;

    color: white;
    cursor: pointer;
    width: 98%;
    font-size: 18px;
    height: 50px;
    outline: none;
    margin-bottom: 10px; // Add some margin at the bottom
    transition: background-color 0.2s ease;
    background-color: #29293a;

    &:hover {
        background-color: #252534;
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
    margin-bottom: 10px;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 2px solid #3f4151;

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
    margin-bottom: 15px;
    padding-bottom: 15px;
    margin-top: 3px;
}

.api-key {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-bottom: 10px;
    flex-wrap: nowrap;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 2px solid #3f4151;

    input {
        width: 70%;
        padding: 5px;
        border: 1px solid #444;
        border-radius: 5px;
        background-color: #1c1c1e;
        color: #f0f0f0;
        outline: none;
        margin-top: 5px;
    }
}

.settings-section {
    border-bottom: 1px solid #3f4151;
    padding: 1rem 0;
}

.settings-section h3 {
    margin-bottom: 0.5rem;
}
</style>