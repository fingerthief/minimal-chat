<!-- src/components/configuration-sections/GptConfigSection.vue -->
<script setup>
import { ref } from 'vue';
import InputField from '@/components/controls/InputField.vue';
import ToolTip from '@/components/controls/ToolTip.vue';
import SliderCheckbox from '@/components/controls/SliderCheckbox.vue';
import { ttsVoice, gptKey, sliderValue, pushToTalkMode, useWhisper, audioSpeed, ttsModel, whisperTemperature, selectedDallEImageCount, selectedDallEImageResolution } from '@/libs/state-management/state';
import { handleUpdate, updateGptSliderValue, updateWhisperSlider, showGPTConfig, } from '@/libs/utils/settings-utils';

const isDALLEConfigOpen = ref(false);
const isWhisperConfigSectionOpen = ref(true);

const ttsModelOptions = [
    { label: 'tts-1', value: 'tts-1' },
    { label: 'tts-1-hd', value: 'tts-1-hd' }
];

const ttsVoiceOptions = [
    { label: 'Alloy', value: 'alloy' },
    { label: 'Echo', value: 'echo' },
    { label: 'Fable', value: 'fable' },
    { label: 'Onyx', value: 'onyx' },
    { label: 'Nova', value: 'nova' },
    { label: 'Shimmer', value: 'shimmer' }
];

const dalleImageCountOptions = Array.from({ length: 3 }, (_, i) => ({ label: i + 1, value: i + 1 }));
const dalleImageResolutionOptions = [
    { label: '256x256', value: '256x256' },
    { label: '512x512', value: '512x512' },
    { label: '1024x1024', value: '1024x1024' }
];
</script>

<template>
    <div>
        <div class="control-grid">
            <InputField :labelText="'API Key'" :isSecret="true" :placeholderText="'Enter the API Key'" inputId="api-key"
                :value="gptKey" @update:value="handleUpdate('gptKey', $event)" />
        </div>
        <br>
        <div class="flex-container">
            <div class="center-text">Temperature: ({{ sliderValue }})</div>
            <div class="slider-container">
                <span>Serious</span>
                <input type="range" min="0" max="1" step="0.01" :value="sliderValue"
                    @input="updateGptSliderValue($event.target.value)" />
                <span>Creative</span>
            </div>
        </div>
        <br>
        <br>
        <div class="config-section" :class="{ show: isWhisperConfigSectionOpen }" v-show="showGPTConfig">
            <h3 @click="isWhisperConfigSectionOpen = !isWhisperConfigSectionOpen">
                Interact Mode
                <span class="indicator">{{ isWhisperConfigSectionOpen ? '-' : '+' }}</span>
            </h3>
            <div v-show="isWhisperConfigSectionOpen" class="control-grid">
                <SliderCheckbox inputId="push-to-talk" labelText="Push to Talk Mode" v-model="pushToTalkMode"
                    @update:modelValue="handleUpdate('use-push-to-talk', $event)" />
                <SliderCheckbox inputId="use-whisper" labelText="Whisper Transcriptions" v-model="useWhisper"
                    @update:modelValue="handleUpdate('use-whisper', $event)" />
                <div class="control select-dropdown">
                    <label for="tts-model">TTS Model:</label>&nbsp;
                    <Dropdown checkmark id="tts-model" :options="ttsModelOptions" v-model="ttsModel" optionLabel="label"
                        optionValue="value" @change="handleUpdate('tts-model', $event.value)"></Dropdown>
                </div>
                <div class="control select-dropdown">
                    <label for="tts-voice">TTS Voice:</label>&nbsp;
                    <Dropdown checkmark id="tts-voice" :options="ttsVoiceOptions" v-model="ttsVoice" optionLabel="label"
                        optionValue="value" @change="handleUpdate('tts-voice', $event.value)"></Dropdown>
                </div>
                <InputField :isSecret="false" labelText="Audio Speed:"
                    :placeholderText="'Example: Default is 1.0 and 1.05 would be 5% faster playback.'"
                    inputId="audio-speed" :value="audioSpeed" @update:value="handleUpdate('audio-speed', $event)" />
                <ToolTip :targetId="'audio-speed'">Default is 1.0 and 1.05 would be 5% faster playback.</ToolTip>
                <div class="flex-container">
                    <div class="center-text">Temperature: ({{ whisperTemperature }})</div><br>
                    <div class="slider-container">
                        <span>Serious</span>
                        <input type="range" min="0" max="1" step="0.01" :value="whisperTemperature"
                            @input="updateWhisperSlider($event.target.value)" />
                        <span>Creative</span>
                    </div>
                </div>
            </div>
        </div>
        <br>
        <div class="config-section" :class="{ show: isDALLEConfigOpen }"
            v-show="showGPTConfig && !showingGeneralConfig">
            <h3 @click="isDALLEConfigOpen = !isDALLEConfigOpen">
                DALL-E
                <span class="indicator">{{ isDALLEConfigOpen ? '-' : '+' }}</span>
            </h3>
            <div v-show="isDALLEConfigOpen" class="control-grid">
                <div class="control select-dropdown">
                    <label for="dalle-image-count">DALL-E Image Count:</label>&nbsp;
                    <Dropdown checkmark id="dalle-image-count" :options="dalleImageCountOptions"
                        v-model="selectedDallEImageCount" optionLabel="label" optionValue="value"
                        @change="handleUpdate('selectedDallEImageCount', $event.value)"></Dropdown>
                </div>
                <div class="control select-dropdown">
                    <label for="dalle-image-resolution">Image Resolution:</label>&nbsp;
                    <Dropdown checkmark id="dalle-image-resolution" :options="dalleImageResolutionOptions"
                        v-model="selectedDallEImageResolution" optionLabel="label" optionValue="value"
                        @change="handleUpdate('selectedDallEImageResolution', $event.value)"></Dropdown>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
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

    .config-info {
        font-size: 12px;
    }

    .control-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        transition: max-height 0.3s ease-in-out;
        overflow: hidden;
        max-height: 0;

        @media (max-width: 600px) {
            grid-template-columns: repeat(1, 1fr);
        }
    }

    &.show .control-grid {
        max-height: fit-content;
    }
}

.control-checkbox {
    display: flex;
    align-items: center;
    width: fit-content;

    label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 16px;
        color: #fff;
        position: relative;
        width: 100%;
        user-select: none;

        input[type="checkbox"] {
            opacity: 0;
            width: 0;
            height: 0;

            &:checked+.slider:before {
                transform: translateX(26px);
            }

            &:checked+.slider {
                background-color: #1a5951;
            }
        }

        .slider {
            width: 40px;
            height: 20px;
            background-color: #494747;
            border-radius: 34px;
            transition: background-color 0.3s;
            position: relative;
            margin-left: 10px;

            &:before {
                position: absolute;
                content: "";
                height: 12px;
                width: 12px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                border-radius: 50%;
                transition: transform 0.3s;
            }
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
