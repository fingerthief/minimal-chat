<script setup>
import { RefreshCcw, Download, Upload, Trash2 } from 'lucide-vue-next';
import InputField from './InputField.vue';
import { ref, watch, onMounted } from 'vue';
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
import { getOpenAICompatibleAvailableModels } from '@/libs/api-access/open-ai-api-standard-access';
import { removeAPIEndpoints, showToast } from '@/libs/utils/general-utils';
import {
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
  higherContrastMessages
} from '@/libs/state-management/state'; // Import the state

// Visibility states for collapsible config sections
const isGeneralConfigOpen = ref(true);
const isBrowserModelConfigOpen = ref(true);
const isLocalConfigOpen = ref(true);
const isGPTConfigOpen = ref(true);
const isDALLEConfigOpen = ref(true);
const isClaudeConfigOpen = ref(true);
const isImportExportConfigOpen = ref(true);

// Available models
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

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}
function updateLocalSliderValue(value) {
  handleUpdate('localSliderValue', parseFloat(value));
}
function updateTopPSliderValue(value) {
  handleUpdate('top_P', parseFloat(value));
}
function updateRepetitionSliderValue(value) {
  handleUpdate('repetitionPenalty', parseFloat(value));
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
        Settings | V6.1.5
      </h2>
    </div>
    <div class="sidebar-content-container">
      <div class="config-section" :class="{ show: isGeneralConfigOpen }">
        <h3 @click="isGeneralConfigOpen = !isGeneralConfigOpen">
          General Config
          <span class="indicator">{{ isGeneralConfigOpen ? '-' : '+' }}</span>
        </h3>
        <div v-show="isGeneralConfigOpen" class="control-grid">
          <div class="control select-dropdown">
            <label for="model-selector">Model:</label>
            <select id="model-selector" :value="selectedModel" @change="handleUpdate('model', $event.target.value)">
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-4o">GPT-4 Omni</option>
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
              @change="handleUpdate('selectedAutoSaveOption', $event.target.value)">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div class="system-prompt-container">
            <InputField labelText="System Prompt:" inputId="system-prompt" :value="systemPrompt"
              @update:value="handleUpdate('systemPrompt', $event)" :isSecret="false" :isMultiline="true"
              :placeholderText="'Enter the system prompt if applicable.'" />
          </div>
          <div class="control-checkbox">
            <label for="higher-contrast-messages">
              Higher Contrast Messages:
              <input type="checkbox" id="higher-contrast-messages" :checked="higherContrastMessages"
                @change="handleUpdate('higherContrastMessages', $event.target.checked)" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="saved-system-prompts">
            <h4>Saved System Prompts:</h4>
            <ul>
              <li v-for="(prompt, index) in systemPrompts" :key="index"
                :class="{ selected: index === selectedSystemPromptIndex }" @click="handleSelectSystemPrompt(index)">
                <Trash2 :size="18" :stroke-width="1.5" @click.stop="handleDeleteSystemPrompt(index)" />
                &nbsp;&nbsp;{{ prompt }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="config-section" :class="{ show: isBrowserModelConfigOpen }" v-show="showBrowserModelConfig">
        <h3 @click="isBrowserModelConfigOpen = !isBrowserModelConfigOpen">
          Local Browser Model (Chrome and Edge Only)
          <span class="indicator">{{ isBrowserModelConfigOpen ? '-' : '+' }}</span>
        </h3>
        <div v-show="isBrowserModelConfigOpen" class="control select-dropdown">
          <label for="localModelsSelection">Model To Load In Browser:</label>
          <select id="localModelsSelection" :value="browserModelSelection"
            @change="handleUpdate('browserModelSelection', $event.target.value)">
            <option value="Llama-3-8B-Instruct-q4f32_1">Llama-3-8B-Instruct-q4f32 (~6.1gb VRAM)</option>
            <option value="Llama-3-8B-Instruct-q4f16_1-1k">Llama-3-8B-Instruct-q4f16 1k Context (~4.6gb VRAM)</option>
            <option value="Llama-3-8B-Instruct-q4f32_1-1k">Llama-3-8B-Instruct-q4f32 1k Context (~5.2gb VRAM)</option>
            <option value="Llama-2-7b-chat-hf-q4f16_1">Llama-2-7b-chat-hf-q4f16 (~6.8gb VRAM)</option>
            <option value="TinyLlama-1.1B-Chat-v0.4-q4f32_1-1k">TinyLlama-1.1B-Chat-v0.4-q4f32 1k Context (~1.0gb VRAM)
            </option>
            <option value="TinyLlama-1.1B-Chat-v0.4-q0f32">TinyLlama-1.1B-Chat-v0.4-q0f32 (~5.3gb VRAM)</option>
            <option value="Mistral-7B-Instruct-v0.2-q4f16_1">Mistral-7B-Instruct-v0.2 (~6.1gb VRAM)</option>
            <option value="OpenHermes-2.5-Mistral-7B-q4f16_1">OpenHermes-2.5-Mistral-7B (~6.1gb VRAM)</option>
            <option value="WizardMath-7B-V1.1-q4f16_1">WizardMath-7B-V1.1-q4f16 (~6.1gb VRAM)</option>
            <option value="NeuralHermes-2.5-Mistral-7B-q4f16_1">NeuralHermes-2.5-Mistral-7B-q4f16 (~6.1gb VRAM)</option>
            <option value="gemma-2b-it-q4f32_1">gemma-2b-it-q4f32 (~1.8gb VRAM)</option>
            <option value="gemma-2b-it-q4f32_1-1k">gemma-2b-it-q4f32 1k Context (~1.6gb VRAM)</option>
          </select>
        </div>
      </div>

      <div class="config-section" :class="{ show: isLocalConfigOpen }" v-show="showLocalConfig">
        <h3 @click="isLocalConfigOpen = !isLocalConfigOpen">
          Custom Endpoint Config (Open AI Format)
          <span class="indicator">{{ isLocalConfigOpen ? '-' : '+' }}</span>
        </h3>
        <br>
        <div class="saved-custom-configs">
          <h4>Saved Custom Configs</h4>
          <ul>
            <li v-for="(config, index) in customConfigs" :key="index"
              :class="{ selected: index === selectedCustomConfigIndex }" @click="handleSelectCustomConfig(index)">
              <Trash2 :size="18" :stroke-width="1.5" @click.stop="handleDeleteCustomConfig(index)" />
              <span>&nbsp;&nbsp;{{ config.endpoint }}</span>
            </li>
          </ul>
        </div>
        <div v-show="isLocalConfigOpen" class="control-grid">
          <InputField v-show="showLocalConfig" :isSecret="false" labelText="API Endpoint:"
            :placeholderText="'Enter the base API Endpoint URL'" inputId="local-model-endpoint"
            :value="localModelEndpoint" @update:value="handleUpdate('localModelEndpoint', $event)" />
          <div class="control select-dropdown">
            <label for="custom-model-selector">Models Available:</label>
            <select id="custom-model-selector" :value="localModelName"
              @change="handleUpdate('localModelName', $event.target.value)">
              <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
            </select>
          </div>
          <InputField v-show="showLocalConfig" :isSecret="true" labelText="API Key:"
            :placeholderText="'Enter the API key if applicable'" inputId="local-model-key" :value="localModelKey"
            @update:value="handleUpdate('localModelKey', $event)" />
          <InputField v-show="showLocalConfig" labelText="Max Tokens:" :isSecret="false"
            :placeholderText="'Enter the max token limit if applicable'" inputId="max-tokens"
            :value="maxTokens.toString()" @update:value="handleUpdate('maxTokens', $event)" />
          <InputField v-show="showLocalConfig || showBrowserModelConfig" labelText="Temperature (0.0-2.0):"
            :isSecret="false" :placeholderText="'Enter the temperature value for the model.'" inputId="localSliderValue"
            :value="localSliderValue.toString()" @update:value="handleUpdate('localSliderValue', $event)" />
          <div class="slider-container">
            <span>Serious</span>
            <input type="range" min="0" max="2" step="0.01" :value="localSliderValue"
              @input="updateLocalSliderValue($event.target.value)" />
            <span>Creative</span>
          </div>
          <InputField v-show="showLocalConfig || showBrowserModelConfig" labelText="Top_P Value (0.0-1.0):"
            :isSecret="false" :placeholderText="'Enter the top_P value if applicable'" inputId="top_P"
            :value="top_P.toString()" @update:value="handleUpdate('top_P', $event)" />
          <div class="slider-container">
            <span>Lower</span>
            <input type="range" min="0" max="1" step="0.01" :value="top_P"
              @input="updateTopPSliderValue($event.target.value)" />
            <span>Higher</span>
          </div>
          <InputField v-show="showLocalConfig || showBrowserModelConfig" labelText="Repetition Penalty (0.0-2.0):"
            :isSecret="false" :placeholderText="'Enter the repetition penalty value if applicable'"
            inputId="repetitionPenalty" :value="repetitionPenalty.toString()"
            @update:value="handleUpdate('repetitionPenalty', $event)" />
          <div class="slider-container">
            <span>Less</span>
            <input type="range" min="0" max="2" step="0.01" :value="repetitionPenalty"
              @input="updateRepetitionSliderValue($event.target.value)" />
            <span>More</span>
          </div>
        </div>
      </div>

      <div class="config-section" :class="{ show: isGPTConfigOpen }" v-show="showGPTConfig">
        <h3 @click="isGPTConfigOpen = !isGPTConfigOpen">
          GPT Config
          <span class="indicator">{{ isGPTConfigOpen ? '-' : '+' }}</span>
        </h3>
        <div v-show="isGPTConfigOpen" class="control-grid">
          <InputField :labelText="'API Key'" :isSecret="true" :placeholderText="'Enter the API Key'" inputId="api-key"
            :value="gptKey" @update:value="handleUpdate('gptKey', $event)" />
          <div class="slider-container">
            <span>Serious</span>
            <input type="range" min="0" max="100" :value="sliderValue"
              @blur="handleUpdate('sliderValue', $event.target.value)" />
            <span>Creative</span>
          </div>
        </div>
      </div>

      <div class="config-section" :class="{ show: isClaudeConfigOpen }" v-show="showClaudeConfig">
        <h3 @click="isClaudeConfigOpen = !isClaudeConfigOpen">
          Claude Config
          <span class="indicator">{{ isClaudeConfigOpen ? '-' : '+' }}</span>
        </h3>
        <div v-show="isClaudeConfigOpen" class="control-grid">
          <InputField :labelText="'API Key'" :isSecret="true" :placeholderText="'Enter the API Key'"
            inputId="claude-api-key" :value="claudeKey" @update:value="handleUpdate('claudeKey', $event)" />
          <div class="slider-container">
            <span>Serious</span>
            <input type="range" min="0" max="100" :value="claudeSliderValue"
              @blur="handleUpdate('claudeSliderValue', $event.target.value)" />
            <span>Creative</span>
          </div>
        </div>
      </div>

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
      <div class="config-section" :class="{ show: isImportExportConfigOpen }">
        <h3 @click="isImportExportConfigOpen = !isImportExportConfigOpen">
          Import/Export Configuration
          <span class="indicator">{{ isImportExportConfigOpen ? '-' : '+' }}</span>
        </h3>
        <div v-show="isImportExportConfigOpen" class="control-grid">
          <h4>
            Manage Settings
            <p class="config-info">
              Export your current settings to a JSON file for backup or to easily set up the application on another
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
    <div class="bottom-panel">
      <button class="close-btn" @click="toggleSidebar">Close</button>
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
  background-color: #1d1e1e;
  z-index: 10000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  scrollbar-width: none;
}

.select-dropdown select {
  appearance: none;
  background-color: $input-bg-color;
  color: #fff;
  height: 40px;
  padding: 6px;
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

.settings-header {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-top: -7px;
  position: relative;
  border-bottom: 5px solid $header-border-color;
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
  transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
  background-color: #202625c2;
  /* Use a solid color */
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
  border-radius: 5px;
  /* Add rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* Subtle shadow */

  &:hover {
    background-color: lighten(#202625c2, 2%);
    /* Slightly darker shade for hover */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    /* Enhance shadow on hover */
  }

  &:active {
    background-color: #0e3d34;
    /* Even darker shade for active state */
    transform: translateY(1px);
  }
}


.box {
  box-shadow: 0px 1px 2px 0px $shadow-color;
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

  input[type='range'] {
    -webkit-appearance: none;
    flex-grow: 1;
    height: 15px;
    background: $primary-bg-color;
    outline: none;
    margin-left: 10px;
    margin-right: 10px;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background: $button-bg-color;
      cursor: pointer;
    }

    background: $button-bg-color;
    cursor: pointer;
  }
}

.bottom-panel {
  padding: 20px;
  background-color: $bottom-panel-bg-color;


  @media (min-width: 600px) {
    display: none;
  }
}

.system-prompt-container,
.saved-custom-configs,
.saved-system-prompts {
  padding-bottom: 15px;

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
      background-color: $button-bg-color;
      border-radius: 4px;
      margin-bottom: 8px;
      max-height: 6vh;
      overflow: hidden;
      text-align: left;
      cursor: pointer;

      &.selected {
        background-color: $highlight-bg-color;
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
</style>
