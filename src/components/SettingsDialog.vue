<script setup>
import { ref, watch, onMounted } from 'vue';
import { RefreshCcw, Settings, Trash2, Download, Upload } from 'lucide-vue-next';
import InputField from './InputField.vue';
import { getOpenAICompatibleAvailableModels } from '@/libs/api-access/open-ai-api-standard-access';
import {
  selectedModel,
  selectedAutoSaveOption,
  systemPrompt,
  higherContrastMessages,
  localModelEndpoint,
  localModelName,
  localModelKey,
  maxTokens,
  localSliderValue,
  top_P,
  repetitionPenalty,
  isSidebarOpen,
  gptKey,
  claudeKey,
  browserModelSelection,
  sliderValue,
  selectedDallEImageCount,
  selectedDallEImageResolution,
  claudeSliderValue,
  isSmallScreen,
  isSidebarVisible
} from '@/libs/state-management/state';
import { removeAPIEndpoints, showToast } from '@/libs/utils/general-utils';
import {
  handleExportSettings, exportSettingsToFile, handleImportSettings, importSettings, customConfigs,
  selectedCustomConfigIndex,
  saveCustomConfig,
  deleteCustomConfig,
  selectCustomConfig,
  systemPrompts,
  selectedSystemPromptIndex,
  deleteSystemPrompt,
  selectSystemPrompt,
  update,
  showBrowserModelConfig,
  showClaudeConfig,
  showGPTConfig,
  showLocalConfig
} from '@/libs/utils/settings-utils';

// Visibility states for collapsible config sections
const isGeneralConfigOpen = ref(true);
const isBrowserModelConfigOpen = ref(true);
const isLocalConfigOpen = ref(true);
const isGPTConfigOpen = ref(false);
const isDALLEConfigOpen = ref(true);
const isClaudeConfigOpen = ref(false);
const isImportExportConfigOpen = ref(true);

const models = [
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
  { label: 'GPT-4 Omni', value: 'gpt-4o' },
  { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
  { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
  { label: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
  { label: 'Custom API Endpoint', value: 'open-ai-format' },
  { label: 'Local Browser Model', value: 'web-llm' }
];

const availableModels = ref([]);

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
  isGPTConfigOpen.value = false;
  isClaudeConfigOpen.value = false;
  isGeneralConfigOpen.value = false;
  isBrowserModelConfigOpen.value = false;
  isLocalConfigOpen.value = false;
  isImportExportConfigOpen.value = false;

  if (model === 'open-ai-format') {
    fetchAvailableModels();
  }
}

function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value;
}

function handleRightPanelClick() {
  if (isSmallScreen.value) {
    isSidebarVisible.value = false;
  }
}

function updateGptSliderValue(value) {
  handleUpdate('sliderValue', parseFloat(value));
}


function updateLocalSliderValue(value) {
  handleUpdate('localSliderValue', parseFloat(value));
}

function updateClaudeSliderValue(value) {
  handleUpdate('claudeSliderValue', parseFloat(value));
}

function updateTopPSliderValue(value) {
  handleUpdate('top_P', parseFloat(value));
}

function updateRepetitionSliderValue(value) {
  handleUpdate('repetitionPenalty', parseFloat(value));
}

// Watchers
watch(
  () => [localModelKey.value, selectedModel.value],
  () => {
    if (selectedModel.value === 'open-ai-format') {
      fetchAvailableModels();

      if (customConfigs.value.length === 0 && localModelEndpoint.value.trim() !== '') {
        saveCustomConfig();
      }
    }
  }
);

// System Prompts
function handleDeleteSystemPrompt(index) {
  deleteSystemPrompt(index, showToast);
}

function handleSelectSystemPrompt(index) {
  selectSystemPrompt(index, systemPrompt);
}

// Custom Configs
function handleDeleteCustomConfig(index) {
  deleteCustomConfig(index, showToast);
}

function handleSelectCustomConfig(index) {
  selectCustomConfig(index, localModelEndpoint, localModelKey, localModelName, maxTokens, localSliderValue, top_P, repetitionPenalty);
}

// Update function
function handleUpdate(field, value) {
  update(field, value);
}

// Utility functions
function reloadPage() {
  window.location.reload();
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
        localModelName.value = config.modelName;
        maxTokens.value = config.maxTokens;
        localSliderValue.value = config.temperature;
        top_P.value = config.top_P;
        repetitionPenalty.value = config.repetitionPenalty;

        handleSelectCustomConfig(selectedCustomConfigIndex.value);
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
  <div class="settings-dialog">
    <div class="settings-header">
      <h2>
        <span @click="reloadPage">
          <RefreshCcw :size="23" :stroke-width="2" />
        </span>
        Settings | V6.1.6
      </h2>
    </div>
    <div class="settings-container">
      <div v-show="!isSmallScreen || (isSidebarVisible && isSmallScreen)" class="left-panel">
        <h3>Models</h3>
        <ul>
          <li :class="{ selected: selectedModel === 'general-config' }" @click="selectModel('general-config')">
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
          <!-- Collapsible Group for Claude Models -->
          <li @click="isClaudeConfigOpen = !isClaudeConfigOpen">
            Claude Models
            <span class="indicator">{{ isClaudeConfigOpen || selectedModel.includes('claude') ? '-' : '+' }}</span>
          </li>
          <ul v-show="isClaudeConfigOpen || selectedModel.includes('claude')" class="sub-item">
            <li v-for="model in models.filter(m => m.value.includes('claude'))" :key="model.value"
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
          <button class="close-btn" @click="() => isSidebarOpen = false">
            <Settings :stroke-width="1.5" :size="20" />&nbsp;Close
          </button>
        </div>
      </div>
      <div v-show="!isSidebarVisible" class="left-panel-collapsed" @click.stop="toggleSidebar">
        <span>Model Selection</span>
      </div>
      <div class="right-panel" @click="handleRightPanelClick">
        <div v-if="selectedModel">
          <div v-if="selectedModel.includes('general')">
            <div class="system-prompt-container">
              <InputField labelText="System Prompt:" inputId="system-prompt" :value="systemPrompt"
                @update:value="handleUpdate('systemPrompt', $event)" :isSecret="false" :isMultiline="true"
                :placeholderText="'Enter the system prompt if applicable.'" />
            </div>
            <div v-if="systemPrompts.length" class="saved-system-prompts">
              <h4>Saved System Prompts:</h4>
              <ul>
                <li v-for="(prompt, index) in systemPrompts" :key="index"
                  :class="{ selected: index === selectedSystemPromptIndex }" @click="handleSelectSystemPrompt(index)">
                  <Trash2 :size="18" :stroke-width="1.5" @click.stop="handleDeleteSystemPrompt(index)" />
                  &nbsp;&nbsp;{{ prompt }}
                </li>
              </ul>
            </div>
            <br>
            <div class="control select-dropdown">
              <label for="auto-save-conversations">Auto Save Conversations:</label>
              <select id="auto-save-conversations" :value="selectedAutoSaveOption"
                @change="handleUpdate('selectedAutoSaveOption', $event.target.value)">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <br>
            <br>
            <div class="control-checkbox">
              <label for="higher-contrast-messages">
                Higher Contrast Messages:
                <input type="checkbox" id="higher-contrast-messages" :checked="higherContrastMessages"
                  @change="handleUpdate('higherContrastMessages', $event.target.checked)" />
                <span class="slider"></span>
              </label>
            </div>
            <br>
            <br>
            <div class="config-section" :class="{ show: isImportExportConfigOpen }">
              <h3 @click="isImportExportConfigOpen = !isImportExportConfigOpen">
                Import/Export Configuration
                <span class="indicator">{{ isImportExportConfigOpen ? '-' : '+' }}</span>
              </h3>
              <div v-show="isImportExportConfigOpen" class="control-grid">
                <h4>
                  Manage Settings
                  <p class="config-info">
                    Export your current settings to a JSON file for backup or to easily set up the application on
                    another
                    device. You can also import
                    settings from a JSON file.
                  </p>
                </h4>

                <div class="settings-list">
                  <div class="settings-item-button" @click="
                    handleExportSettings(
                      {
                        shouldShowScrollButton,
                        userText,
                        isLoading,
                        hasFilterText,
                        selectedModel,
                        isSidebarOpen,
                        showConversationOptions,
                        messages,
                        streamedMessageText,
                        modelDisplayName,
                        localModelKey,
                        localModelName,
                        localModelEndpoint,
                        localSliderValue,
                        gptKey,
                        sliderValue,
                        claudeKey,
                        claudeSliderValue,
                        selectedDallEImageCount,
                        selectedDallEImageResolution,
                        selectedAutoSaveOption,
                        browserModelSelection,
                        maxTokens,
                        top_P,
                        repetitionPenalty,
                        systemPrompt,
                        conversations,
                        storedConversations,
                        lastLoadedConversationId,
                        selectedConversation,
                        abortController,
                        imageInput,
                      },
                      exportSettingsToFile
                    )
                    ">
                    <span class="action-text">Export Settings</span>
                    <Download :stroke-width="1.5" />
                  </div>
                  <label class="settings-item-button">
                    <span class="action-text">Import Settings</span>
                    <Upload :stroke-width="1.5" />
                    <input type="file" accept=".json"
                      @change="(event) => handleImportSettings(event, (data) => importSettings(data, update))"
                      style="display: none" />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div v-if="selectedModel.includes('gpt')">
            <div>
              <div class="control-grid">
                <InputField :labelText="'API Key'" :isSecret="true" :placeholderText="'Enter the API Key'"
                  inputId="api-key" :value="gptKey" @update:value="handleUpdate('gptKey', $event)" />
              </div>
            </div>
            <br>
            <div class="flex-container">
              <InputField labelText="Temperature (0.0-2.0):" :isSecret="false"
                :placeholderText="'Enter the temperature value for the model.'" inputId="gptAttitude"
                :value="sliderValue" @update:value="handleUpdate('gpt-attitude', $event)" />
              <div class="slider-container">
                <span>Serious</span>
                <input type="range" min="0" max="2" step="0.01" :value="sliderValue"
                  @input="updateGptSliderValue($event.target.value)" />
                <span>Creative</span>
              </div>
            </div>
            <br>
            <br>
            <div class="config-section" :class="{ show: isDALLEConfigOpen }" v-show="showGPTConfig">
              <h3 @click="isDALLEConfigOpen = !isDALLEConfigOpen">
                DALL-E Config
                <span class="indicator">{{ isDALLEConfigOpen ? '-' : '+' }}</span>
              </h3>
              <div v-show="isDALLEConfigOpen" class="control-grid">
                <div class="control select-dropdown">
                  <label for="dalle-image-count">DALL-E Image Count:</label>
                  <select id="dalle-image-count" :value="selectedDallEImageCount"
                    @change="handleUpdate('selectedDallEImageCount', $event.target.value)">
                    <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                  </select>
                </div>
                <div class="control select-dropdown">
                  <label for="dalle-image-resolution">Image Resolution:</label>
                  <select id="dalle-image-resolution" :value="selectedDallEImageResolution"
                    @change="handleUpdate('selectedDallEImageResolution', $event.target.value)">
                    <option value="256x256">256x256</option>
                    <option value="512x512">512x512</option>
                    <option value="1024x1024">1024x1024</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div v-if="selectedModel === 'open-ai-format'">
            <div class="control-grid">
              <div v-if="customConfigs.length" class="saved-custom-configs">
                <h4>Saved Custom Configs</h4>
                <ul>
                  <li v-for="(config, index) in customConfigs" :key="index"
                    :class="{ selected: index === selectedCustomConfigIndex }" @click="handleSelectCustomConfig(index)">
                    <Trash2 :size="18" :stroke-width="1.5" @click.stop="handleDeleteCustomConfig(index)" />
                    <span>&nbsp;&nbsp;{{ config.endpoint }}</span>
                  </li>
                </ul>
              </div>
              <InputField :isSecret="false" labelText="API Endpoint:"
                :placeholderText="'Enter the base API Endpoint URL'" inputId="local-model-endpoint"
                :value="localModelEndpoint" @update:value="handleUpdate('localModelEndpoint', $event)" />
              <div class="control select-dropdown">
                <label for="custom-model-selector">Models Available:</label>
                <select id="custom-model-selector" :value="localModelName"
                  @change="handleUpdate('localModelName', $event.target.value)">
                  <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
                </select>
              </div>
              <InputField :isSecret="true" labelText="API Key:" :placeholderText="'Enter the API key if applicable'"
                inputId="local-model-key" :value="localModelKey"
                @update:value="handleUpdate('localModelKey', $event)" />
              <InputField labelText="Max Tokens:" :isSecret="false"
                :placeholderText="'Enter the max token limit if applicable'" inputId="max-tokens"
                :value="maxTokens.toString()" @update:value="handleUpdate('maxTokens', $event)" />
              <div class="flex-container">
                <InputField labelText="Temperature (0.0-2.0):" :isSecret="false"
                  :placeholderText="'Enter the temperature value for the model.'" inputId="localSliderValue"
                  :value="localSliderValue.toString()" @update:value="handleUpdate('localSliderValue', $event)" />
                <div class="slider-container">
                  <span>Serious</span>
                  <input type="range" min="0" max="2" step="0.01" :value="localSliderValue"
                    @input="updateLocalSliderValue($event.target.value)" />
                  <span>Creative</span>
                </div>
              </div>
              <div class="flex-container">
                <InputField labelText="Top_P Value (0.0-1.0):" :isSecret="false"
                  :placeholderText="'Enter the top_P value if applicable'" inputId="top_P" :value="top_P.toString()"
                  @update:value="handleUpdate('top_P', $event)" />
                <div class="slider-container">
                  <span>Lower</span>
                  <input type="range" min="0" max="1" step="0.01" :value="top_P"
                    @input="updateTopPSliderValue($event.target.value)" />
                  <span>Higher</span>
                </div>
              </div>
              <div class="flex-container">
                <InputField labelText="Repetition Penalty (0.0-2.0):" :isSecret="false"
                  :placeholderText="'Enter the repetition penalty value if applicable'" inputId="repetitionPenalty"
                  :value="repetitionPenalty.toString()" @update:value="handleUpdate('repetitionPenalty', $event)" />
                <div class="slider-container">
                  <span>Less</span>
                  <input type="range" min="0" max="2" step="0.01" :value="repetitionPenalty"
                    @input="updateRepetitionSliderValue($event.target.value)" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="selectedModel === 'web-llm'">
            <div class="control select-dropdown">
              <label for="localModelsSelection">Model To Load In Browser:</label>
              <select id="localModelsSelection" :value="browserModelSelection"
                @change="handleUpdate('browserModelSelection', $event.target.value)">
                <option value="Llama-3-8B-Instruct-q4f32_1">Llama-3-8B-Instruct-q4f32 (~6.1gb VRAM)</option>
                <option value="Llama-3-8B-Instruct-q4f16_1-1k">Llama-3-8B-Instruct-q4f16 1k Context (~4.6gb VRAM)
                </option>
                <option value="Llama-3-8B-Instruct-q4f32_1-1k">Llama-3-8B-Instruct-q4f32 1k Context (~5.2gb VRAM)
                </option>
                <option value="Llama-2-7b-chat-hf-q4f16_1">Llama-2-7b-chat-hf-q4f16 (~6.8gb VRAM)</option>
                <option value="TinyLlama-1.1B-Chat-v0.4-q4f32_1-1k">TinyLlama-1.1B-Chat-v0.4-q4f32 1k Context (~1.0gb
                  VRAM)</option>
                <option value="TinyLlama-1.1B-Chat-v0.4-q0f32">TinyLlama-1.1B-Chat-v0.4-q0f32 (~5.3gb VRAM)</option>
                <option value="Mistral-7B-Instruct-v0.2-q4f16_1">Mistral-7B-Instruct-v0.2 (~6.1gb VRAM)</option>
                <option value="OpenHermes-2.5-Mistral-7B-q4f16_1">OpenHermes-2.5-Mistral-7B (~6.1gb VRAM)</option>
                <option value="WizardMath-7B-V1.1-q4f16_1">WizardMath-7B-V1.1-q4f16 (~6.1gb VRAM)</option>
                <option value="NeuralHermes-2.5-Mistral-7B-q4f16_1">NeuralHermes-2.5-Mistral-7B-q4f16 (~6.1gb VRAM)
                </option>
                <option value="gemma-2b-it-q4f32_1">gemma-2b-it-q4f32 (~1.8gb VRAM)</option>
                <option value="gemma-2b-it-q4f32_1-1k">gemma-2b-it-q4f32 1k Context (~1.6gb VRAM)</option>
              </select>
            </div>
          </div>
          <div v-if="selectedModel.startsWith('claude-')">
            <div class="control-grid">
              <InputField :labelText="'API Key'" :isSecret="true" :placeholderText="'Enter the API Key'"
                inputId="claude-api-key" :value="claudeKey" @update:value="handleUpdate('claudeKey', $event)" />
              <div class="flex-container">
                <InputField labelText="Temperature (0.0-2.0):" :isSecret="false"
                  :placeholderText="'Enter the temperature for the model.'" inputId="claudeSliderValue"
                  :value="claudeSliderValue.toString()" @update:value="handleUpdate('claudeSliderValue', $event)" />
                <div class="slider-container">
                  <span>Serious</span>
                  <input type="range" min="0" max="2" step="0.01" :value="claudeSliderValue"
                    @input="updateClaudeSliderValue($event.target.value)" />
                  <span>Creative</span>
                </div>
              </div>
            </div>
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

@keyframes slideIn {
  0% {
    transform: translateX(-100%);
    /* Start off-screen to the left */
    opacity: 0;
    /* Optional: Start with 0 opacity */
  }

  100% {
    transform: translateX(0);
    /* End at the original position */
    opacity: 1;
    /* Optional: End with full opacity */
  }
}

@keyframes slideOut {
  0% {
    transform: translateX(0);
    /* Start off-screen to the left */
    opacity: 0;
    /* Optional: Start with 0 opacity */
  }

  100% {
    transform: translateX(-100%);
    /* End at the original position */
    opacity: 1;
    /* Optional: End with full opacity */
  }
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
    background-color: #0e2d2ae6;
    font-size: 16px;
    font-weight: bold;
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
    ;
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
    max-height: 20vh;
    overflow: auto;
    scrollbar-width: none;

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
}

.settings-header {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-top: -7px;
  position: relative;
  border-bottom: 5px solid #424045b5;
  padding: 25px 0;
  background-color: #1d1e1e;
  color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;

  h2 {
    display: flex;
    align-items: center;
    gap: 10px;
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
  /* Same width as the right border of the expanded panel */
  background-color: #1d1e1e;
  /* Increase the size of the right border */
  overflow-y: auto;
  scrollbar-width: none;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 60vh;
  transition: width 0.3s ease;
  animation: slideIn 0.25s ease-out backwards;
  /* Add transition for width */

  @media (max-width: 600px) {
    animation: slideIn 0.15s ease-out forwards backwards;
    max-width: 30vw;
    min-width: 30vw;
    background-color: #1d1e1e;
    padding: 20px;
    border-right: 3px solid #1a5951;
    /* Increase the size of the right border */
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
      transition: background-color 0.3s;

      &:hover,
      &.selected {
        background-color: #1a5951;
      }
    }

    .sub-item {
      padding-left: 20px;

      li {
        background-color: darken($highlight-bg-color, 10%);
        font-size: 14px;

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
  width: 24px;
  background-color: rgba(22, 74, 67, 0.91);
  cursor: pointer;
  height: 25vh;
  position: absolute;
  left: 0;
  top: 35%;
  border-right: 5px solid rgba(66, 64, 69, 0.7098039216);
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  animation: slideIn 0.25s ease-in-out backwards;


  &:hover {
    background-color: lighten(rgba(22, 74, 67, 0.91), 5%);
  }
}

.left-panel-collapsed span {
  width: 100%;
  text-align: center;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 15px;
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
    margin-left: 15px;
    min-height: 99vh;
  }

  h3 {
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: bold;
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
