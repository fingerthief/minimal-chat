<!-- eslint-disable no-unused-vars -->

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { loadConversationTitles, loadStoredConversations, fetchGPTResponseStream } from '@/libs/gpt-api-access';
import { fetchClaudeConversationTitle, streamClaudeResponse } from '@/libs/claude-api-access';
import { fetchPalmConversationTitle } from '@/libs/palm-api-access';
import { getConversationTitleFromGPT } from '@/libs/utils';

import messageItem from '@/components/message-item.vue';
import chatInput from '@/components/chat-input.vue';
import chatHeader from '@/components/chat-header.vue';
import settingsDialog from '@/components/settings-dialog.vue';
import conversationsDialog from '@/components/conversations-dialog.vue';

//#region refs
const isAnalyzingImage = ref(false);
const userText = ref('');
const isLoading = ref(false);
const isPalmEnabled = ref(false);
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
const palmKey = ref(localStorage.getItem("palmKey") || '');
const palmSliderValue = ref(parseInt(localStorage.getItem("palm-attitude")) || 50);
const selectedAutoSaveOption = ref(localStorage.getItem("selectedAutoSaveOption") || true);

const conversations = ref(loadConversationTitles());
const conversationTitles = ref(loadConversationTitles());
const storedConversations = ref(loadStoredConversations());
const lastLoadedConversationId = ref(parseInt(localStorage.getItem("lastConversationId")) || 0);
const selectedConversation = ref(conversations.value[0]);
const displayConversations = computed(() => conversations);
//#endregion

//#region watchers
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
        isClaudeEnabled: false,
        isPalmEnabled: false
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
    else if (newValue.includes(MODEL_TYPES.BISON)) {
        useLocalModel = true;
        flags.isPalmEnabled = true;
    }

    // Apply settings
    try {
        localStorage.setItem('useLocalModel', useLocalModel);
        localStorage.setItem('selectedModel', newValue);
        isUsingLocalModel.value = flags.isUsingLocalModel;
        isClaudeEnabled.value = flags.isClaudeEnabled;
        isPalmEnabled.value = flags.isPalmEnabled;
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

watch(palmKey, (newValue) => {
    localStorage.setItem('palmKey', newValue);
});

watch(palmSliderValue, (newValue) => {
    localStorage.setItem('palmSliderValue', newValue);
});

watch(selectedAutoSaveOption, (newValue) => {
    localStorage.setItem('selectedAutoSaveOption', newValue);
});
//#endregion watchers


const updateUserText = (newText) => {
    userText.value = newText;
};

function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
}

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
    //showToast("Conversation Deleted");
}

function handleClearMessages() {
    console.log('Messages cleared');
}

function showConversations() {
    showConversationOptions.value = !showConversationOptions.value;
}

let lastMessageText;
async function sendMessage(event) {
    const messageText = userText.value.trim();

    if (userText.value.trim().length === 0) {
        // showToast("Please Enter a Prompt First");
        return;
    }

    lastMessageText = messageText;

    if (selectedModel.value.indexOf("bison") !== -1) {
        await sendPalmMessage(messageText);
        return;
    } else if (selectedModel.value.indexOf("claude") !== -1) {
        await sendClaudeMessage(messageText);
        return;
    }

    isPalmEnabled.value = false;
    isClaudeEnabled.value = false;
    addMessage("user", messageText);

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
    // self.scrollToBottom();

    userText.value = "";
    // self.userInput('');
    // userInput.value = '';
    // userInput.style.height = '30px';

    streamedMessageText.value = "";
    isLoading.value = true;

    try {
        let response;

        if (isUsingLocalModel.value) {

            localModelName.value = localStorage.getItem('localModelName') || '';
            localSliderValue.value = localStorage.getItem('local-attitude') || 50;
            localModelEndpoint.value = localStorage.getItem('localModelEndpoint') || '';

            //response = await fetchLocalModelResponseStream(self.messages(), self.localSliderValue(), self.localModelName(), self.localModelEndpoint(), updateUI);
        }
        else {
            response = await fetchGPTResponseStream(messages.value, sliderValue.value, selectedModel.value, updateUI);
        }

        isLoading.value = false;

        addMessage('assistant', response);

        await saveMessages();

        // self.scrollToBottom();
    } catch (error) {
        console.error("Error sending message:", error);
    }
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

    // showToast("Conversation Saved");
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
    } else {
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

    if (isPalmEnabled.value) {
        newConversationWithTitle.title = await fetchPalmConversationTitle(messages.value.slice(0));
    } else if (isClaudeEnabled.value) {
        newConversationWithTitle.title = await fetchClaudeConversationTitle(messages.value.slice(0));
    } else {
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

function resetMessages() {
    localStorage.removeItem("gpt-messages");
    messages.value = [];
    lastLoadedConversationId.value = null;
}

function updateUI(content, reset) {

    if (reset === true) {
        streamedMessageText.value = "";
        //self.scrollToBottom();
        return;
    }

    streamedMessageText.value = (streamedMessageText.value || "") + content;
    //self.scrollToBottom();
}

async function sendPalmMessage(message) {
}

async function sendClaudeMessage(messageText) {
    if (messageText.toLowerCase().startsWith("vision::")) {
        addMessage("user", messageText);

        isAnalyzingImage.value = true;

        //document.getElementById('imageInput').click();

        // this.scrollToBottom();
        return;
    }

    // this.userInput = "";
    // this.$refs.userInput.style.height = '30px';

    streamedMessageText.value = "";
    isClaudeEnabled.value = true;
    isLoading.value = true;

    addMessage("user", messageText);

    //this.scrollToBottom();

    const response = await streamClaudeResponse(messages.value.slice(0), selectedModel.value, claudeSliderValue.value, updateUI);

    addMessage("assistant", response);

    saveMessages();

    //this.scrollToBottom();
    isLoading.value = false;
}

async function sendImagePrompt(message) {
}

async function sendVisionPrompt(message) {
}


function visionImageUploadClick() {
    // TODO: Implement image upload logic
    console.log('Image upload clicked');
}

function autoResize(event) {
    // TODO: Implement auto resize logic
    console.log('Auto resizing input');
}

function swipedLeft(event) {
    // TODO: Implement swipe left logic
    console.log('Swiped left');
}

function swipedRight(event) {
    // TODO: Implement swipe right logic
    console.log('Swiped right');
}

function handleLoadConversation(conversation) {
    // Logic to load selected conversation
}

function handleNewConversation() {
    // Logic to handle new conversation creation
}

function handleImportConversations() {
    // Logic to import conversations
}

function handleExportConversations() {
    // Logic to export conversations
}

function handlePurgeConversations() {
}

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
    palmKey,
    palmSliderValue,
    selectedAutoSaveOption
};
// Event handlers for updating the parent's state when the child emits an update
const updateSetting = (field, value) => {
    if (field in refs) {
        refs[field].value = value;
    }
};

function selectConversation(conversationId) {
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

onMounted(() => {
    selectedModel.value = localStorage.getItem("selectedModel") || "";
    selectConversation(lastLoadedConversationId.value); //by index

});
</script>

<template>
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
                    :selectedDallEImageResolution="selectedDallEImageResolution" :palmKey="palmKey"
                    :palmSliderValue="palmSliderValue" :selectedAutoSaveOption="selectedAutoSaveOption"
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
                    @update:palmKey="updateSetting('palmKey', $event)"
                    @update:palmSliderValue="updateSetting('palmSliderValue', $event)"
                    @update:selectedAutoSaveOption="updateSetting('selectedAutoSaveOption', $event)"
                    @toggle-sidebar="toggleSidebar" />
            </div>
            <!-- Conversations Sidebar -->
            <div class="sidebar box" id="conversations-dialog" :class="{ open: showConversationOptions }">
                <conversationsDialog :isSidebarOpen="isSidebarOpen" :conversations="conversations"
                    @toggle-sidebar="showConversations" @load-conversation="loadSelectedConversation"
                    @new-conversation="handleNewConversation" @import-conversations="handleImportConversations"
                    @export-conversations="handleExportConversations" @purge-conversations="handlePurgeConversations" />
            </div>
            <div class="chat-container">
                <div class="container">
                    <div class="chat">
                        <chatHeader :selectedModel="selectedModel" :isSidebarOpen="isSidebarOpen"
                            :storedConversations="storedConversations" @toggle-sidebar="toggleSidebar"
                            @delete-conversation="deleteCurrentConversation" @toggle-conversations="showConversations"
                            @new-conversation="clearMessages" />
                        <!-- Messages -->
                        <div class="messages" id="messagesContainer">
                            <messageItem :hasFilterText="hasFilterText" :messages="messages" :isLoading="isLoading"
                                :isClaudeEnabled="isClaudeEnabled" :isUsingLocalModel="isUsingLocalModel"
                                :isPalmEnabled="isPalmEnabled" :streamedMessageText="streamedMessageText" />
                        </div>
                        <chatInput :userInput="userText" :isLoading="isLoading" @send-message="sendMessage"
                            @update:userInput="updateUserText" />
                    </div>
                </div>
            </div>
            <!-- Chat content goes here -->
        </div>
    </div>
</template>


<style lang="scss" scoped>
$icon-color: rgb(187, 187, 187);

.app-body {
    z-index: 0;
    width: 99vw;
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
    padding: 10px;
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




.hljs {
    background-color: #000000 !important;
    color: #d5d5d5 !important;
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
    width: 99dvw;
    max-width: 99dvw;
    background-color: #2c2c2e;
    justify-content: space-between;
}


.chat {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 90vh;
    min-width: 350px;
    max-width: 99dvw;
    border-top: 1px solid #444;
    width: 50%;
    background-color: #202124;
    justify-content: space-between;
}

.padded {
    padding: 10px;
}
</style>
