// watchers.js
import { watch } from 'vue';
import { unloadModel, removeAPIEndpoints, updateUIWrapper } from '@/libs/utils/general-utils';
import { engine, loadNewModel } from '@/libs/api-access/web-llm-access';
import { modelSettings, MODEL_TYPES, defaultSettings } from '@/libs/utils/constants';
import {
  selectedModel,
  modelDisplayName,
  isLoading,
  browserModelSelection,
  localModelKey,
  systemPrompt,
  maxTokens,
  top_P,
  repetitionPenalty,
  localModelName,
  localSliderValue,
  gptKey,
  sliderValue,
  claudeKey,
  claudeSliderValue,
  selectedDallEImageCount,
  selectedDallEImageResolution,
  selectedAutoSaveOption,
  localModelEndpoint,
  higherContrastMessages,
  pushToTalkMode,
  useWhisper,
  ttsModel,
  audioSpeed,
  whisperTemperature,
  selectedCustomEndpoint // Add this import
} from '@/libs/state-management/state';

export function setupWatchers() {
  watch(selectedModel, (newValue) => {
    if (!newValue) return; // Early return if newValue is null or undefined

    const settings = Object.keys(MODEL_TYPES).reduce((acc, key) => {
      if (newValue.includes(MODEL_TYPES[key])) {
        return modelSettings[MODEL_TYPES[key]];
      }
      return acc;
    }, defaultSettings);

    if (settings.modelDisplayName !== 'WebGPU Model') {
      unloadModel(engine);
    }
    try {
      localStorage.setItem('useLocalModel', settings.useLocalModel);
      localStorage.setItem('selectedModel', newValue);
      modelDisplayName.value = settings.modelDisplayName;
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  });

  watch(selectedCustomEndpoint, (newValue) => {
    if (newValue === 'new') {
      // Handle the case for adding a new custom endpoint
      // You can set the default values for a new custom endpoint here if needed
      return;
    }
    // Handle the selection of an existing custom endpoint
    // For example, load the endpoint details into the appropriate state variables
  });

  const watchAndStore = (ref, key, transform = (val) => val) => {
    watch(ref, (newValue) => {
      localStorage.setItem(key, transform(newValue));
    });
  };

  const refsToWatch = [
    { ref: localModelKey, key: 'localModelKey' },
    { ref: systemPrompt, key: 'systemPrompt' },
    { ref: maxTokens, key: 'maxTokens' },
    { ref: top_P, key: 'top_P' },
    { ref: repetitionPenalty, key: 'repetitionPenalty' },
    { ref: localModelName, key: 'localModelName' },
    { ref: localSliderValue, key: 'local-attitude' },
    { ref: gptKey, key: 'gptKey' },
    { ref: sliderValue, key: 'gpt-attitude' },
    { ref: claudeKey, key: 'claudeKey' },
    { ref: claudeSliderValue, key: 'claude-attitude' },
    { ref: selectedDallEImageCount, key: 'selectedDallEImageCount' },
    { ref: selectedDallEImageResolution, key: 'selectedDallEImageResolution' },
    { ref: selectedAutoSaveOption, key: 'selectedAutoSaveOption' },
    { ref: higherContrastMessages, key: 'higherContrastMessages' },
    { ref: pushToTalkMode, key: 'use-push-to-talk' },
    { ref: useWhisper, key: 'use-whisper' },
    { ref: ttsModel, key: 'tts-model' },
    { ref: audioSpeed, key: 'audio-speed' },
    { ref: whisperTemperature, key: 'whisper-temperature' },
  ];

  refsToWatch.forEach(({ ref, key }) => watchAndStore(ref, key));

  watchAndStore(localModelEndpoint, 'localModelEndpoint', removeAPIEndpoints);

  watch(browserModelSelection, async (newValue) => {
    if (browserModelSelection.value === undefined || !selectedModel.value || !selectedModel.value.includes('web-llm')) {
      return;
    }

    localStorage.setItem('browserModelSelection', newValue);
    modelDisplayName.value = newValue;
    isLoading.value = true;
    await loadNewModel(newValue, updateUIWrapper);
    isLoading.value = false;
  });
}
