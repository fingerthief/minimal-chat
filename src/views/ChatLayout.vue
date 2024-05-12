<!-- eslint-disable no-unused-vars -->

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { ChevronDown, Underline } from 'lucide-vue-next';
import { loadConversationTitles, loadStoredConversations, fetchGPTResponseStream, generateDALLEImage } from '@/libs/gpt-api-access';
import { fetchClaudeConversationTitle, streamClaudeResponse } from '@/libs/claude-api-access';
import { getConversationTitleFromGPT, showToast, removeAPIEndpoints } from '@/libs/utils';
import { analyzeImage } from '@/libs/image-analysis';
import { fetchLocalModelResponseStream, getConversationTitleFromLocalModel } from '@/libs/open-ai-api-standard-access';
import { sendBrowserLoadedModelMessage, getBrowserLoadedModelConversationTitle, engine, loadNewModel } from '@/libs/web-llm-access';

import messageItem from '@/components/message-item.vue';
import chatInput from '@/components/chat-input.vue';
import chatHeader from '@/components/chat-header.vue';
import settingsDialog from '@/components/settings-dialog.vue';
import conversationsDialog from '@/components/conversations-dialog.vue';

//#region Refs
const shouldShowScrollButton = ref(false);
const isAnalyzingImage = ref(false);
const userText = ref('');
const isLoading = ref(false);
const isClaudeEnabled = ref(false);
const isUsingLocalModel = ref(false);
const isGeneratingImage = ref(false);
const isProcessing = ref(false);
const hasFilterText = ref(false);
const selectedModel = ref(localStorage.getItem("selectedModel") || "gpt-4-turbo");
const isSidebarOpen = ref(false);
const showConversationOptions = ref(false);
const messages = ref([]);
const streamedMessageText = ref("");
const modelDisplayName = ref("Unknown");

const localModelKey = ref(localStorage.getItem("localModelKey") || '')
const localModelName = ref(localStorage.getItem("localModelName") || '');
const localModelEndpoint = ref(removeAPIEndpoints(localStorage.getItem("localModelEndpoint") || ''));
const localSliderValue = ref(parseFloat(localStorage.getItem("local-attitude")) || 0.6);
const gptKey = ref(localStorage.getItem("gptKey") || '');
const sliderValue = ref(parseInt(localStorage.getItem("gpt-attitude")) || 50);
const claudeKey = ref(localStorage.getItem("claudeKey") || '');
const claudeSliderValue = ref(parseInt(localStorage.getItem("claude-attitude")) || 50);
const selectedDallEImageCount = ref(parseInt(localStorage.getItem("selectedDallEImageCount")) || 1);
const selectedDallEImageResolution = ref(localStorage.getItem("selectedDallEImageResolution") || '256x256');
const selectedAutoSaveOption = ref(localStorage.getItem("selectedAutoSaveOption") || true);

const browserModelSelection = ref(localStorage.getItem("browserModelSelection") || "Llama-3-8B-Instruct-q4f16_1-1k");

const maxTokens = ref(parseInt(localStorage.getItem("maxTokens")) || -1);
const top_P = ref(parseFloat(localStorage.getItem("top_P")) || 1.0);
const repetitionPenalty = ref(parseFloat(localStorage.getItem("repetitionPenalty")) || 1.0);

const systemPrompt = ref(localStorage.getItem("systemPrompt") || "");

const conversations = ref(loadConversationTitles());
const conversationTitles = ref(loadConversationTitles());
const storedConversations = ref(loadStoredConversations());
const lastLoadedConversationId = ref(parseInt(localStorage.getItem("lastConversationId")) || 0);
const selectedConversation = ref(conversations.value[0]);
const abortController = ref(null);

const displayConversations = computed(() => conversations);
let messagesContainer;

//#endregion

//#region Watchers
// Watchers that update local storage when values change
watch(selectedModel, (newValue) => {
    const MODEL_TYPES = {
        OPEN_AI_FORMAT: 'open-ai-format',
        CLAUDE: 'claude',
        GPT: 'gpt',
        WEB_LLM: 'web-llm'
    };

    // Default settings
    let useLocalModel = false;

    const flags = {
        isUsingLocalModel: false,
        isClaudeEnabled: false,
    };

    // Determine settings based on model type
    if (newValue.includes(MODEL_TYPES.OPEN_AI_FORMAT)) {
        useLocalModel = true;
        flags.isUsingLocalModel = true;
        modelDisplayName.value = "Custom Model"

        unloadModel();
    }
    else if (newValue.includes(MODEL_TYPES.CLAUDE)) {
        useLocalModel = false;
        flags.isClaudeEnabled = true;
        modelDisplayName.value = "Claude"

        unloadModel();
    }
    else if (newValue.includes(MODEL_TYPES.GPT)) {
        modelDisplayName.value = "GPT"

        unloadModel();
    }
    else if (newValue.includes(MODEL_TYPES.WEB_LLM)) {
        modelDisplayName.value = 'Local Browser Model';
    }


    // Apply settings
    try {
        localStorage.setItem('useLocalModel', useLocalModel);
        localStorage.setItem('selectedModel', newValue);
        isUsingLocalModel.value = flags.isUsingLocalModel;
        isClaudeEnabled.value = flags.isClaudeEnabled;
    }
    catch (error) {
        console.error('Error updating settings:', error);
    }
});

function unloadModel() {
    if (engine !== undefined) {
        engine.unload();
    }
}

watch(localModelKey, (newValue) => {
    localStorage.setItem('localModelKey', newValue);
});

watch(systemPrompt, (newValue) => {
    localStorage.setItem('systemPrompt', newValue);
});

watch(maxTokens, (newValue) => {
    localStorage.setItem('maxTokens', newValue);
});

watch(browserModelSelection, async (newValue) => {
    localStorage.setItem('browserModelSelection', newValue);

    modelDisplayName.value = browserModelSelection.value;

    isLoading.value = true;

    await loadNewModel(newValue, updateUI);

    isLoading.value = false;
});

watch(top_P, (newValue) => {
    localStorage.setItem('top_P', newValue);
});

watch(repetitionPenalty, (newValue) => {
    localStorage.setItem('repetitionPenalty', newValue);
});

watch(localModelName, (newValue) => {
    localStorage.setItem('localModelName', newValue);
});

watch(localModelEndpoint, (newValue) => {
    const apiSafeURL = removeAPIEndpoints(newValue);
    localStorage.setItem('localModelEndpoint', apiSafeURL);
});

watch(localSliderValue, (newValue) => {
    localStorage.setItem('local-attitude', newValue);
});

watch(gptKey, (newValue) => {
    localStorage.setItem('gptKey', newValue);
});

watch(sliderValue, (newValue) => {
    localStorage.setItem('gpt-attitude', newValue);
});

watch(claudeKey, (newValue) => {
    localStorage.setItem('claudeKey', newValue);
});

watch(claudeSliderValue, (newValue) => {
    localStorage.setItem('claude-attitude', newValue);
});

watch(selectedDallEImageCount, (newValue) => {
    localStorage.setItem('selectedDallEImageCount', newValue);
});

watch(selectedDallEImageResolution, (newValue) => {
    localStorage.setItem('selectedDallEImageResolution', newValue);
});

watch(selectedAutoSaveOption, (newValue) => {
    localStorage.setItem('selectedAutoSaveOption', newValue);
});
//#endregion watchers

async function setSystemPrompt(prompt) {
    // Find the index of the existing system prompt (if any)
    const systemPromptIndex = messages.value.findIndex(message => message.role === 'system');

    if (systemPromptIndex === 0) {
        // Trim the prompt and check if it is empty
        if (prompt.trim() === '') {
            // Remove the system entry from the messages ref if the prompt is an empty string
            messages.value.shift();
            return;
        }

        messages.value[0].content = prompt;
        return;
    }

    if (prompt.trim() === '') {
        return; //Do not add an empty system prompt
    }

    // Add a new system prompt at the beginning of the messages
    messages.value.unshift({
        role: 'system',
        content: prompt
    });

}

//#region UI Updates
function determineModelDisplayName(newValue) {
    const MODEL_TYPES = {
        OPEN_AI_FORMAT: 'open-ai-format',
        CLAUDE: 'claude',
        GPT: 'gpt',
        WEB_LLM: 'web-llm'
    };

    // Determine settings based on model type
    if (newValue.includes(MODEL_TYPES.OPEN_AI_FORMAT)) {
        modelDisplayName.value = "Custom Model"
    }
    else if (newValue.includes(MODEL_TYPES.CLAUDE)) {
        modelDisplayName.value = "Claude"
    }
    else if (newValue.includes(MODEL_TYPES.GPT)) {
        modelDisplayName.value = "GPT"
    }
    else if (newValue.includes(MODEL_TYPES.WEB_LLM)) {
        modelDisplayName.value = browserModelSelection.value;
    }

}


const updateUserText = (newText) => {
    userText.value = newText;
};

function resetMessages() {
    localStorage.removeItem("gpt-messages");
    messages.value = [];
    lastLoadedConversationId.value = null;
}

function updateUI(content, autoScrollBottom = true, appendTextValue = true) {
    if (!appendTextValue) {
        streamedMessageText.value = content;
        return;
    }

    streamedMessageText.value = (streamedMessageText.value || "") + content;
}

function toggleSidebar() {
    event.stopPropagation();
    isSidebarOpen.value = !isSidebarOpen.value;
}
//#endregion

//#region Conversation Handling
function deleteCurrentConversation() {
    if (lastLoadedConversationId.value === null) {
        return;
    }

    isProcessing.value = true;
    const tempStoredConversations = loadStoredConversations();

    const conversationIndex = tempStoredConversations.findIndex(
        (conversation) => conversation.id === parseInt(lastLoadedConversationId.value)
    );

    if (conversationIndex !== -1) {
        tempStoredConversations.splice(conversationIndex, 1);
        localStorage.setItem("gpt-conversations", JSON.stringify(tempStoredConversations));
    }

    storedConversations.value = tempStoredConversations;

    messages.value = [];

    const tempConversationTitles = loadConversationTitles();

    conversationTitles.value = tempConversationTitles;
    conversations.value = tempConversationTitles;
    lastLoadedConversationId.value = 0;

    localStorage.setItem("lastConversationId", 0);

    if (conversations.value.length > 0) {
        loadSelectedConversation(conversations.value[0]);
    }

    isProcessing.value = false;
    showToast("Conversation Deleted");
}

function showConversations() {
    event.stopPropagation();
    showConversationOptions.value = !showConversationOptions.value;
}

async function saveMessages() {
    streamedMessageText.value = "";

    const savedMessages = messages.value.map(({
        role,
        content
    }) => ({
        role,
        content
    }));

    const conversationIndex = selectedConversation.value ?
        storedConversations.value.findIndex(
            (conversation) => conversation.conversation.title === selectedConversation.value.conversation.title
        ) :
        -1;

    if (conversationIndex !== -1) {
        storedConversations.value[conversationIndex].conversation.messageHistory = savedMessages;
    } else if (JSON.parse(selectedAutoSaveOption.value)) {
        await saveNewConversations();

        localStorage.setItem("gpt-conversations", JSON.stringify(storedConversations.value));
        selectConversation(lastLoadedConversationId.value);
    }

    localStorage.setItem("gpt-conversations", JSON.stringify(storedConversations.value));
};

async function clearMessages() {
    isProcessing.value = true;

    const newConversation = {
        messageHistory: selectedConversation.value.conversation.messageHistory.slice(0),
        title: ""
    };

    const tempStoredConversations = loadStoredConversations();

    if (tempStoredConversations.length === 0) {
        await createAndStoreNewConversation(tempStoredConversations, newConversation);
    } else {
        newConversation.conversationId = tempStoredConversations.length - 1;

        if (selectedAutoSaveOption.value && lastLoadedConversationId.value !== null) {
            await updateExistingConversation(tempStoredConversations, newConversation);
        } else {
            await createAndStoreNewConversation(tempStoredConversations, newConversation);
        }
    }

    localStorage.setItem("gpt-conversations", JSON.stringify(tempStoredConversations));

    conversations.value = loadConversationTitles();
    storedConversations.value = loadStoredConversations();

    lastLoadedConversationId.value = tempStoredConversations.length - 1;
    localStorage.setItem("lastConversationId", lastLoadedConversationId.value);

    resetMessages();

    selectedConversation.value = {
        id: tempStoredConversations.length,
        conversation: {
            messageHistory: [],
            title: 'placeholder'
        }
    };

    if (showConversationOptions.value) {
        showConversations();
    }

    isProcessing.value = false;

    showToast("Conversation Saved");
}

async function saveNewConversations() {
    const newConversationWithTitle = await createNewConversationWithTitle();

    const tempStoredConversations = localStorage.getItem("gpt-conversations") ?
        JSON.parse(localStorage.getItem("gpt-conversations")) : [];

    if (tempStoredConversations.length === 0) {
        tempStoredConversations.push({
            id: 0,
            conversation: newConversationWithTitle
        });
        localStorage.setItem("lastConversationId", 0);
        lastLoadedConversationId.value = 0;
    }
    else {
        newConversationWithTitle.conversationId = tempStoredConversations.length - 1;

        if (lastLoadedConversationId.value !== null) {
            const conversationIndex = tempStoredConversations.findIndex(
                conversation => conversation.id === parseInt(lastLoadedConversationId.value)
            );

            tempStoredConversations[conversationIndex].conversation.messageHistory = newConversationWithTitle.messageHistory;
        }
        else {
            const highestId = Math.max(...tempStoredConversations.map(conversation => conversation.id));
            tempStoredConversations.push({
                id: highestId + 1,
                conversation: newConversationWithTitle
            });
            lastLoadedConversationId.value = highestId + 1;
        }
    }

    localStorage.setItem("gpt-conversations", JSON.stringify(tempStoredConversations));
    localStorage.setItem("lastConversationId", lastLoadedConversationId.value);

    conversations.value = loadConversationTitles();
    storedConversations.value = loadStoredConversations();

    selectedConversation.value = conversations.value[conversations.value.length - 1];
}

async function createNewConversationWithTitle() {
    const newConversationWithTitle = {
        messageHistory: messages.value.slice(0),
        title: ""
    };

    if (isClaudeEnabled.value) {
        newConversationWithTitle.title = await fetchClaudeConversationTitle(messages.value.slice(0));
    }

    if (selectedModel.value.indexOf("open-ai-format") !== -1) {
        newConversationWithTitle.title = await getConversationTitleFromLocalModel(messages.value.slice(0), localModelName.value, localModelEndpoint.value);
    }

    if (selectedModel.value.indexOf("gpt") !== -1) {
        newConversationWithTitle.title = await getConversationTitleFromGPT(messages.value.slice(0), selectedModel.value, sliderValue.value);
    }

    if (selectedModel.value.indexOf("web-llm") !== -1) {
        newConversationWithTitle.title = await getBrowserLoadedModelConversationTitle(messages.value.slice(0));
    }

    return newConversationWithTitle;
}

async function createAndStoreNewConversation(storedConversations, newConversation) {
    const newConversationWithTitle = await createNewConversationWithTitle();

    const highestId = storedConversations.length > 0 ?
        Math.max(...storedConversations.map(conversation => conversation.id)) :
        -1;
    storedConversations.push({
        id: highestId + 1,
        conversation: newConversationWithTitle
    });

    localStorage.setItem("lastConversationId", (highestId + 1).toString());
    lastLoadedConversationId.value = highestId + 1;
}

async function updateExistingConversation(storedConversations, newConversation) {
    const conversationIndex = storedConversations.findIndex(
        conversation => conversation.id === lastLoadedConversationId.value
    );
    storedConversations[conversationIndex].messageHistory = newConversation.messageHistory;
}

function handleImportConversations() {
    openFileSelector();
}

function handleExportConversations() {
    const filename = "conversations.json";
    const text = localStorage.getItem("gpt-conversations")

    let element = document.createElement('a');

    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function handlePurgeConversations() {
    localStorage.setItem("gpt-conversations", "");
    messages.value = [];
    conversations.value = [];
    storedConversations.value = [];
    showToast("All Conversations Deleted.");
}

function selectConversation(conversationId) {
    if (!conversations.value.length) {
        return;
    }

    const conversation = conversations.value.find(c => c.id === conversationId);

    if (conversation) {
        selectedConversation.value = conversation;
        loadSelectedConversation(selectedConversation.value);
    } else {
        console.error('Conversation with ID ' + conversationId + ' not found.');
    }
}

function loadSelectedConversation(conversation) {
    if (conversation) {
        selectedConversation.value = conversation;
        lastLoadedConversationId.value = conversation.id;
        localStorage.setItem('lastConversationId', lastLoadedConversationId.value);
    }

    if (!selectedConversation.value || !selectedConversation.value.conversation.messageHistory) {
        return;
    }

    // Initialize the maximum ID found in the current messages
    let maxId = messages.value.reduce((max, message) => message.id ? Math.max(max, message.id) : max, 0);

    // Process each message to ensure it has a unique ID
    const processedMessages = selectedConversation.value.conversation.messageHistory.map(message => {
        if (!message.id) {
            maxId++; // Increment maxId to ensure a unique ID
            return { ...message, id: maxId }; // Assign the new ID
        }
        return message;
    });

    messages.value = processedMessages; // Update the messages reactive variable
    showConversationOptions.value = false;
}

//#endregion

//#region Messages Handling
let lastMessageText;
async function sendMessage(event) {
    const messageText = userText.value.trim();

    if (userText.value.trim().length === 0) {
        showToast("Please Enter a Prompt First");
        return;
    }

    lastMessageText = messageText;

    if (selectedModel.value.indexOf("claude") !== -1) {
        await sendClaudeMessage(messageText);
        streamedMessageText.value = "";
        return;
    }

    isClaudeEnabled.value = false;
    addMessage("user", messageText);

    userText.value = "";

    if (!messageText || messageText === "" || isLoading.value || isGeneratingImage.value) {
        return;
    }

    if (messageText.toLowerCase().startsWith("image::")) {
        await sendImagePrompt(messageText);
        return;
    }

    if (messageText.toLowerCase().startsWith("vision::")) {
        await sendVisionPrompt();
        return;
    }


    if (selectedModel.value.indexOf('web-llm') !== -1) {
        await sendBrowserModelMessage(messageText);
        streamedMessageText.value = "";
        return;
    }

    await sendGPTMessage(messageText);

    streamedMessageText.value = "";
}

async function sendBrowserModelMessage(message) {


    userText.value = "";

    streamedMessageText.value = "";
    isLoading.value = true;

    let response = await sendBrowserLoadedModelMessage(messages.value, updateUI);

    isLoading.value = false;

    addMessage('assistant', response);

    await saveMessages();
}

async function addMessage(role, message) {
    setSystemPrompt(systemPrompt.value);

    // Find the highest existing message ID in the messages array
    const maxId = messages.value.reduce((max, message) => Math.max(max, message.id), 0);

    // Increment the maximum found ID for the new message
    const newMessageId = maxId + 1;

    // Push the new message with the incremented ID
    messages.value.push({
        id: newMessageId,
        role: role,
        content: message
    });
}


async function sendGPTMessage(message) {
    userText.value = "";

    streamedMessageText.value = "";
    isLoading.value = true;

    try {
        abortController.value = new AbortController();
        let response;

        if (selectedModel.value.indexOf("open-ai-format") !== -1) {

            localModelName.value = localStorage.getItem('localModelName') || '';
            localSliderValue.value = localStorage.getItem('local-attitude') || 0.6;
            localModelEndpoint.value = localStorage.getItem('localModelEndpoint') || '';

            response = await fetchLocalModelResponseStream(messages.value, localSliderValue.value, localModelName.value, localModelEndpoint.value, updateUI, abortController.value, streamedMessageText);
        }
        else {
            response = await fetchGPTResponseStream(messages.value, sliderValue.value, selectedModel.value, updateUI, abortController.value, streamedMessageText);
        }

        isLoading.value = false;

        addMessage('assistant', response);

        await saveMessages();


    } catch (error) {
        console.error("Error sending message:", error);
    }
}

async function sendClaudeMessage(messageText) {
    if (messageText.toLowerCase().startsWith("vision::")) {
        addMessage("user", messageText);

        isAnalyzingImage.value = true;

        document.getElementById('imageInput').click();


        return;
    }

    streamedMessageText.value = "";
    isClaudeEnabled.value = true;
    isLoading.value = true;

    abortController.value = new AbortController();

    addMessage("user", messageText);

    const response = await streamClaudeResponse(messages.value.slice(0), selectedModel.value, claudeSliderValue.value, updateUI, abortController.value, streamedMessageText);

    addMessage("assistant", response);

    saveMessages();

    isLoading.value = false;
}

async function regenerateMessageReponse(content) {
    isLoading.value = true;

    setSystemPrompt(systemPrompt.value);

    const messageIndex = messages.value.findIndex(message => message.content === content && message.role === 'user');

    if (messageIndex !== -1) {
        streamedMessageText.value = "";

        const regenMessages = messages.value.slice(0, messageIndex + 1);
        const messagesAfter = messages.value.slice(messageIndex + 2); // This line remains the same
        abortController.value = new AbortController();

        // Assign messages.value to regenMessages before regenerating the response
        messages.value = regenMessages;

        let response = "";

        if (selectedModel.value.indexOf("gpt") !== -1) {
            response = await fetchGPTResponseStream(regenMessages, sliderValue.value, selectedModel.value, updateUI, abortController.value, streamedMessageText, false);
        }
        else if (selectedModel.value.indexOf("web-llm") !== -1) {
            response = await sendBrowserLoadedModelMessage(regenMessages, updateUI);
        }
        else if (isClaudeEnabled.value) {
            response = await streamClaudeResponse(regenMessages, selectedModel.value, claudeSliderValue.value, updateUI, abortController.value, streamedMessageText, false);
        }
        else {
            response = await fetchLocalModelResponseStream(regenMessages, localSliderValue.value, localModelName.value, localModelEndpoint.value, updateUI, abortController.value, streamedMessageText, false);
        }

        addMessage("assistant", response);

        messages.value[messageIndex + 1].content = response;

        // Append messagesAfter to the current messages value
        messages.value = [...messages.value, ...messagesAfter];

        saveMessages();

    }
    isLoading.value = false;
}

async function EditPreviousMessage(oldContent, newContent) {
    isLoading.value = true;
    const messageIndex = messages.value.findIndex(message => message.content === oldContent.content && message.role === 'user');

    if (messageIndex !== -1) {
        streamedMessageText.value = "";

        const regenMessages = messages.value.slice(0, messageIndex + 1);
        const messagesAfter = messages.value.slice(messageIndex + 2); // This line remains the same
        abortController.value = new AbortController();

        // Replace the last message content property in regenMessages with the value of userText
        regenMessages[regenMessages.length - 1].content = newContent;

        // Assign messages.value to regenMessages before regenerating the response
        messages.value = regenMessages;

        let response = "";

        if (selectedModel.value.indexOf("gpt") !== -1) {
            response = await fetchGPTResponseStream(regenMessages, sliderValue.value, selectedModel.value, updateUI, abortController.value, streamedMessageText, false);
        }
        else if (isClaudeEnabled.value) {
            response = await streamClaudeResponse(regenMessages, selectedModel.value, claudeSliderValue.value, updateUI, abortController.value, streamedMessageText, false);
        }
        else {
            response = await fetchLocalModelResponseStream(regenMessages, localSliderValue.value, localModelName.value, localModelEndpoint.value, updateUI, abortController.value, streamedMessageText, false);
        }

        addMessage("assistant", response);

        messages.value[messageIndex + 1].content = response;

        // Append messagesAfter to the current messages value
        messages.value = [...messages.value, ...messagesAfter];

        saveMessages();
    }
    isLoading.value = false;
}


async function deleteMessageFromHistory(content) {
    const messageIndex = messages.value.findIndex(message => message.content === content && message.role === 'user');

    if (messageIndex !== -1) {
        streamedMessageText.value = "";

        const beforeMessages = messages.value.slice(0, messageIndex);
        const messagesAfter = messages.value.slice(messageIndex + 2); // This line remains the same

        messages.value = [...beforeMessages, ...messagesAfter];

        saveMessages();
    }
}

async function sendImagePrompt(imagePrompt) {
    isGeneratingImage.value = true;
    streamedMessageText.value = "";

    userText.value = "";

    const response = await generateDALLEImage(imagePrompt.toLowerCase().split("image::")[1]);

    let imageURLStrings = `${imagePrompt.toLowerCase().split("image::")[1]} \n\n`;

    for (const image of response.data) {
        imageURLStrings += `![${imagePrompt.toLowerCase().split("image::")[1]}](${image.url}) \n`;
    }

    addMessage('assistant', imageURLStrings);
    saveMessages();

    isGeneratingImage.value = false;
}

async function sendVisionPrompt(message) {
    isAnalyzingImage.value = true;
    streamedMessageText.value = "";

    document.getElementById('imageInput').click();



    userText.value = "";
}
//#endregion

//#region Image Processing
function importFileClick() {
    document.getElementById('fileImportUpload').click();
}


async function imageInputChanged(event) {
    const file = event.target.files[0];
    const fileType = file.type;

    if (!file) {
        return;
    }

    let visionReponse = await processImage(file, fileType);

    addMessage("assistant", visionReponse);

    saveMessages();
    isAnalyzingImage.value = false;

}

async function processImage(file, fileType) {
    userText.value = "";

    return await analyzeImage(file, fileType, messages.value.slice(0), selectedModel.value, localModelName.value, localModelEndpoint.value);
}

async function visionimageUploadClick() {
    if (userText.value.trim().length === 0) {
        showToast("Please Enter a Prompt First");
        return;
    }

    userText.value = 'vision:: ' + userText.value;
    await sendMessage();
};


//#endregion

//#region File/Upload Handling
async function uploadFileContentsToCoversation(event, element) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const contents = e.target.result;

        if (file.type.startsWith('image/')) {
            showToast("Cannot add images to context currently.");
            // // The uploaded file is an image
            // addMessage('user', userText.value);
            // addMessage('assistant', "The uploaded file is an image. Processing the image...");

            // // Process the image and generate a response
            // const visionResponse = await processImage(file, file.type);
            // addMessage("assistant", visionResponse);
        } else {
            // The uploaded file is not an image
            addMessage('user', userText.value + " " + contents);
            addMessage('assistant', "Context added");
            showToast("Context Added");
        }

        saveMessages();

    };

    await reader.readAsText(file);
}


function uploadFile(event, element) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const contents = e.target.result;

        try {
            const parsedContents = JSON.parse(contents);

            if (!parsedContents.some(item => item.id)) {
                console.log("Invalid file format");
                return;
            }

            localStorage.setItem("gpt-conversations", contents);
            conversations.value = loadConversationTitles();
            storedConversations.value = loadStoredConversations();

            const lastConversationIndex = conversations.value.length - 1;
            selectedConversation.value = conversations.value[lastConversationIndex];
            loadSelectedConversation();

            showConversationOptions.value = true;
        } catch (err) {
            console.log("Bad file detected");
        }
    };

    reader.readAsText(file);
}

function openFileSelector() {
    document.getElementById('fileUpload').click();
}

function openFileImportSelector() {
    document.getElementById('fileImportUpload').click();
}
//#endregion

//#region Swipe Events
function swipedLeft(event) {
    isSidebarOpen.value = false;
    showConversationOptions.value = !showConversationOptions.value;
}

function swipedRight(event) {
    showConversationOptions.value = false;
    isSidebarOpen.value = !isSidebarOpen.value;
}
//#endregion

//#region Floating Scroll Button
function updateScrollButtonVisibility() {
    const messagesElement = messagesContainer.querySelectorAll('.message');
    if (messagesElement.length > 0) {
        const lastMessage = messagesElement[messagesElement.length - 1];

        if (!isScrollable(messagesContainer)) {
            shouldShowScrollButton.value = false;
            return;
        }

        // Calculate the bottom position of the last message relative to the container
        const lastMessageBottom = lastMessage.offsetTop + lastMessage.offsetHeight;
        const scrollBottom = messagesContainer.scrollTop + messagesContainer.offsetHeight;

        // Determine if the scroll position is within 20% of the bottom of the container
        const threshold = messagesContainer.scrollHeight - (messagesContainer.offsetHeight * 0.2);

        if (lastMessageBottom > messagesContainer.offsetHeight && scrollBottom < threshold) {
            shouldShowScrollButton.value = true;
        } else {
            shouldShowScrollButton.value = false;
        }
    }
}

function isScrollable(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}
//#endregion

//#region Utils
const refs = {
    selectedModel,
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
    maxTokens,
    top_P,
    repetitionPenalty,
    browserModelSelection,
    localModelKey,
    systemPrompt
};
// Event handlers for updating the parent's state when the child emits an update
const updateSetting = (field, value) => {
    if (field in refs) {
        refs[field].value = value;
    }
};

function abortStream() {

    if (engine !== undefined && selectedModel.value.indexOf("web-llm") !== -1) {
        engine.interruptGenerate();
        showToast("Aborted response stream");
        return;
    }

    if (abortController.value) {
        abortController.value.abort();
        abortController.value = null;
        isLoading.value = false;
    }
}

//#endregion

//#region Global Click Handling
function handleGlobalClick(event) {
    const settingsDialogElement = document.getElementById('settings-dialog');
    const conversationsDialogElement = document.getElementById('conversations-dialog');

    if (settingsDialogElement && !settingsDialogElement.contains(event.target) && isSidebarOpen.value) {
        isSidebarOpen.value = false;
    }
    if (conversationsDialogElement && !conversationsDialogElement.contains(event.target) && showConversationOptions.value) {
        showConversationOptions.value = false;
    }
}

const sidebarContentContainer = ref(null);
const initialWidth = ref(0);
const initialMouseX = ref(0);

function handleDoubleClick() {
    const currentWidth = sidebarContentContainer.value.offsetWidth;
    if (currentWidth === 0) {
        sidebarContentContainer.value.style.width = '420px';
    } else {
        sidebarContentContainer.value.style.width = '0px';
    }
}

function startResize(event) {
    initialWidth.value = sidebarContentContainer.value.offsetWidth;
    initialMouseX.value = event.clientX;
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
}

function resize(event) {
    const deltaX = event.clientX - initialMouseX.value;
    sidebarContentContainer.value.style.width = `${initialWidth.value + deltaX}px`;
}

function stopResize() {
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
}

async function editConversationTitle(oldConversation, newConversationTitle) {
    const conversationIndex = conversations.value.findIndex(
        (conversation) => conversation.id === oldConversation.id
    );

    if (conversationIndex !== -1) {
        conversations.value[conversationIndex].conversation.title = newConversationTitle;

        const storedConversationIndex = storedConversations.value.findIndex(
            (conversation) => conversation.id === oldConversation.id
        );

        if (storedConversationIndex !== -1) {
            storedConversations.value[storedConversationIndex].conversation.title = newConversationTitle;
            localStorage.setItem("gpt-conversations", JSON.stringify(storedConversations.value));
        }

        showToast("Title Updated");
        return;
    }

    showToast("Failed to update title");
}

async function onModelChange(newModel) {
    console.log(newModel);
    selectedModel.value = newModel;
}

onUnmounted(() => {
    document.removeEventListener('click', handleGlobalClick);
});
//#endregion

onMounted(() => {
    sidebarContentContainer.value = document.querySelector(".sidebar-conversations");
    sidebarContentContainer.value.style.width = '420px';
    selectedModel.value = localStorage.getItem("selectedModel") || "gpt-4-turbo";
    determineModelDisplayName(selectedModel.value);
    selectConversation(lastLoadedConversationId.value);

    messagesContainer = document.querySelector('.messages');
    messagesContainer.addEventListener('scroll', updateScrollButtonVisibility);
    document.addEventListener('click', handleGlobalClick);
});
</script>

<template>
    <!-- File Upload -->
    <div id="fileUploadDiv">
        <input type="file" id="fileUpload" style="display: none;" @change="uploadFile">
        <input type="file" id="fileImportUpload" style="display: none;" @change="uploadFileContentsToCoversation">
        <div @click="openFileSelector" style="display: none;">Upload File</div>
        <div @click="openFileImportSelector" style="display: none;">Import File</div>
        <input id="imageInput" @change="imageInputChanged" style="display: none;" type="file">
    </div>
    <div class="app-body">
        <!-- App Container -->
        <div class="app-container" id="app-container">
            <!-- Overlay for dimming effect -->
            <div class="overlay" v-show="isSidebarOpen || showConversationOptions"></div>

            <!-- Settings Sidebar -->
            <div class="sidebar-common sidebar-left box" id="settings-dialog" :class="{ open: isSidebarOpen }">
                <settingsDialog :isSidebarOpen="isSidebarOpen" :selectedModel="selectedModel"
                    :localModelName="localModelName" :localModelEndpoint="localModelEndpoint"
                    :localSliderValue="localSliderValue" :gptKey="gptKey" :sliderValue="sliderValue"
                    :claudeKey="claudeKey" :claudeSliderValue="claudeSliderValue"
                    :browserModelSelection="browserModelSelection" :selectedDallEImageCount="selectedDallEImageCount"
                    :selectedDallEImageResolution="selectedDallEImageResolution"
                    :selectedAutoSaveOption="selectedAutoSaveOption" :maxTokens="maxTokens" :top_P="top_P"
                    :repetitionPenalty="repetitionPenalty" :localModelKey="localModelKey" :systemPrompt="systemPrompt"
                    @update:systemPrompt="updateSetting('systemPrompt', $event)"
                    @update:maxTokens="updateSetting('maxTokens', $event)"
                    @update:browserModelSelection="updateSetting('browserModelSelection', $event)"
                    @update:repetitionPenalty="updateSetting('repetitionPenalty', $event)"
                    @update:top_P="updateSetting('top_P', $event)"
                    @update:model="updateSetting('selectedModel', $event)"
                    @update:localModelName="updateSetting('localModelName', $event)"
                    @update:localModelEndpoint="updateSetting('localModelEndpoint', $event)"
                    @update:localModelKey="updateSetting('localModelKey', $event)"
                    @update:localSliderValue="updateSetting('localSliderValue', $event)"
                    @update:gptKey="updateSetting('gptKey', $event)"
                    @update:sliderValue="updateSetting('sliderValue', $event)"
                    @update:claudeKey="updateSetting('claudeKey', $event)"
                    @update:claudeSliderValue="updateSetting('claudeSliderValue', $event)"
                    @update:selectedDallEImageCount="updateSetting('selectedDallEImageCount', $event)"
                    @update:selectedDallEImageResolution="updateSetting('selectedDallEImageResolution', $event)"
                    @update:selectedAutoSaveOption="updateSetting('selectedAutoSaveOption', $event)"
                    @toggle-sidebar="toggleSidebar" />
            </div>
            <!-- Conversations Sidebar -->
            <div class="sidebar-conversations sidebar-right box" id="conversations-dialog"
                :class="{ 'open': showConversationOptions }">
                <conversationsDialog :isSidebarOpen="isSidebarOpen" :conversations="conversations"
                    @toggle-sidebar="showConversations" @load-conversation="loadSelectedConversation"
                    :selectedConversationItem="selectedConversation" @new-conversation="clearMessages"
                    @edit-conversation-title="editConversationTitle" @import-conversations="handleImportConversations"
                    @export-conversations="handleExportConversations" @purge-conversations="handlePurgeConversations"
                    @delete-current-conversation="deleteCurrentConversation" @open-settings="toggleSidebar"
                    :showConversationOptions="showConversationOptions" />
                <div id="resize-handle" class="resize-handle" @mousedown="startResize" @dblclick="handleDoubleClick">
                </div>
            </div>
            <div class="chat-container">
                <div class="container">
                    <div class="chat">
                        <!-- Header -->
                        <chatHeader :selectedModel="selectedModel" :isSidebarOpen="isSidebarOpen"
                            :storedConversations="storedConversations" @toggle-sidebar="toggleSidebar"
                            @delete-conversation="deleteCurrentConversation" @toggle-conversations="showConversations"
                            @new-conversation="clearMessages" @change-model="onModelChange" />
                        <!-- Messages -->
                        <div class="messages">
                            <messageItem :hasFilterText="hasFilterText" :messages="messages" :isLoading="isLoading"
                                :isClaudeEnabled="isClaudeEnabled" :isUsingLocalModel="isUsingLocalModel"
                                :isAnalyzingImage="isAnalyzingImage" :streamedMessageText="streamedMessageText"
                                :isGeneratingImage="isGeneratingImage" :modelDisplayName="modelDisplayName"
                                @regenerate-response="regenerateMessageReponse"
                                @delete-response="deleteMessageFromHistory" @edit-message="EditPreviousMessage" />
                        </div>
                        <!-- Floating button to quick scroll to the bottom of the page -->
                        <div class="floating-button scroll" id="scroll-button" @click="null"
                            :class="{ show: shouldShowScrollButton }">
                            <span>
                                <ChevronDown :strokeWidth="3" />
                            </span>

                        </div>
                        <!-- User Input -->
                        <chatInput :userInput="userText" :isLoading="isLoading" @abort-stream="abortStream"
                            @send-message="sendMessage" @vision-prompt="visionimageUploadClick"
                            @upload-context="importFileClick" @update:userInput="updateUserText"
                            @swipe-left="swipedLeft" @swipe-right="swipedRight" />
                    </div>
                </div>
            </div>
            <!-- Chat content goes here -->
        </div>
    </div>
</template>

<style lang="scss">
$icon-color: rgb(187, 187, 187);

.app-body {
    z-index: 0;
    width: 100vw;
    height: 90vh;
    position: relative;
    max-height: 90vh;
}



@font-face {
    font-family: Roboto-Regular;
    src: url('/src/assets/webfonts/Roboto-Regular.ttf');
    font-weight: 400;
    font-style: normal;
}

body {
    font-family: Roboto-Regular, sans-serif;
    margin: 0;
    padding: 0;
    position: relative;
    background-color: #1c1c1e;
    color: #f0f0f0;
    z-index: -1;
}

.container {
    display: flex;
    justify-content: center;
    align-items: center;
}

a {
    color: rgb(173, 167, 167);

    &:hover,
    &:focus,
    &:active,
    &:visited {
        color: rgb(187, 187, 187);
    }
}

.chat {
    // border: 1px solid #444;
    width: 99dvw;
    background-color: #181818;
    height: 98dvh;

    &.header {
        background-color: #444;
        padding: 10px;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
    }

    &.api-key {
        display: flex;
    }
}


.messages {
    overflow-y: auto;
    overflow-x: hidden;
    padding: 3px;
    position: relative;
    max-height: 88dvh;
    min-height: 80vh;
    scrollbar-width: none;
    /* For Firefox */
    -ms-overflow-style: none;
    /* For Internet Explorer and Edge */
}

.messages::-webkit-scrollbar {
    /* For Chrome, Safari, and Opera */
    display: none;
}

#user-search-input {
    flex-grow: 1;
    z-index: 9999;
    border: 1px solid #444;
    outline: none;
    background-color: #1c1c1e;
    font-size: 18px;
    color: #f0f0f0;
    width: inherit;
    resize: vertical;
    overflow: auto;
    white-space: pre-wrap;
    min-height: 30px;
    border-radius: 30px;
    transition: 0.2s height ease-in-out;
    padding: 14px;
    padding-top: 20px;
}


button {
    border: 1px solid #444;
    background-color: #3a3a3c;
    color: #f0f0f0;
    cursor: pointer;
    outline: none;

    &:hover {
        background-color: #4a4a4c;
    }
}

.hover-increase-size {
    transition: background-color 0.3s ease, transform 0.1s ease;

    &:hover {
        transform: scale(1.20);
    }
}



.floating-button {
    border: 1px solid #444;
    background: transparent;
    border: none;
    cursor: pointer;
    outline: none;
    color: $icon-color;
    position: fixed;
    min-height: 50px;
    border: none;
    top: 130px;
    display: grid;
    align-content: center;
    right: 7px;
    z-index: 99999;
    border-radius: 30px;
    min-width: 54px;
    opacity: 0.5;
    justify-content: space-around;
    transition: opacity 0.1s ease-in-out;

    &.scroll {
        top: 76vh;
        opacity: 0;

        &.show {
            opacity: 1;
        }
    }


    &:hover {
        opacity: 1;
    }
}

.floating-search-field {
    border: 1px solid #444;
    background-color: #2f2f31;
    cursor: pointer;
    outline: none;
    color: #433944;
    position: fixed;
    min-height: 0px;
    top: 130px;
    display: grid;
    align-content: center;
    right: 82px;
    width: 0px;
    border-radius: 30px;
    min-width: 0px;
    z-index: -5;
    justify-content: space-around;
    transition: width 0.25s ease-in-out;

    &.show {
        z-index: 99999;
        width: 70vw;
    }
}

pre {
    background-color: #212426 !important;
    color: #d8d8d8 !important;
    padding: 10px;
    border-radius: 12px;
    max-width: 98vw;
    overflow: auto;

    code {
        max-width: 97vw;
    }
}

.app-container {
    position: relative; // Add relative positioning
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1px;
    border-radius: 8px;
    z-index: -1;

}

.general-processing {
    display: contents;
    position: relative;
}

// For Webkit-based browsers (Chrome, Safari)
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #665067;
}

::-webkit-scrollbar-thumb {
    background: #4f3d50;
}

::-webkit-scrollbar-thumb:hover {
    background: #5d455e;
}

.resize-handle {
    position: absolute;
    top: 0;
    right: 0px;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    background-color: #274d683b;
    z-index: 1000;
    max-width: 100%;
}

.sidebar-conversations {
    background-color: #0a1e24;
    min-width: 0px;
    max-width: 100%;
    position: inherit;
    width: 100%;
    top: 0;
    left: 0;
    transform: translateX(-3px);
    transition: transform 0.1s ease-in-out;
    z-index: 100000;
    overflow: hidden;
    padding-left: 6px;
    padding-right: 6px;

    /* Add these lines */
    height: calc(100vh - 2 * 6px);
    /* Subtract double padding */
    box-sizing: border-box;

    @media (max-width: 600px) {
        position: fixed;
        transform: translateX(110%);
        border-right: 2px solid #3d3c3e;

        width: 100%;

        &.open {
            transform: translateX(1%);
        }
    }
}

// Common styles for both sidebars
.sidebar-common {
    background-color: #0a1e24;
    width: 28vw; // Adjust the width as needed
    min-width: 25vw;
    max-width: 100%; // Ensure it doesn't exceed the screen width
    height: 100vh; // Full height
    position: fixed; // Fixed position to stay in place
    top: 0; // Align to the top
    transform: translateX(-100%); // Start hidden (default left)
    transition: transform 0.1s ease-in-out; // Smooth transition for sliding in and out
    z-index: 100001; // Ensure it's above other content
    overflow-y: auto; // Allow scrolling if content is too long
    border-right: 2px solid #3d3c3e; // Optional border for styling
    padding-left: 6px;
    padding-right: 6px;

    &.open {
        transform: translateX(0); // Move into view when open
    }

    @media (max-width: 600px) {
        width: 100vw; // Full width on smaller screens
    }

    // Specific styles for right sidebar
    .sidebar-right {
        right: 0; // Align to the right side
        transform: translateX(100%); // Start hidden to the right
    }
}

// Specific styles for left sidebar
.sidebar-left {
    left: 0; // Align to the left side
}



.sidebar::-webkit-scrollbar {
    /* For Chrome, Safari, and Opera */
    display: none;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(15, 15, 15, 0.5); // Semi-transparent black
    z-index: 99999; // Ensure it's below the sidebar but above other content
    transition: opacity 0.3s ease-in-out;
    display: block;
}

// Hide the overlay when not needed
.overlay:not(:empty) {
    display: none;
}

@keyframes delayZIndex {
    0% {
        z-index: -1;
    }

    100% {
        z-index: 9999;
    }
}



.chat-container {
    position: relative; // Add relative positioning
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 500px;
    min-width: 350px;
    //border: 1px solid #444;
    border-radius: 4px;
    width: 100vw;
    max-width: 100vw;
    background-color: #1d1d1d;
    justify-content: space-between;
}


.chat {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 90vh;
    min-width: 350px;
    max-width: 100vw;
    width: 50%;
    background-color: #1d1d1d;
    justify-content: space-between;
}
</style>
