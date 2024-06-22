import { ref } from 'vue';
import { selectedModel, ttsVoice, whisperTemperature, audioSpeed, ttsModel, useWhisper, pushToTalkMode, higherContrastMessages, isSidebarOpen, systemPrompt, localModelName, localSliderValue, top_P, repetitionPenalty, maxTokens, localModelEndpoint, localModelKey, selectedAutoSaveOption, browserModelSelection, gptKey, sliderValue, claudeKey, claudeSliderValue, selectedDallEImageCount, selectedDallEImageResolution, availableModels } from '../state-management/state';
import { removeAPIEndpoints, showToast } from "./general-utils";
import { getOpenAICompatibleAvailableModels } from '../api-access/open-ai-api-standard-access';

export const showGPTConfig = ref(selectedModel.value.indexOf('gpt') !== -1);
export const showLocalConfig = ref(selectedModel.value.indexOf('open-ai-format') !== -1);
export const showClaudeConfig = ref(selectedModel.value.indexOf('claude') !== -1);
export const showBrowserModelConfig = ref(selectedModel.value.indexOf('web-llm') !== -1);

export function update(field, value) {
  if (field === 'model') {
    showGPTConfig.value = value.indexOf('gpt') !== -1;
    showLocalConfig.value = value.indexOf('open-ai-format') !== -1;
    showClaudeConfig.value = value.indexOf('claude') !== -1;
    showBrowserModelConfig.value = value.indexOf('web-llm') !== -1;
    selectedModel.value = value;

    return;
  }

  if (field === 'systemPrompt') {
    systemPrompt.value = value;
    saveSystemPrompt(value);

    return;
  }

  if (['localModelName', 'localSliderValue', 'top_P', 'repetitionPenalty', 'maxTokens', 'localModelEndpoint', 'localModelKey'].includes(field)) {
    if (field === 'localModelName') localModelName.value = value;
    if (field === 'localSliderValue') localSliderValue.value = value;
    if (field === 'top_P') top_P.value = value;
    if (field === 'repetitionPenalty') repetitionPenalty.value = value;
    if (field === 'maxTokens') maxTokens.value = value;
    if (field === 'localModelEndpoint') localModelEndpoint.value = value;
    if (field === 'localModelKey') localModelKey.value = value;

    if (selectedCustomConfigIndex.value !== null) {
      saveCustomConfig();
    }

    return;
  }

  if (field === 'selectedAutoSaveOption') selectedAutoSaveOption.value = value;
  if (field === 'browserModelSelection') browserModelSelection.value = value;
  if (field === 'gptKey') gptKey.value = value;
  if (field === 'sliderValue') sliderValue.value = value;
  if (field === 'claudeKey') claudeKey.value = value;
  if (field === 'claudeSliderValue') claudeSliderValue.value = value;
  if (field === 'selectedDallEImageCount') selectedDallEImageCount.value = value;
  if (field === 'selectedDallEImageResolution') selectedDallEImageResolution.value = value;
  if (field === 'customConfigs') customConfigs.value = value;
  if (field === 'systemPrompts') systemPrompts.value = value;
  if (field === 'higherContrastMessages') higherContrastMessages.value = value;
  if (field === 'use-push-to-talk') pushToTalkMode.value = value;
  if (field === 'use-whisper') useWhisper.value = value;
  if (field === 'audio-speed') audioSpeed.value = value;
  if (field === 'tts-model') ttsModel.value = value;
  if (field === 'tts-voice') ttsVoice.value = value;
  if (field === 'whisper-temperature') whisperTemperature.value = value;
}


export const systemPrompts = ref([]);
export const selectedSystemPromptIndex = ref(null);

export function saveSystemPrompt(prompt) {
  if (prompt !== '') {
    const trimmedPrompt = prompt.trim();
    if (!systemPrompts.value.includes(trimmedPrompt)) {
      systemPrompts.value.push(trimmedPrompt);
      localStorage.setItem('system-prompts', JSON.stringify(systemPrompts.value));
      selectedSystemPromptIndex.value = systemPrompts.value.length - 1;
      showToast('Added New System Prompt');
    }
  } else {
    selectedSystemPromptIndex.value = -1;
  }
}

export function deleteSystemPrompt(index) {
  systemPrompts.value.splice(index, 1);
  localStorage.setItem('system-prompts', JSON.stringify(systemPrompts.value));
  showToast('Deleted System Prompt');
}

export function selectSystemPrompt(index) {
  selectedSystemPromptIndex.value = index;
  systemPrompt.value = systemPrompts.value[index];
}

export const customConfigs = ref([]);
export const selectedCustomConfigIndex = ref(null);

export function saveCustomConfig() {
  if (localModelEndpoint.value.trim() === '') {
    return;
  }

  const newConfig = {
    endpoint: localModelEndpoint.value,
    apiKey: localModelKey.value,
    modelName: localModelName.value,
    maxTokens: maxTokens.value,
    temperature: localSliderValue.value,
    top_P: top_P.value,
    repetitionPenalty: repetitionPenalty.value,
  };

  const existingConfigIndex = customConfigs.value.findIndex((config) => config.endpoint === newConfig.endpoint);

  if (existingConfigIndex !== -1) {
    customConfigs.value[existingConfigIndex] = newConfig;
  } else {
    customConfigs.value.push(newConfig);
    selectedCustomConfigIndex.value = customConfigs.value.length - 1;
    showToast('Saved New Custom Config');
  }

  localStorage.setItem('saved-custom-configs', JSON.stringify(customConfigs.value));
}

export function deleteCustomConfig(index) {
  customConfigs.value.splice(index, 1);
  localStorage.setItem('saved-custom-configs', JSON.stringify(customConfigs.value));
  showToast('Deleted Custom Config');
}

export async function selectCustomConfig(index) {
  selectedCustomConfigIndex.value = index;
  const config = customConfigs.value[index];
  localModelEndpoint.value = config.endpoint;
  localModelKey.value = config.apiKey;
  localModelName.value = config.modelName;
  maxTokens.value = config.maxTokens;
  localSliderValue.value = config.temperature;
  top_P.value = config.top_P;
  repetitionPenalty.value = config.repetitionPenalty;
  selectedModel.value = "open-ai-format";

  try {
    if (localModelEndpoint.value.trim() !== '') {
      const models = await getOpenAICompatibleAvailableModels(removeAPIEndpoints(localModelEndpoint.value));
      availableModels.value = models;
    }
  } catch (error) {
    console.error('Error fetching available models:', error);
  }
}

export function handleExportSettings() {
  const settingsData = {
    isSidebarOpen: isSidebarOpen.value,
    selectedModel: selectedModel.value,
    localModelName: localModelName.value,
    localModelEndpoint: localModelEndpoint.value,
    localModelKey: localModelKey.value,
    localSliderValue: localSliderValue.value,
    gptKey: gptKey.value,
    sliderValue: sliderValue.value,
    claudeKey: claudeKey.value,
    claudeSliderValue: claudeSliderValue.value,
    selectedDallEImageCount: selectedDallEImageCount.value,
    selectedDallEImageResolution: selectedDallEImageResolution.value,
    selectedAutoSaveOption: selectedAutoSaveOption.value,
    browserModelSelection: browserModelSelection.value,
    maxTokens: maxTokens.value,
    top_P: top_P.value,
    repetitionPenalty: repetitionPenalty.value,
    systemPrompt: systemPrompt.value,
    customConfigs: customConfigs.value,
    systemPrompts: systemPrompts.value
  };

  exportSettingsToFile(settingsData);
}

export function exportSettingsToFile(settingsData) {
  const filename = 'minimal-chat-settings.json';
  const text = JSON.stringify(settingsData, null, 2); // Pretty print JSON

  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function handleImportSettings(event, importSettings) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const settingsData = JSON.parse(e.target.result);
      importSettings(settingsData);

      selectedModel.value = "gpt-4o";
      saveCustomConfig();
    };
    reader.readAsText(file);
  }
}

export function importSettings(settingsData, update2) {
  for (const key in settingsData) {
    if (Object.prototype.hasOwnProperty.call(settingsData, key)) {
      update(key, settingsData[key]);
    }
  }
}

export function handleDeleteSystemPrompt(index) {
  deleteSystemPrompt(index, showToast);
}

export function handleSelectSystemPrompt(index) {
  selectSystemPrompt(index, systemPrompt);
}

// Custom Configs
export function handleDeleteCustomConfig(index) {
  deleteCustomConfig(index, showToast);
}

export function handleUpdate(field, value) {
  update(field, value);
}


export function updateGptSliderValue(value) {
  handleUpdate('sliderValue', parseFloat(value));
}

export function updateWhisperSlider(value) {
  handleUpdate('whisper-temperature', parseFloat(value));
}

export function updateLocalSliderValue(value) {
  handleUpdate('localSliderValue', parseFloat(value));
}

export function updateClaudeSliderValue(value) {
  handleUpdate('claudeSliderValue', parseFloat(value));
}

export function updateTopPSliderValue(value) {
  handleUpdate('top_P', parseFloat(value));
}

export function updateMaxTokensSliderValue(value) {
  handleUpdate('maxTokens', parseFloat(value));
}

export function updateRepetitionSliderValue(value) {
  handleUpdate('repetitionPenalty', parseFloat(value));
}

export function handleSelectCustomConfig(index) {
  selectCustomConfig(index, localModelEndpoint, localModelKey, localModelName, maxTokens, localSliderValue, top_P, repetitionPenalty);
}
