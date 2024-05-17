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
        systemPrompt: props.systemPrompt
    };

    exportSettingsToFile(settingsData);
}

export function exportSettingsToFile(settingsData) {
    const filename = "minimal-chat-settings.json";
    const text = JSON.stringify(settingsData, null, 2);  // Pretty print JSON

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