<!-- eslint-disable no-unused-vars -->
<script setup>
import { RefreshCcw } from 'lucide-vue-next';
import InputField from './InputField.vue';

const props = defineProps({
    isSidebarOpen: Boolean,
    selectedModel: String,
    localModelName: String,
    localModelEndpoint: String,
    localModelKey: String,
    huggingFaceEndpoint: String,
    localSliderValue: Number,
    gptKey: String,
    hfKey: String,
    sliderValue: Number,
    claudeKey: String,
    claudeSliderValue: Number,
    hfSliderValue: Number,
    selectedDallEImageCount: Number,
    selectedDallEImageResolution: String,
    selectedAutoSaveOption: String,
    maxTokens: Number
});

const emit = defineEmits([
    'update:maxTokens',
    'update:model',
    'update:localModelName',
    'update:localModelKey',
    'update:localModelEndpoint',
    'update:localSliderValue',
    'update:huggingFaceEndpoint',
    'update:gptKey',
    'update:hfKey',
    'update:sliderValue',
    'update:claudeKey',
    'update:claudeSliderValue',
    'update:hfSliderValue',
    'update:selectedDallEImageCount',
    'update:selectedDallEImageResolution',
    'update:selectedAutoSaveOption',
    'toggle-sidebar'
]);

const update = (field, value) => {
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
            Settings | V5.0.5
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
                <option value="tgi">Hugging Face</option>
                <option value="open-ai-format">Open AI Format Model </option>
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
        <div class="config-section">
            <h3>OpenAI Format Model Config</h3>
        </div>
        <!-- Model Name -->
        <InputField label="Model:" inputId="model-name" :value="localModelName"
            @update:value="update('localModelName', $event)" />
        <!-- Model Endpoint -->
        <InputField label="API Endpoint:" inputId="local-model-endpoint" :value="localModelEndpoint"
            @update:value="update('localModelEndpoint', $event)" />
        <!-- API key -->
        <InputField label="API Key:" inputId="local-model-key" :value="localModelKey"
            @update:value="update('localModelKey', $event)" />

        <!-- Slider Value -->
        <div class="slider-container">
            <span>Serious</span>
            <input type="range" min="0" max="100" :value="localSliderValue"
                @blur="update('localSliderValue', $event.target.value)">
            <span>Creative</span>
        </div>
        <div class="config-section">
            <h3>GPT Config</h3>
        </div>
        <!-- GPT Key -->
        <InputField label="Key:" inputId="api-key" :value="gptKey" @update:value="update('gptKey', $event)" />
        <!-- Slider Value -->
        <div class="slider-container">
            <span>Serious</span>
            <input type="range" min="0" max="100" :value="sliderValue"
                @blur="update('sliderValue', $event.target.value)">
            <span>Creative</span>
        </div>
        <div class="config-section">
            <h3>Claude Config</h3>
        </div>
        <!-- Claude Key -->
        <InputField label="Key:" inputId="claude-api-key" :value="claudeKey"
            @update:value="update('claudeKey', $event)" />
        <!-- Claude Slider Value -->
        <div class="slider-container">
            <span>Serious</span>
            <input type="range" min="0" max="100" :value="claudeSliderValue"
                @blur="update('claudeSliderValue', $event.target.value)">
            <span>Creative</span>
        </div>
        <div class="config-section">
            <h3>Hugging Face Config</h3>
        </div>
        <!-- Hugging Face Endpoint -->
        <InputField label="API Endpoint:" inputId="hugging-face-endpoint" :value="huggingFaceEndpoint"
            @update:value="update('huggingFaceEndpoint', $event)" />
        <!-- Hugging Face Key -->
        <InputField label="Key:" inputId="hf-api-key" :value="hfKey" @update:value="update('hfKey', $event)" />
        <!-- Hugging Face max tokens param -->
        <InputField label="Max Tokens:" inputId="max-tokens" :value="maxTokens"
            @update:value="update('maxTokens', $event)" />
        <!-- Hugging Face Slider Value -->
        <div class="slider-container">
            <span>Serious</span>
            <input type="range" min="0" max="100" :value="hfSliderValue"
                @blur="update('hfSliderValue', $event.target.value)">
            <span>Creative</span>
        </div>
        <div class="config-section">
            <h3>DALL-E Config</h3>
        </div>
        <!-- DALL-E Image Count -->
        <div class="control select-dropdown">
            <span>DALL-E Image Count: </span>
            <select id="dalle-image-count" :value="selectedDallEImageCount"
                @change="update('selectedDallEImageCount', $event.target.value)">
                <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
            </select>
        </div>
        <!-- DALL-E Image Resolution -->
        <div class="control select-dropdown">
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

<style lang="scss" scoped>
$shadow-color: #252629;
$shadow-offset-x: 0px;
$shadow-offset-y: 1px;
$shadow-blur-radius: 2px;
$shadow-spread-radius: 0px;
$icon-color: rgb(187, 187, 187);

.sidebar-content-container {
    height: 84vh;
    overflow: auto;
    text-overflow: clip;
    padding: 6px;
    z-index: 10000;
    background-color: #272732ba;

    /* Media query for screens that are 600px wide or less */
    @media (max-width: 600px) {
        height: 81vh;
    }
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
    background-color: #3e3e4e;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    position: relative;
    border-bottom: 1px solid rgb(57, 56, 56);
    padding-bottom: 10px;
    padding-top: 10px;
}

.settings-header {
    font-size: 19px;
    font-weight: bold;
    text-align: center;
    margin-top: -7px;
    position: relative;
    border-bottom: 5px solid gray;
    padding-bottom: 25px;
    padding-top: 25px;
    background-color: #252534;
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
    border-bottom: 2px solid gray;

    input[type="range"] {
        -webkit-appearance: none;
        flex-grow: 1;
        height: 15px;
        border-radius: 5px;
        background: #828282;
        outline: none;
        margin-left: 10px;

        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: #5b525c;
            cursor: pointer;
        }

        &::-moz-range-thumb {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: #5b525c;
            cursor: pointer;
        }
    }
}

.control {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 2px solid gray;
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
    border-bottom: 2px solid gray;

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
    border-bottom: 1px solid #e0e0e0;
    padding: 1rem 0;
}

.settings-section h3 {
    margin-bottom: 0.5rem;
}
</style>