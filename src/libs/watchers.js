// watchers.js
import { watch } from 'vue';
import { unloadModel, removeAPIEndpoints } from '@/libs/utils';
import { engine, loadNewModel } from '@/libs/web-llm-access';
import { modelSettings, MODEL_TYPES, defaultSettings } from '@/libs/constants';
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
} from '@/libs/state';

export function setupWatchers() {
    watch(selectedModel, (newValue) => {
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
    ];

    refsToWatch.forEach(({ ref, key }) => watchAndStore(ref, key));

    watchAndStore(localModelEndpoint, 'localModelEndpoint', removeAPIEndpoints);

    watch(browserModelSelection, async (newValue) => {
        if (browserModelSelection.value === undefined || !selectedModel.value.includes("web-llm")) {
            return;
        }

        localStorage.setItem('browserModelSelection', newValue);
        modelDisplayName.value = newValue;
        isLoading.value = true;
        await loadNewModel(newValue, updateUIWrapper);
        isLoading.value = false;
    });
}
