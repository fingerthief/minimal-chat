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

} from '@/libs/utils/settings-utils';
import "swiped-events";
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import Sidebar from 'primevue/sidebar';
import { Settings } from 'lucide-vue-next';
// Visibility states for collapsible config sections
const isClaudeConfigOpen = ref(false);
const isGPTConfigOpen = ref(false);

const models = [
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
  { label: 'GPT-4 Omni', value: 'gpt-4o' },
  { label: 'Custom API', value: 'open-ai-format' },
  { label: 'WebGPU Model', value: 'web-llm' }
];

const isSidebarVisibleOnSmallScreen = computed(() => {
  return (isSidebarVisible.value && isSmallScreen.value) === true;
});

// Watch for changes in the sidebar's visibility
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

function selectModel(model) {
  selectedModel.value = model;

  // Close all collapsible groups
  showingGeneralConfig.value = false;
  isClaudeConfigOpen.value = false;
  isGPTConfigOpen.value = false;

  if (model === 'open-ai-format') {
    fetchAvailableModels();
  }

  isSidebarVisible.value = false;
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

    // Double-tap detected
    isSidebarVisible.value = true;
  }
  lastTap.value = currentTime;
}

const showingGeneralConfig = ref(false);
function showGeneralConfigSection() {
  showingGeneralConfig.value = true;
  isSidebarVisible.value = false;
}

// Lifecycle hooks
onMounted(() => {
  if (selectedModel.value === 'open-ai-format') {
    fetchAvailableModels();
  }

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

      if (matchingConfigIndex !== -1) {
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
    <DialogHeader title="Configuration" :icon="Settings" :iconSize="32"
      tooltipText="Current Version: 6.2.3 Starlight Symphony" headerId="settings-header"
      @close="() => isSidebarOpen = false" />
    <div class="settings-container">
      <Sidebar v-model:visible="isSidebarVisible" :baseZIndex="3" @hide="isSidebarVisible = false">
        <h3>Select Model</h3>
        <ul>
          <li :class="{ selected: showingGeneralConfig }" @click="showGeneralConfigSection">
            General Config
          </li>
          <li :class="{ selected: selectedModel.includes('gpt') }">
            <h4 @click="isGPTConfigOpen = !isGPTConfigOpen">
              GPT Models
              <span :class="{ 'pi pi-chevron-down': isGPTConfigOpen, 'pi pi-chevron-right': !isGPTConfigOpen }"></span>
            </h4>
            <ul v-show="isGPTConfigOpen">
              <li v-for="model in models.filter(m => m.value.includes('gpt'))" :key="model.value"
                :class="{ selected: model.value === selectedModel }" @click="selectModel(model.value)">
                {{ model.label }}
              </li>
            </ul>
          </li>
          <li v-for="model in models.filter(m => !m.value.includes('gpt') && !m.value.includes('claude'))"
            :key="model.value" :class="{ selected: model.value === selectedModel }" @click="selectModel(model.value)">
            {{ model.label }}
          </li>
        </ul>
      </Sidebar>

      <div v-show="!isSmallScreen" class="left-panel">
        <h3>Models</h3>
        <ul>
          <li :class="{ selected: showingGeneralConfig }" @click="showGeneralConfigSection">
            General Config
          </li>
          <!-- Collapsible Group for GPT Models -->
          <li @click="isGPTConfigOpen = !isGPTConfigOpen">
            GPT Models
            <span class="indicator">{{ isGPTConfigOpen || selectedModel.includes('gpt') ? '-' : '+' }}</span>
          </li>
          <ul v-show="isGPTConfigOpen || selectedModel.includes('gpt')" class="sub-item">
            <li v-for="model in models.filter(m => m.value.includes('gpt'))" :key="model.value"
              :class="{ selected: model.value === selectedModel }" @click="selectModel(model.value)">
              {{ model.label }}
            </li>
          </ul>
          <!-- Other Models -->
          <li v-for="model in models.filter(m => !m.value.includes('gpt') && !m.value.includes('claude'))"
            :key="model.value" :class="{ selected: model.value === selectedModel }" @click="selectModel(model.value)">
            {{ model.label }}
          </li>
        </ul>
        <div class="close-btn-wrapper">
        </div>
      </div>
      <div v-show="!isSidebarVisible && isSmallScreen" class="left-panel-collapsed" @click.stop="toggleSidebar">
        <span>Open Model Selection</span>
      </div>
      <div class="right-panel" @touchstart="handleTouchStart">
        <div v-if="selectedModel">
          <div v-if="showingGeneralConfig">
            <GeneralConfigSection />
            <ImportExportConfigSection />
          </div>
          <div v-if="selectedModel.includes('gpt') && !showingGeneralConfig">
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

.p-sidebar {
  background-color: #292929;
  /* Light gray background */
  width: 250px;
  /* Set a fixed width */
  padding: 20px;
  /* Add some padding */
}

.p-sidebar h3 {
  margin-top: 0;
  font-size: 1.5em;
}

.p-sidebar ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.p-sidebar li {
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.p-sidebar li:hover {
  background-color: #07563d;
}

.p-sidebar li.selected {
  background-color: rgba(16, 56, 51, 0.91);
  color: white;
}

.p-sidebar li.selected:hover {
  background-color: #074d36;
}

@keyframes slideIn {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
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
  transition: background-color 0.3s;

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
    transition: background 0.3s ease;

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
    transition: color 0.3s ease;

    &:hover {
      color: #ff6b6b;
    }
  }

  .reload-icon {
    cursor: pointer;
    transition: transform 0.3s ease;

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
  height: 60vh;
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
      transition: background-color 0.3s;

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

.left-panel-collapsed {
  width: 20px;
  background-color: rgba(22, 74, 67, 0.91);
  cursor: pointer;
  height: 18vh;
  position: absolute;
  left: 0;
  top: 75%;
  border-right: 5px solid rgba(66, 64, 69, 0.7098039216);
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  animation: slideIn 0.15s ease-in-out forwards;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.7);
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;

  &:hover {
    background-color: lighten(rgba(22, 74, 67, 0.91), 5%);
  }
}

.left-panel-collapsed span {
  width: 100%;
  text-align: center;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: rgb(224, 224, 224);
}

.right-panel {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: none;
  background-color: #1d1e1e;
  max-height: 59vh;
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
</style>
