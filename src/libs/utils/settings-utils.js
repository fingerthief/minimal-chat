import { selectedModel } from "../state-management/state";
import { ref } from 'vue';

export const customConfigs = ref([]);
export const selectedCustomConfigIndex = ref(null);

export function saveCustomConfig(localModelEndpoint, localModelKey, localModelName, maxTokens, localSliderValue, top_P, repetitionPenalty, showToast) {
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

export function deleteCustomConfig(index, showToast) {
  customConfigs.value.splice(index, 1);
  localStorage.setItem('saved-custom-configs', JSON.stringify(customConfigs.value));
  showToast('Deleted Custom Config');
}

export function selectCustomConfig(index, localModelEndpoint, localModelKey, localModelName, maxTokens, localSliderValue, top_P, repetitionPenalty) {
  selectedCustomConfigIndex.value = index;
  const config = customConfigs.value[index];
  localModelEndpoint.value = config.endpoint;
  localModelKey.value = config.apiKey;
  localModelName.value = config.modelName;
  maxTokens.value = config.maxTokens;
  localSliderValue.value = config.temperature;
  top_P.value = config.top_P;
  repetitionPenalty.value = config.repetitionPenalty;

  const modelSelector = document.getElementById('custom-model-selector');
  if (modelSelector) {
    const options = Array.from(modelSelector.options);
    const matchingOption = options.find((option) => option.value === config.modelName);
    if (matchingOption) {
      modelSelector.value = matchingOption.value;
    }
  }
}

export function handleExportSettings(props, exportSettingsToFile) {
  const settingsData = {
    isSidebarOpen: props.isSidebarOpen,
    selectedModel: props.selectedModel,
    localModelName: props.localModelName,
    localModelEndpoint: props.localModelEndpoint,
    localModelKey: props.localModelKey,
    huggingFaceEndpoint: props.huggingFaceEndpoint,
    localSliderValue: props.localSliderValue,
    gptKey: props.gptKey,
    sliderValue: props.sliderValue,
    claudeKey: props.claudeKey,
    claudeSliderValue: props.claudeSliderValue,
    selectedDallEImageCount: props.selectedDallEImageCount,
    selectedDallEImageResolution: props.selectedDallEImageResolution,
    selectedAutoSaveOption: props.selectedAutoSaveOption,
    browserModelSelection: props.browserModelSelection,
    maxTokens: props.maxTokens,
    top_P: props.top_P,
    repetitionPenalty: props.repetitionPenalty,
    systemPrompt: props.systemPrompt,
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
    };
    reader.readAsText(file);
  }
}

export function importSettings(settingsData, update) {
  for (const key in settingsData) {
    if (Object.prototype.hasOwnProperty.call(settingsData, key)) {
      update(key, settingsData[key]);
    }
  }
}
