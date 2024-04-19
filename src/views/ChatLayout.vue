<!-- eslint-disable no-unused-vars -->

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { loadConversationTitles, loadStoredConversations, fetchGPTResponseStream, generateDALLEImage } from '@/libs/gpt-api-access';
import { fetchClaudeConversationTitle, streamClaudeResponse } from '@/libs/claude-api-access';
import { getConversationTitleFromGPT, showToast } from '@/libs/utils';
import { analyzeImage } from '@/libs/image-analysis';
import { fetchLocalModelResponseStream } from '@/libs/local-model-access';

import messageItem from '@/components/message-item.vue';
import chatInput from '@/components/chat-input.vue';
import chatHeader from '@/components/chat-header.vue';
import settingsDialog from '@/components/settings-dialog.vue';
import conversationsDialog from '@/components/conversations-dialog.vue';

//#region Refs
const isAnalyzingImage = ref(false);
const userText = ref('');
const isLoading = ref(false);
const isClaudeEnabled = ref(false);
const isUsingLocalModel = ref(false);
const isGeneratingImage = ref(false);
const isProcessing = ref(false);
const hasFilterText = ref(false);
const selectedModel = ref("");
const isSidebarOpen = ref(false);
const showConversationOptions = ref(false);
const messages = ref([]);
const streamedMessageText = ref("");

const localModelName = ref(localStorage.getItem("localModelName") || '');
const localModelEndpoint = ref(localStorage.getItem("localModelEndpoint") || '');
const localSliderValue = ref(parseInt(localStorage.getItem("local-attitude")) || 50);
const gptKey = ref(localStorage.getItem("gptKey") || '');
const sliderValue = ref(parseInt(localStorage.getItem("gpt-attitude")) || 50);
const claudeKey = ref(localStorage.getItem("claudeKey") || '');
const claudeSliderValue = ref(parseInt(localStorage.getItem("claude-attitude")) || 50);
const selectedDallEImageCount = ref(parseInt(localStorage.getItem("selectedDallEImageCount")) || 1);
const selectedDallEImageResolution = ref(localStorage.getItem("selectedDallEImageResolution") || '256x256');
const selectedAutoSaveOption = ref(localStorage.getItem("selectedAutoSaveOption") || true);

const conversations = ref(loadConversationTitles());
const conversationTitles = ref(loadConversationTitles());
const storedConversations = ref(loadStoredConversations());
const lastLoadedConversationId = ref(parseInt(localStorage.getItem("lastConversationId")) || 0);
const selectedConversation = ref(conversations.value[0]);
const displayConversations = computed(() => conversations);
const messagesContainer = ref(null);
//#endregion

//#region Watchers
// Watchers that update local storage when values change
watch(selectedModel, (newValue) => {
    const MODEL_TYPES = {
        LMSTUDIO: 'lmstudio',
        CLAUDE: 'claude',
        BISON: 'bison'
    };

    // Default settings
    let useLocalModel = false;
    const flags = {
        isUsingLocalModel: false,
        isClaudeEnabled: false
    };

    // Determine settings based on model type
    if (newValue.includes(MODEL_TYPES.LMSTUDIO)) {
        useLocalModel = true;
        flags.isUsingLocalModel = true;
    }
    else if (newValue.includes(MODEL_TYPES.CLAUDE)) {
        useLocalModel = true;
        flags.isClaudeEnabled = true;
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

watch(localModelName, (newValue) => {
    localStorage.setItem('localModelName', newValue);
});

watch(localModelEndpoint, (newValue) => {
    localStorage.setItem('localModelEndpoint', newValue);
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

//#region UI Updates
function scrollToBottom() {
    const tempMessagesContainer = messagesContainer.value;

    if (tempMessagesContainer) {
        // Smooth scrolling
        tempMessagesContainer.scrollTo({
            top: tempMessagesContainer.scrollHeight,
            behavior: 'smooth',
        });

        // Fallback to ensure the container is scrolled to the bottom
        setTimeout(() => {
            tempMessagesContainer.scrollTo({
                top: tempMessagesContainer.scrollHeight,
            });
        }, 500); // Adjust the timeout duration as needed

        //this.updateScrollButtonVisibility();
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

function updateUI(content, reset) {

    if (reset === true) {
        streamedMessageText.value = "";
        scrollToBottom();
        return;
    }

    streamedMessageText.value = (streamedMessageText.value || "") + content;
    scrollToBottom();
}

function toggleSidebar() {
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
    showConversationOptions.value = !showConversationOptions.value;
}

async function saveMessages() {
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
    loadSelectedConversation();
}

async function createNewConversationWithTitle() {
    const newConversationWithTitle = {
        messageHistory: messages.value.slice(0),
        title: ""
    };

    if (isClaudeEnabled.value) {
        newConversationWithTitle.title = await fetchClaudeConversationTitle(messages.value.slice(0));
    }
    else {
        newConversationWithTitle.title = await getConversationTitleFromGPT(messages.value.slice(0), selectedModel.value, sliderValue.value);
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

    const selectedMessages = selectedConversation.value.conversation.messageHistory;
    messages.value = selectedMessages;
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

    await sendGPTMessage(messageText);
}

function addMessage(role, message) {
    messages.value.push({
        role: role,
        content: message
    });
}

async function sendGPTMessage(message) {
    scrollToBottom();

    userText.value = "";

    streamedMessageText.value = "";
    isLoading.value = true;

    try {
        let response;

        if (isUsingLocalModel.value) {

            localModelName.value = localStorage.getItem('localModelName') || '';
            localSliderValue.value = localStorage.getItem('local-attitude') || 50;
            localModelEndpoint.value = localStorage.getItem('localModelEndpoint') || '';

            response = await fetchLocalModelResponseStream(messages.value, localSliderValue.value, localModelName.value, localModelEndpoint.value, updateUI);
        }
        else {
            response = await fetchGPTResponseStream(messages.value, sliderValue.value, selectedModel.value, updateUI);
        }

        isLoading.value = false;

        addMessage('assistant', response);

        await saveMessages();

        scrollToBottom();
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

async function sendClaudeMessage(messageText) {
    if (messageText.toLowerCase().startsWith("vision::")) {
        addMessage("user", messageText);

        isAnalyzingImage.value = true;

        document.getElementById('imageInput').click();

        scrollToBottom();
        return;
    }

    streamedMessageText.value = "";
    isClaudeEnabled.value = true;
    isLoading.value = true;

    addMessage("user", messageText);

    scrollToBottom();

    const response = await streamClaudeResponse(messages.value.slice(0), selectedModel.value, claudeSliderValue.value, updateUI);

    addMessage("assistant", response);

    saveMessages();

    scrollToBottom();
    isLoading.value = false;
}

async function sendImagePrompt(imagePrompt) {
    isGeneratingImage.value = true;
    scrollToBottom();
    userText.value = "";

    const response = await generateDALLEImage(imagePrompt.toLowerCase().split("image::")[1]);
    let imageURLStrings = `${imagePrompt.toLowerCase().split("image::")[1]} \n\n`;
    for (const image of response.data) {
        imageURLStrings += `![${imagePrompt.toLowerCase().split("image::")[1]}](${image.url}) \n`;
    }

    addMessage('assistant', imageURLStrings);
    saveMessages();
    scrollToBottom();
    isGeneratingImage.value = false;
}

async function sendVisionPrompt(message) {
    isAnalyzingImage.value = true;

    document.getElementById('imageInput').click();

    scrollToBottom();

    userText.value = "";
}
//#endregion

//#region Image Processing
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
    scrollToBottom();
}

async function processImage(file, fileType) {
    userText.value = "";

    return await analyzeImage(file, fileType, messages.value.slice(0), selectedModel.value);
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
    selectedAutoSaveOption
};
// Event handlers for updating the parent's state when the child emits an update
const updateSetting = (field, value) => {
    if (field in refs) {
        refs[field].value = value;
    }
};

//#endregion

onMounted(() => {
    selectedModel.value = localStorage.getItem("selectedModel") || "gpt-4-turbo";
    selectConversation(lastLoadedConversationId.value); //by index
});
</script>

<template>
    <!-- File Upload -->
    <div id="fileUploadDiv">
        <input type="file" id="fileUpload" style="display: none;" @change="uploadFile">
        <div @click="openFileSelector" style="display: none;">Upload File</div>
        <input id="imageInput" @change="imageInputChanged" style="display: none;" type="file">
    </div>
    <div class="app-body">
        <!-- App Container -->
        <div class="app-container" id="app-container">
            <!-- Settings Sidebar -->
            <div class="sidebar box" id="settings-dialog" :class="{ open: isSidebarOpen }">
                <settingsDialog :isSidebarOpen="isSidebarOpen" :selectedModel="selectedModel"
                    :localModelName="localModelName" :localModelEndpoint="localModelEndpoint"
                    :localSliderValue="localSliderValue" :gptKey="gptKey" :sliderValue="sliderValue"
                    :claudeKey="claudeKey" :claudeSliderValue="claudeSliderValue"
                    :selectedDallEImageCount="selectedDallEImageCount"
                    :selectedDallEImageResolution="selectedDallEImageResolution"
                    :selectedAutoSaveOption="selectedAutoSaveOption"
                    @update:model="updateSetting('selectedModel', $event)"
                    @update:localModelName="updateSetting('localModelName', $event)"
                    @update:localModelEndpoint="updateSetting('localModelEndpoint', $event)"
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
            <div class="sidebar box" id="conversations-dialog" :class="{ open: showConversationOptions }">
                <conversationsDialog :isSidebarOpen="isSidebarOpen" :conversations="conversations"
                    @toggle-sidebar="showConversations" @load-conversation="loadSelectedConversation"
                    @new-conversation="clearMessages" @import-conversations="handleImportConversations"
                    @export-conversations="handleExportConversations" @purge-conversations="handlePurgeConversations" />
            </div>
            <div class="chat-container">
                <div class="container">
                    <div class="chat">
                        <!-- Header -->
                        <chatHeader :selectedModel="selectedModel" :isSidebarOpen="isSidebarOpen"
                            :storedConversations="storedConversations" @toggle-sidebar="toggleSidebar"
                            @delete-conversation="deleteCurrentConversation" @toggle-conversations="showConversations"
                            @new-conversation="clearMessages" />
                        <!-- Messages -->
                        <div class="messages" id="messagesContainer" ref="messagesContainer">
                            <messageItem :hasFilterText="hasFilterText" :messages="messages" :isLoading="isLoading"
                                :isClaudeEnabled="isClaudeEnabled" :isUsingLocalModel="isUsingLocalModel"
                                :isAnalyzingImage="isAnalyzingImage" :streamedMessageText="streamedMessageText"
                                :isGeneratingImage="isGeneratingImage" />
                        </div>
                        <!-- User Input -->
                        <chatInput :userInput="userText" :isLoading="isLoading" @send-message="sendMessage"
                            @vision-prompt="visionimageUploadClick" @update:userInput="updateUserText"
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

body {
    font-family: 'Helvetica';
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
    background-color: #2c2c2e;
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
    max-height: 96dvh;
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
    background-color: #2a3441;
    cursor: pointer;
    outline: none;
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
    background-color: #000 !important;
    background: #000 !important;
    color: #d8d8d8 !important;
    padding: 10px;
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

.sidebar {
    background-color: #262431;
    width: 90vw;
    max-width: 650px;
    border-radius: 8px;
    padding: 8px;
    border: 2px solid #3d3c3e;
    overflow: auto;
    max-height: 80vh;
    min-height: 80vh;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: absolute;

    opacity: 0;
    z-index: -1;
    transition: z-index 0.15s step-end, opacity 0.15s linear;
    justify-content: space-between;
    align-items: stretch;

    // For Firefox
    scrollbar-width: thin;
    scrollbar-color: #665067 #665067;

    .sidebar-content-container {
        overflow: auto;
        text-overflow: clip;
    }

    &.open {
        z-index: 99999999;
        opacity: 1;

        transition: z-index 0.15s step-start, opacity 0.15s linear;
    }

    .scrollable-list {
        height: 55vh;
        overflow: auto;


        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }

        li {
            padding: 10px;
            border-bottom: 1px solid #ddd;

            -webkit-user-select: none;
            /* Safari */
            -ms-user-select: none;
            /* IE 10 and IE 11 */
            user-select: none;
            /* Standard syntax */

            &:hover {
                background-color: #3d3346;
            }
        }
    }
}

.sidebar::-webkit-scrollbar {
    /* For Chrome, Safari, and Opera */
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
    background-color: #2c2c2e;
    justify-content: space-between;
}


.chat {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 90vh;
    min-width: 350px;
    max-width: 100vw;
    border-top: 1px solid #444;
    width: 50%;
    background-color: #202124;
    justify-content: space-between;
}
</style>