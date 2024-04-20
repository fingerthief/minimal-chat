<!-- eslint-disable no-unused-vars -->
<script setup>
import { RefreshCcw } from 'lucide-vue-next';

const props = defineProps({
    isSidebarOpen: Boolean,
    selectedModel: String,
    localModelName: String,
    localModelEndpoint: String,
    localSliderValue: Number,
    gptKey: String,
    sliderValue: Number,
    claudeKey: String,
    claudeSliderValue: Number,
    selectedDallEImageCount: Number,
    selectedDallEImageResolution: String,
    selectedAutoSaveOption: String
});

const emit = defineEmits([
    'update:model',
    'update:localModelName',
    'update:localModelEndpoint',
    'update:localSliderValue',
    'update:gptKey',
    'update:sliderValue',
    'update:claudeKey',
    'update:claudeSliderValue',
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
        <h2 @click="reloadPage">
            <span>
                <RefreshCcw :size="23" :stroke-width="2" />
            </span>
            Settings | V5.0.0
        </h2>
    </div>
    <div class="sidebar-content-container">
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
                <option value="lmstudio">Local Model (LM Studio) </option>
            </select>
        </div>
        <!-- Local Model Name -->
        <div class="api-key">
            <label for="model-name">Local Model Name:</label>
            <input id="model-name" :value="localModelName" @blur="update('localModelName', $event.target.value)">
        </div>
        <!-- Local Model Endpoint -->
        <div class="api-key">
            <label for="local-model-endpoint">Local URL:</label>
            <input id="local-model-endpoint" :value="localModelEndpoint"
                @blur="update('localModelEndpoint', $event.target.value)">
        </div>
        <!-- Local Slider Value -->
        <div class="slider-container">
            <span>Serious</span>
            <input type="range" min="0" max="100" :value="localSliderValue"
                @blur="update('localSliderValue', $event.target.value)">
            <span>Creative</span>
        </div>
        <!-- GPT Key -->
        <div class="api-key">
            <label for="api-key">GPT Key:</label>
            <input id="api-key" :value="gptKey" @blur="update('gptKey', $event.target.value)">
        </div>
        <!-- Slider Value -->
        <div class="slider-container">
            <span>Serious</span>
            <input type="range" min="0" max="200" :value="sliderValue"
                @blur="update('sliderValue', $event.target.value)">
            <span>Creative</span>
        </div>
        <!-- Claude Key -->
        <div class="api-key">
            <label for="claude-api-key">Claude Key:</label>
            <input id="claude-api-key" :value="claudeKey" @blur="update('claudeKey', $event.target.value)">
        </div>
        <!-- Claude Slider Value -->
        <div class="slider-container">
            <span>Serious</span>
            <input type="range" min="0" max="100" :value="claudeSliderValue"
                @blur="update('claudeSliderValue', $event.target.value)">
            <span>Creative</span>
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
        <!-- Auto Save Conversations -->
        <div class="control select-dropdown">
            <span>Auto Save Conversations: </span>
            <select id="auto-save-conversations" :value="selectedAutoSaveOption"
                @change="update('selectedAutoSaveOption', $event.target.value)">
                <option value="true">Yes</option>
                <option value="false">No</option>
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
    overflow: auto;
    text-overflow: clip;
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

.close-btn {
    align-self: flex-end; // Align the button to the right
    padding: 5px 10px;
    border: 1px solid #444;
    border-radius: 12px;
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

.settings-header {
    font-size: 19px;
    font-weight: bold;
    text-align: center;
    margin-top: -7px;
    position: relative;
    border-bottom: 5px solid gray;
    padding-bottom: 25px;
    padding-top: 25px;
}

.close-btn {
    align-self: flex-end; // Align the button to the right
    padding: 5px 10px;
    border: 1px solid #444;
    border-radius: 12px;
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