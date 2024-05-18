// ChatLayout.vue

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import { loadConversationTitles, loadStoredConversations, fetchGPTResponseStream, generateDALLEImage } from '@/libs/gpt-api-access';
import { fetchClaudeConversationTitle } from '@/libs/claude-api-access';
import { getConversationTitleFromGPT, showToast, removeAPIEndpoints } from '@/libs/utils';
import { analyzeImage } from '@/libs/image-analysis';
import { fetchLocalModelResponseStream, getConversationTitleFromLocalModel } from '@/libs/open-ai-api-standard-access';
import { getBrowserLoadedModelConversationTitle, engine, loadNewModel } from '@/libs/web-llm-access';
import {
    deleteConversation,
    handleExportConversations,
    setSystemPrompt,
    deleteMessageFromHistory,
    saveMessages,
    selectConversation,
    regenerateMessageResponse,
    editPreviousMessage as EditPreviousMessageValue,
    editConversationTitle as editConversationTitleInManagement
} from '@/libs/conversations-management';
import { sendMessage } from '@/libs/message-sending';
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
const hasFilterText = ref(false);
const selectedModel = ref(localStorage.getItem("selectedModel") || "gpt-4o");
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
const storedConversations = ref(loadStoredConversations());
const lastLoadedConversationId = ref(parseInt(localStorage.getItem("lastConversationId")) || 0);
const selectedConversation = ref(conversations.value[0]);
const abortController = ref(null);

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

    const modelSettings = {
        [MODEL_TYPES.OPEN_AI_FORMAT]: {
            useLocalModel: true,
            modelDisplayName: "Custom Model"
        },
        [MODEL_TYPES.CLAUDE]: {
            useLocalModel: false,
            modelDisplayName: "Claude"
        },
        [MODEL_TYPES.GPT]: {
            useLocalModel: false,
            modelDisplayName: "GPT"
        },
        [MODEL_TYPES.WEB_LLM]: {
            useLocalModel: false,
            modelDisplayName: "Local Browser Model"
        }
    };

    const defaultSettings = {
        useLocalModel: false,
        isUsingLocalModel: false,

        modelDisplayName: "Unknown"
    };

    const settings = Object.keys(MODEL_TYPES).reduce((acc, key) => {
        if (newValue.includes(MODEL_TYPES[key])) {
            return modelSettings[MODEL_TYPES[key]];
        }
        return acc;
    }, defaultSettings);

    if (settings.modelDisplayName !== "Local Browser Model") {
        unloadModel();
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

// Simple watchers
watchAndStore(localModelKey, 'localModelKey');
watchAndStore(systemPrompt, 'systemPrompt');
watchAndStore(maxTokens, 'maxTokens');
watchAndStore(top_P, 'top_P');
watchAndStore(repetitionPenalty, 'repetitionPenalty');
watchAndStore(localModelName, 'localModelName');
watchAndStore(localSliderValue, 'local-attitude');
watchAndStore(gptKey, 'gptKey');
watchAndStore(sliderValue, 'gpt-attitude');
watchAndStore(claudeKey, 'claudeKey');
watchAndStore(claudeSliderValue, 'claude-attitude');
watchAndStore(selectedDallEImageCount, 'selectedDallEImageCount');
watchAndStore(selectedDallEImageResolution, 'selectedDallEImageResolution');
watchAndStore(selectedAutoSaveOption, 'selectedAutoSaveOption');

// Watchers with transformations
watchAndStore(localModelEndpoint, 'localModelEndpoint', removeAPIEndpoints);

// Watcher with additional logic
watch(browserModelSelection, async (newValue) => {
    localStorage.setItem('browserModelSelection', newValue);
    modelDisplayName.value = newValue;
    isLoading.value = true;
    await loadNewModel(newValue, updateUI);
    isLoading.value = false;
});
//#endregion watchers

function unloadModel() {
    if (engine !== undefined) {
        engine.unload();
    }
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

function updateUI(content, autoScrollBottom = true, appendTextValue = true) {
    const lastMessage = messages.value[messages.value.length - 1];

    if (lastMessage && lastMessage.role === 'assistant') {
        if (!appendTextValue) {
            lastMessage.content = content;
            return;
        }

        lastMessage.content += content;
    } else {
        addMessage('assistant', content);
    }
}

function toggleSidebar() {
    event.stopPropagation();
    isSidebarOpen.value = !isSidebarOpen.value;
}
//#endregion

//#region Conversation Handling
function showConversations() {
    event.stopPropagation();
    showConversationOptions.value = !showConversationOptions.value;
}

function deleteCurrentConversation() {
    const updatedConversations = deleteConversation(conversations.value, lastLoadedConversationId.value);

    conversations.value = updatedConversations;

    messages.value = [];

    if (conversations.value.length > 0) {
        selectConversationHandler(conversations.value[conversations.value.length - 1].id);
    }

    localStorage.setItem("gpt-conversations", JSON.stringify(conversations.value));
}

async function saveMessagesHandler() {
    const result = await saveMessages(
        conversations.value,
        selectedConversation.value,
        messages.value,
        createNewConversationWithTitle,
        lastLoadedConversationId.value
    );

    conversations.value = result.conversations;
    messages.value = result.messages;
    selectedConversation.value = result.selectedConversation;
    lastLoadedConversationId.value = result.lastLoadedConversationId;
}

function selectConversationHandler(conversationId) {
    const result = selectConversation(
        conversations.value,
        conversationId,
        messages.value,
        lastLoadedConversationId.value,
        showToast
    );

    conversations.value = result.conversations;
    messages.value = result.messages;
    selectedConversation.value = result.selectedConversation;
    lastLoadedConversationId.value = result.lastLoadedConversationId;
    showConversationOptions.value = result.showConversationOptions;
}

async function startNewConversation() {
    selectedConversation.value = null;
    messages.value = [];

    showToast("Conversation Saved");
}

async function createNewConversationWithTitle() {
    if (selectedModel.value.indexOf("claude") !== -1) {
        return await fetchClaudeConversationTitle(messages.value.slice(0));
    }

    if (selectedModel.value.indexOf("open-ai-format") !== -1) {
        return await getConversationTitleFromLocalModel(messages.value.slice(0), localModelName.value, localModelEndpoint.value);
    }

    if (selectedModel.value.indexOf("gpt") !== -1) {
        return await getConversationTitleFromGPT(messages.value.slice(0), selectedModel.value, sliderValue.value);
    }

    if (selectedModel.value.indexOf("web-llm") !== -1) {
        return await getBrowserLoadedModelConversationTitle(messages.value.slice(0));
    }

    return "Error Generating Title";
}

function handleImportConversations() {
    openFileSelector();
}

function handlePurgeConversations() {
    localStorage.setItem("gpt-conversations", "");
    messages.value = [];
    conversations.value = [];
    storedConversations.value = [];
    showToast("All Conversations Deleted.");
}
//#endregion

//#region Messages Handling
async function addMessage(role, message) {
    setSystemPrompt(messages.value, systemPrompt.value);

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

function handleDeleteMessage(content) {
    messages.value = deleteMessageFromHistory(messages.value, content);
    saveMessagesHandler(); // Optionally save the updated messages
}

async function regenerateMessageResponseHandler(content) {
    isLoading.value = true;
    setSystemPrompt(messages.value, systemPrompt.value);

    const result = await regenerateMessageResponse(
        conversations.value,
        messages,
        content,
        sliderValue.value,
        selectedModel.value,
        localSliderValue.value,
        localModelName.value,
        localModelEndpoint.value,
        claudeSliderValue.value,
        updateUI,
        abortController,
        streamedMessageText
    );

    isLoading.value = false;
    messages.value = result.baseMessages;
    selectedConversation.value.messageHistory = messages.value;
    saveMessagesHandler();
}

async function EditPreviousMessage(oldContent, newContent) {
    isLoading.value = true;
    setSystemPrompt(messages.value, systemPrompt.value);

    const result = await EditPreviousMessageValue(
        conversations.value,
        messages,
        oldContent,
        newContent,
        sliderValue.value,
        selectedModel.value,
        localSliderValue.value,
        localModelName.value,
        localModelEndpoint.value,
        claudeSliderValue.value,
        updateUI,
        abortController,
        streamedMessageText
    );

    messages.value = [...result.baseMessages];
    selectedConversation.value.messageHistory = messages.value;
    isLoading.value = false;
    saveMessagesHandler();
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

    isLoading.value = true;

    let visionResponse = await processImage(file, fileType);

    addMessage("assistant", visionResponse);

    saveMessagesHandler();

    isLoading.value = false;
}

async function processImage(file, fileType) {
    userText.value = "";

    return await analyzeImage(file, fileType, messages.value, selectedModel.value, localModelName.value, localModelEndpoint.value);
}

async function visionimageUploadClick() {
    if (userText.value.trim().length === 0) {
        showToast("Please Enter a Prompt First");
        return;
    }

    userText.value = 'vision:: ' + userText.value;
    await sendMessage(null, userText.value, messages.value, selectedModel.value, claudeSliderValue.value, sliderValue.value, localModelName.value, localSliderValue.value, localModelEndpoint.value, updateUI, addMessage, saveMessagesHandler);
    //#endregion
}
//#region File/Upload Handling
async function uploadFileContentsToCoversation(event, element) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const contents = e.target.result;

        if (file.type.startsWith('image/')) {
            showToast("Cannot add images to context currently.");
        } else {
            // The uploaded file is not an image
            addMessage('user', userText.value + " " + contents);
            addMessage('assistant', "Context added");
            showToast("Context Added");
        }
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
                showToast("Error importing conversations");
                return;
            }

            localStorage.setItem('gpt-conversations', contents);
            conversations.value = parsedContents;
            selectConversationHandler(conversations.value[0].id);
            showToast("Import successful!");
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
    const updatedConversationsList = await editConversationTitleInManagement(conversations.value, oldConversation, newConversationTitle);

    if (updatedConversationsList) {
        conversations.value = updatedConversationsList;

        localStorage.setItem("gpt-conversations", JSON.stringify(conversations.value));

        showToast("Title Updated");

    } else {
        showToast("Failed to update title");
    }
}

async function onModelChange(newModel) {
    selectedModel.value = newModel;
}

onUnmounted(() => {
    document.removeEventListener('click', handleGlobalClick);
});

function convertConversations(oldConversations) {
    return oldConversations.map(oldConversation => ({
        id: oldConversation.id,
        title: oldConversation?.conversation?.title,
        messageHistory: oldConversation?.conversation?.messageHistory
    }));
}
//#endregion

onMounted(() => {

    //temporary converter so any users of the old conversation system will be auto
    //converted to the new conversation template. Will remove after a period of time.
    if (!localStorage.getItem('hasConvertedConversations')) {
        let oldConversationsStyle = loadConversationTitles();

        localStorage.setItem("gpt-conversations", JSON.stringify(convertConversations(oldConversationsStyle)));
        conversations.value = loadConversationTitles();

        localStorage.setItem('hasConvertedConversations', true);
    }

    sidebarContentContainer.value = document.querySelector(".sidebar-conversations");
    sidebarContentContainer.value.style.width = '420px';
    selectedModel.value = localStorage.getItem("selectedModel") || "gpt-4o";

    determineModelDisplayName(selectedModel.value);
    selectConversationHandler(lastLoadedConversationId.value || conversations.value[0]?.id);

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
            <div class="sidebar-common sidebar-left" id="settings-dialog" :class="{ open: isSidebarOpen }">
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
            <div class="sidebar-conversations sidebar-right" id="conversations-dialog"
                :class="{ 'open': showConversationOptions }">
                <conversationsDialog :isSidebarOpen="isSidebarOpen" :conversations="conversations"
                    @toggle-sidebar="showConversations" @load-conversation="selectConversationHandler"
                    :selectedConversationItem="selectedConversation" @new-conversation="startNewConversation"
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
                            @new-conversation="startNewConversation" @change-model="onModelChange" />
                        <!-- Messages -->
                        <div class="messages">
                            <messageItem :hasFilterText="hasFilterText" :messages="messages" :isLoading="isLoading"
                                :modelDisplayName="modelDisplayName"
                                @regenerate-response="regenerateMessageResponseHandler"
                                @delete-response="handleDeleteMessage" @edit-message="EditPreviousMessage" />
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
                            @send-message="async (event) => await sendMessage(event, userText, messages, selectedModel, claudeSliderValue, sliderValue, localModelName, localSliderValue, localModelEndpoint, updateUI, addMessage, saveMessagesHandler)"
                            @vision-prompt="visionimageUploadClick" @upload-context="importFileClick"
                            @update:userInput="updateUserText" @swipe-left="swipedLeft" @swipe-right="swipedRight" />
                    </div>
                </div>
            </div>
            <!-- Chat content goes here -->
        </div>
    </div>
</template>

<style lang="scss">
$icon-color: rgb(187, 187, 187);
$background-color: #1c1c1e;
$container-bg-color: #212121;
$sidebar-bg-color: #07161a;
$scrollbar-track-color: #665067;
$scrollbar-thumb-color: #4f3d50;
$scrollbar-thumb-hover-color: #5d455e;
$border-color: #444;
$hover-bg-color: #4a4a4c;
$button-bg-color: #3a3a3c;
$button-hover-bg-color: #4a4a4c;
$font-color: #f0f0f0;
$overlay-bg-color: rgba(15, 15, 15, 0.5);

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
    background-color: $background-color;
    color: $font-color;
}

a {
    color: rgb(173, 167, 167);

    &:hover,
    &:focus,
    &:active,
    &:visited {
        color: $icon-color;
    }
}

.app-body {
    width: 100vw;
    height: 90vh;
    position: relative;
    max-height: 90vh;
}

.container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.chat {
    width: 99dvw;
    background-color: $container-bg-color;
    height: 98dvh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &.header {
        background-color: $border-color;
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
    padding: 3px;
    min-height: 93vh;
    scrollbar-width: none; // For Firefox
    -ms-overflow-style: none; // For Internet Explorer and Edge

    &::-webkit-scrollbar {
        display: none; // For Chrome, Safari, and Opera
    }
}

#user-search-input {
    flex-grow: 1;
    border: 1px solid $border-color;
    background-color: $background-color;
    font-size: 18px;
    color: $font-color;
    width: inherit;
    resize: vertical;
    overflow: auto;
    white-space: pre-wrap;
    min-height: 30px;
    border-radius: 30px;
    transition: 0.2s height ease-in-out;
    padding: 14px 14px 14px 20px;
}

button {
    border: 1px solid $border-color;
    background-color: $button-bg-color;
    color: $font-color;
    cursor: pointer;

    &:hover {
        background-color: $button-hover-bg-color;
    }
}

.hover-increase-size {
    transition: background-color 0.3s ease, transform 0.1s ease;

    &:hover {
        transform: scale(1.20);
    }
}

.floating-button {
    border: 1px solid $border-color;
    background: transparent;
    cursor: pointer;
    color: $icon-color;
    position: fixed;
    min-height: 50px;
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
    border: 1px solid $border-color;
    background-color: #2f2f31;
    cursor: pointer;
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
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1px;
    border-radius: 8px;
}

.general-processing {
    display: contents;
}

::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: $scrollbar-track-color;
}

::-webkit-scrollbar-thumb {
    background: $scrollbar-thumb-color;

    &:hover {
        background: $scrollbar-thumb-hover-color;
    }
}

.resize-handle {
    position: absolute;
    top: 0;
    right: 0px;
    width: 3px;
    height: 100%;
    cursor: col-resize;
    background-color: #212121;
    z-index: 1000;
}

.sidebar-conversations,
.sidebar-common {
    background-color: $sidebar-bg-color;
    padding: 6px;
    overflow: hidden;
    transition: transform 0.1s ease-in-out;
    z-index: 0;

    &.open {
        transform: translateX(0);
    }

    @media (max-width: 600px) {
        position: fixed;
        width: 100vw;
    }
}

.sidebar-conversations {
    min-width: 0;
    max-width: 100%;
    position: inherit;
    height: 99vh;
    width: auto;
    transform: translateX(-3px);

    @media (max-width: 600px) {
        position: fixed;
        transform: translateX(110%);
        border-right: 2px solid $border-color;
        z-index: 1;
        width: 100vw;

        &.open {
            width: 100vw;
            height: 102vh;
        }
    }
}

.sidebar-common {
    width: 35vw;
    min-width: 25vw;
    max-width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    transform: translateX(-100%);
    border-right: 2px solid $border-color;
    z-index: 1;

    @media (max-width: 600px) {
        width: 100vw;
    }

    &.sidebar-right {
        right: 0;
        transform: translateX(100%);
    }
}

.sidebar-left {
    left: 0;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: $overlay-bg-color;
    z-index: 0;
    transition: opacity 0.3s ease-in-out;
    display: block;

    &:not(:empty) {
        display: none;
    }
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
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 500px;
    min-width: 350px;
    width: 100vw;
    max-width: 100vw;
    background-color: #1d1d1d;
    justify-content: space-between;
}
</style>
