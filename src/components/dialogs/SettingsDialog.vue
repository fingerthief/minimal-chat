<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import DialogHeader from '@/components/controls/DialogHeader.vue';
import GeneralConfigSection from '@/components/configuration-sections/GeneralConfigSection.vue';
import GptConfigSection from '@/components/configuration-sections/GptConfigSection.vue';
import ClaudeConfigSection from '@/components/configuration-sections/ClaudeConfigSection.vue';
import LocalConfigSection from '@/components/configuration-sections/LocalConfigSection.vue';
import WebLlmConfigSection from '@/components/configuration-sections/WebLlmConfigSection.vue';
import ImportExportConfigSection from '@/components/configuration-sections/ImportExportConfigSection.vue';
import { getOpenAICompatibleAvailableModels } from '@/libs/api-access/open-ai-api-standard-access';
import {
    selectedModel,
    localModelEndpoint,
    localModelKey,
    maxTokens,
    localSliderValue,
    top_P,
    repetitionPenalty,
    isSidebarOpen,
    isSmallScreen,
    isSidebarVisible,
    systemPrompt,
    availableModels,

} from '@/libs/state-management/state';
import { removeAPIEndpoints } from '@/libs/utils/general-utils';
import { runTutorialForSettings } from '@/libs/utils/tutorial-utils';
import {
    selectCustomConfig,
    systemPrompts,
    selectedSystemPromptIndex,
    customConfigs,
    selectedCustomConfigIndex,
    handleSelectCustomConfig,
    handleDeleteCustomConfig

} from '@/libs/utils/settings-utils';
import "swiped-events";
import { ChevronDown, ChevronRight, Settings, Trash2 } from 'lucide-vue-next';

// Visibility states for collapsible config sections
const isClaudeConfigOpen = ref(false);
const isGPTConfigOpen = ref(false);
const isCustomConfigOpen = ref(false);
const selectedCustomConfig = ref(null);

const models = [
    { label: 'Custom API', value: 'open-ai-format' },
    { label: 'WebGPU Model', value: 'web-llm' }
];

watch(isSidebarOpen, (newVal) => {
    if (newVal) {
        runTutorialForSettings();
    }
});

async function fetchAvailableModels() {
    try {
        if (localModelEndpoint.value.trim() !== '') {
            const models = await getOpenAICompatibleAvailableModels(removeAPIEndpoints(localModelEndpoint.value));
            availableModels.value = models;
        }
    } catch (error) {
        console.error('Error fetching available models:', error);
    }
}

function toggleSidebar() {
    isSidebarVisible.value = !isSidebarVisible.value;
}

function swipedRight(e) {
    event.stopPropagation();
    if (!e.detail.xStart || e.detail.xStart >= 100) {
        console.log('Swipe did not start at the edge of the left side of the screen');
        isSidebarOpen.value = true;
        return;
    }

    isSidebarOpen.value = false;
}

const lastTap = ref(0);
function handleTouchStart(event) {


    if (!isSmallScreen.value) {
        return;
    }

    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap.value;

    console.log(tapLength);
    if (tapLength < 300 && tapLength > 0) {
        event.preventDefault();

        isSidebarVisible.value = true;
    }
    lastTap.value = currentTime;
}

const showingGeneralConfig = ref(false);
function showGeneralConfigSection() {
    showingGeneralConfig.value = true;
    isSidebarVisible.value = false;
}

function selectCustomModel(index) {
    handleSelectCustomConfig(index);
    // selectedCustomConfig.value = configName;

    showingGeneralConfig.value = false;
    isClaudeConfigOpen.value = false;
    isGPTConfigOpen.value = false;
    isCustomConfigOpen.value = false;

    isSidebarVisible.value = false;

}

function selectModel(model) {
    selectedModel.value = model;
    selectedCustomConfig.value = null;
    isCustomConfigOpen.value = false;

    showingGeneralConfig.value = false;
    isClaudeConfigOpen.value = false;
    isGPTConfigOpen.value = false;
    isCustomConfigOpen.value = false;

    if (model === 'open-ai-format') {
        fetchAvailableModels();
    }

    isSidebarVisible.value = false;
}


// Lifecycle hooks
onMounted(() => {
    if (selectedModel.value === 'open-ai-format') {
        fetchAvailableModels();
    }

    console.log("Mounted");
    console.log("Models:", models); // Debug: Inspect the models array
    console.log("Selected Model:", selectedModel.value); // Debug: Inspect selectedModel

    const storedSystemPrompts = localStorage.getItem('system-prompts');
    if (storedSystemPrompts) {
        systemPrompts.value = JSON.parse(storedSystemPrompts);
        const savedPromptIndex = systemPrompts.value.findIndex((prompt) => prompt === systemPrompt.value);
        if (savedPromptIndex !== -1) {
            selectedSystemPromptIndex.value = savedPromptIndex;
        }
    }

    const storedCustomConfigs = localStorage.getItem('saved-custom-configs');
    if (storedCustomConfigs) {
        customConfigs.value = JSON.parse(storedCustomConfigs);

        if (customConfigs.value.length > 0) {
            const matchingConfigIndex = customConfigs.value.findIndex((config) => config.endpoint === localModelEndpoint.value);

            if (matchingConfigIndex !== -1 && selectedModel.value.includes("open-ai-format")) {
                selectedCustomConfigIndex.value = matchingConfigIndex;
                const config = customConfigs.value[matchingConfigIndex];
                localModelEndpoint.value = config.endpoint;
                localModelKey.value = config.apiKey;
                maxTokens.value = config.maxTokens;
                localSliderValue.value = config.temperature;
                top_P.value = config.top_P;
                repetitionPenalty.value = config.repetitionPenalty;

                selectCustomConfig(selectedCustomConfigIndex.value, localModelEndpoint, localModelKey, maxTokens, localSliderValue, top_P, repetitionPenalty);
            }
        } else {
            console.log('No saved custom configs found.');
        }
    } else {
        console.log('No saved custom configs found.');
    }
});
</script>

<template>
    <div class="settings-dialog" data-swipe-threshold="15" data-swipe-unit="vw" data-swipe-timeout="500"
        @swiped-right="swipedRight">
        <DialogHeader title="Configuration" :icon="Settings" :iconSize="32" tooltipText="Current Version: 6.2.7"
            headerId="settings-header" @close="() => isSidebarOpen = false" />
        <div class="settings-container">
            <Sidebar v-model:visible="isSidebarVisible" :baseZIndex="3" @hide="isSidebarVisible = false">
                <h3>Select Model</h3>
                <ul>
                    <li :class="{ selected: showingGeneralConfig }" @click="showGeneralConfigSection">
                        General Config
                    </li>>
                    <li>
                        <h4 @click="isCustomConfigOpen = !isCustomConfigOpen">
                            API Connections
                            <span class="indicator"
                                :class="{ 'pi pi-chevron-down': isCustomConfigOpen, 'pi pi-chevron-right': !isCustomConfigOpen }"></span>
                        </h4>
                        <ul v-show="isCustomConfigOpen">
                            <li v-for="(config, index) in customConfigs" :key="config.endpoint"
                                :class="{ selected: selectedModel === 'open-ai-format' && localModelEndpoint === config.endpoint }"
                                @click="selectCustomModel(index)">
                                <Trash2 :size="18" :stroke-width="1.5" @click.stop="handleDeleteCustomConfig(index)" />
                                &nbsp;&nbsp;
                                {{ config.endpoint }}
                            </li>
                        </ul>
                    </li>
                    <li :class="{ selected: selectedModel === 'web-llm' && !selectedCustomConfig }"
                        @click="selectModel('web-llm')">
                        Browser Model
                    </li>
                </ul>
            </Sidebar>

            <div v-show="!isSmallScreen" class="left-panel">
                <h3>Models</h3>
                <ul>
                    <li :class="{ selected: showingGeneralConfig }" @click="showGeneralConfigSection">
                        General Config
                    </li>
                    <li @click="isCustomConfigOpen = !isCustomConfigOpen">
                        <ChevronDown v-if="isCustomConfigOpen || selectedModel === 'open-ai-format'" :size="12" />
                        <ChevronRight v-else :size="12" />
                        API Connections
                    </li>
                    <transition name="slide-fade">
                        <ul v-show="isCustomConfigOpen || selectedModel === 'open-ai-format'" class="sub-item">
                            <li v-for="(config, index) in customConfigs" :key="config.endpoint"
                                :class="{ selected: selectedModel === 'open-ai-format' && selectedCustomConfigIndex === index }"
                                @click="selectCustomModel(index)">
                                <Trash2 :size="18" :stroke-width="1.5" @click.stop="handleDeleteCustomConfig(index)" />
                                &nbsp;&nbsp;
                                {{ config.endpoint }}
                            </li>
                            <li v-if="!customConfigs.length" :class="{ selected: selectedModel === 'open-ai-format' }"
                                @click="selectModel('open-ai-format')">
                                Add New Custom API
                            </li>
                        </ul>
                    </transition>
                    <li :class="{ selected: selectedModel === 'web-llm' && !selectedCustomConfig }"
                        @click="selectModel('web-llm')">
                        Browser Model
                    </li>
                </ul>
                <div class="close-btn-wrapper">
                </div>
            </div>
            <div class="right-panel" @touchstart="handleTouchStart">
                <div v-if="selectedModel">
                    <div v-if="showingGeneralConfig">
                        <GeneralConfigSection />
                        <ImportExportConfigSection />
                    </div>
                    <div v-if="selectedModel.includes('gpt') || selectedModel === 'o1' && !showingGeneralConfig">
                        <GptConfigSection />
                    </div>
                    <div v-if="selectedModel === 'open-ai-format' && !showingGeneralConfig">
                        <LocalConfigSection />
                    </div>
                    <div v-if="selectedModel === 'web-llm' && !showingGeneralConfig">
                        <WebLlmConfigSection />
                    </div>
                </div>
            </div>
        </div>
        <button v-if="isSmallScreen" class="floating-button" @click="toggleSidebar">☰</button>
    </div>
</template>


<style lang="scss" scoped>
$shadow-color: #252629;
$icon-color: rgb(187, 187, 187);
$primary-bg-color: #0c1928;
$secondary-bg-color: #0c1928;
$highlight-bg-color: #165951;
$button-bg-color: #1a5951;
$button-hover-bg-color: #165951;
$delete-color: #ff5555;
$delete-hover-color: #ff3333;
$input-bg-color: #333;
$input-hover-bg-color: #444;
$input-focus-bg-color: #222;
$header-bg-color: #0c1928;
$close-btn-bg-color: #1e1e1e;
$close-btn-hover-bg-color: #6f383889;
$close-btn-active-bg-color: #2c3e50;
$border-color: #1b6a72c4;
$header-border-color: #424045b5;
$bottom-panel-bg-color: #1d1e1e;
$bottom-panel-border-color: #5f4575cf;

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.15s ease-out;
    max-height: 30vh;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-20px);
}

.scale-enter-active,
.scale-leave-active {
    transition: transform 0.15s ease-out;
}

.p-sidebar {
    background-color: #292929;
    width: 250px;
    padding: 20px;
    animation: slideIn 0.15s ease;
    transition: all 0.15s;

    h3 {
        margin-top: 0;
        font-size: 1.5em;
    }

    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    li {
        padding: 10px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.15s ease;
    }

    li:hover {
        background-color: #07563d;
    }

    li.selected {
        background-color: rgba(16, 56, 51, 0.91);
        color: white;
    }

    li.selected:hover {
        background-color: #074d36;
    }
}

@keyframes slideIn {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(0);
    }
}

.center-text {
    text-align: center;
    padding-bottom: 6px;
}

.expand-sidebar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $button-bg-color;
    color: white;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    margin: 10px;
    transition: background-color 0.15s;

    &:hover {
        background-color: $button-hover-bg-color;
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
        transition: max-height 0.15s ease-in-out;
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
    width: 100%;

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
            transition: background-color 0.15s;
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
                transition: transform 0.15s;
            }
        }
    }
}

.select-dropdown select {
    appearance: none;
    background-color: $input-bg-color;
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
        background-color: $input-hover-bg-color;
    }

    &:focus {
        outline: none;
    }
}

.select-dropdown option {
    background-color: $input-focus-bg-color;
    color: #fff;
}

.control-grid .settings-list {
    display: flex;
    gap: 0.5rem;

    .settings-item-button {
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        margin: 6px 0;
        border-radius: 6px;
        cursor: pointer;
        background: $button-bg-color;
        flex-direction: column-reverse;
        transition: background 0.15s ease;

        &:hover {
            background: darken($highlight-bg-color, 5%);
        }
    }
}

.system-prompt-container,
.saved-custom-configs,
.saved-system-prompts {

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
            background-color: darken($highlight-bg-color, 8%);
            border-radius: 4px;
            margin-bottom: 8px;
            max-height: 6vh;
            overflow: hidden;
            text-align: left;
            cursor: pointer;

            &.selected {
                background-color: $button-bg-color;
            }

            .delete-system-prompt-btn,
            .delete-custom-config-btn {
                background-color: transparent;
                border: none;
                color: $delete-color;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;

                &:hover {
                    color: $delete-hover-color;
                }
            }
        }
    }
}

.save-system-prompt-btn,
.save-custom-config-btn {
    padding: 6px 12px;
    background-color: $button-bg-color;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;

    &:hover {
        background-color: $button-hover-bg-color;
    }
}

.settings-dialog {
    display: flex;
    flex-direction: column;
    max-height: 98vh;
    min-height: 98vh;
    max-width: 99vw;
    background-color: #1d1e1e;

    .close-btn {
        align-self: flex-end;
        padding: 10px;
        padding-bottom: 0px;
        border: none;
        border-bottom: 2px solid rgb(88 43 110 / 83%);
        color: white;
        cursor: pointer;
        width: 100%;
        height: 50px;
        background-color: #1d1e1ebf;
        font-size: 18px;
        outline: none;
        letter-spacing: 1px;

        &:hover {
            background-color: lighten(#202625c2, 2%);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        &:active {
            transform: translateY(1px);
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
}

.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    border-bottom: 5px solid rgba(66, 64, 69, 0.7098039216);
    margin-bottom: 20px;

    h2 {
        margin: 0;
    }

    .close-icon {
        background: none;
        border: none;
        color: #ffffff;
        font-size: 24px;
        cursor: pointer;
        transition: color 0.15s ease;

        &:hover {
            color: #ff6b6b;
        }
    }

    .reload-icon {
        cursor: pointer;
        transition: transform 0.15s ease;

        &:hover {
            transform: rotate(360deg);
        }
    }
}

.settings-container {
    display: flex;
    height: 98vh;
}

.left-panel {
    background-color: #1d1e1e;
    padding: 20px;
    border-right: 5px solid #424045b5;
    background-color: #1d1e1e;
    overflow-y: auto;
    scrollbar-width: none;
    min-width: 250px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 70vh;
    transition: width 0.15s ease;
    animation: slideIn 0.15s ease-out backwards;

    @media (max-width: 600px) {
        animation: slideIn 0.15s ease-out forwards backwards;
        max-width: 30vw;
        min-width: 30vw;
        background-color: #1d1e1e;
        padding: 20px;
        border-right: 3px solid #1a5951;
        overflow-x: auto;
        scrollbar-width: none;
        font-size: 12px;
        padding-left: 6px;
        padding-right: 6px;
        height: 92vh;
    }

    h3 {
        margin-bottom: 15px;
        font-size: 16px;
        font-weight: bold;
        color: #fff;
    }

    ul {
        list-style-type: none;
        padding: 0;

        li {
            padding: 10px;
            cursor: pointer;
            color: #fff;
            border-radius: 4px;
            margin-bottom: 8px;
            border-bottom: 1px solid #1a5951;
            transition: background-color 0.15s;

            &:hover,
            &.selected {
                background-color: #14423b;
            }
        }

        .sub-item {
            padding-left: 12px;

            @media (max-width: 600px) {
                padding-left: 6px;
            }

            li {
                background-color: darken($highlight-bg-color, 13%);
                border-bottom: 0;
                padding: 8px;
                padding-top: 5px;
                padding-bottom: 5px;

                @media (max-width: 600px) {
                    padding-top: 5px;
                    padding-bottom: 5px;
                }

                &:hover,
                &.selected {
                    background-color: darken($highlight-bg-color, 5%);
                }
            }
        }
    }

    .close-btn-wrapper {
        margin-top: auto;
    }

    .close-btn {
        align-self: flex-end;
        padding: 10px;
        border: none;
        border-bottom: 1px solid #725182b5;
        color: white;
        cursor: pointer;
        width: 100%;
        height: 50px;
        background-color: #1d1e1ebf;
        font-size: 18px;
        outline: none;
        letter-spacing: 1px;

        &:hover {
            background-color: lighten(#202625c2, 2%);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        &:active {
            transform: translateY(1px);
        }
    }
}

.right-panel {
    flex-grow: 1;
    padding: 20px;
    overflow-y: auto;
    scrollbar-width: none;
    background-color: #1d1e1e;
    max-height: 70vh;
    overflow-x: hidden;

    @media (max-width: 600px) {
        flex-grow: 1;
        padding: 20px;
        scrollbar-width: none;
        overflow-x: hidden;
        background-color: #1d1e1e;
        font-size: 14px;
        padding-left: 12px;
        padding-right: 12px;
        width: 90vw;
        min-height: 89vh;
    }

    h3 {
        margin-bottom: 15px;
        color: #fff;
    }

    .control-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }

    .slider-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        input[type='range'] {
            -webkit-appearance: none;
            flex-grow: 1;
            height: 15px;
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

.bottom-panel {
    background: transparent;
}

.floating-button {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background-color: #1a5950b5;
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: background-color 0.15s, transform 0.15s;

    &:hover {
        background-color: $button-hover-bg-color;
        transform: scale(1.1);
    }

    &:active {
        transform: scale(0.95);
    }
}
</style>
