// constants.js
export const MODEL_TYPES = {
    OPEN_AI_FORMAT: 'open-ai-format',
    CLAUDE: 'claude',
    GPT: 'gpt',
    WEB_LLM: 'web-llm',
};

export const modelSettings = {
    [MODEL_TYPES.OPEN_AI_FORMAT]: { useLocalModel: false, modelDisplayName: 'Custom Model' },
    [MODEL_TYPES.CLAUDE]: { useLocalModel: false, modelDisplayName: 'Claude' },
    [MODEL_TYPES.GPT]: { useLocalModel: false, modelDisplayName: 'GPT' },
    [MODEL_TYPES.WEB_LLM]: { useLocalModel: false, modelDisplayName: 'WebGPU Model' },
};

export const defaultSettings = { useLocalModel: false, isUsingLocalModel: false, modelDisplayName: 'Unknown' };
