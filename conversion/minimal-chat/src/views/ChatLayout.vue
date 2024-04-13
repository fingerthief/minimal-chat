<!-- eslint-disable no-unused-vars -->

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import messageItem from '@/components/message-item.vue';
import chatInput from '@/components/chat-input.vue';
import chatHeader from '@/components/chat-header.vue';
import settingsDialog from '@/components/settings-dialog.vue';
import conversationsDialog from '@/components/conversations-dialog.vue';

const isProcessing = ref(false);
const hasFilterText = ref(false);
const selectedModel = ref(localStorage.getItem("selectedModel") || "");
const isSidebarOpen = ref(false);
const showConversationOptions = ref(false);
const messages = ref([]);

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

// Watchers that update local storage when values change
watch(selectedModel, (newValue) => {
    console.log("hit watcher: " + newValue);
    if (newValue.startsWith("lmstudio")) {
        localStorage.setItem('useLocalModel', true);
    }
    else {
        localStorage.setItem('useLocalModel', false);
    }

    localStorage.setItem('selectedModel', newValue);
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


// Reactive state for user input
const userText = ref('');

// Method to update user input based on child component's emitted value
const updateUserText = (newText) => {
    userText.value = newText;
};

function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
}

function handleDeleteConversation() {
    console.log('Conversation deleted');
}

function handleClearMessages() {
    console.log('Messages cleared');
}

function showConversations() {
    showConversationOptions.value = !showConversationOptions.value;
}

function sendMessage(event) {
    // TODO: Implement send message logic
    console.log('Sending message:', userText.value);
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

const handleLoadConversation = (conversation) => {
    // Logic to load selected conversation
};

const handleNewConversation = () => {
    // Logic to handle new conversation creation
};

const handleImportConversations = () => {
    // Logic to import conversations
};

const handleExportConversations = () => {
    // Logic to export conversations
};

const handlePurgeConversations = () => {
    // Logic to purge all conversations
};

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

onMounted(() => {
    // Initialization code here
    messages.value.push({
        role: "user",
        content: "Hello"
    });

    messages.value.push({
        role: "assistant",
        content: "Greetings"
    });
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
                    @toggle-sidebar="showConversations" @load-conversation="handleLoadConversation"
                    @new-conversation="handleNewConversation" @import-conversations="handleImportConversations"
                    @export-conversations="handleExportConversations" @purge-conversations="handlePurgeConversations" />
            </div>
            <div class="chat-container">
                <div class="container">
                    <div class="chat">
                        <chatHeader :selectedModel="selectedModel" :isSidebarOpen="isSidebarOpen"
                            @toggle-sidebar="toggleSidebar" @toggle-conversations="showConversations" />
                        <!-- Messages -->
                        <div class="messages" id="messagesContainer">
                            <div v-for="(message, index) in messages" :key="index">
                                <messageItem :role="message.role" :content="message.content"
                                    :hasFilterText="hasFilterText" :messages="messages" :index="index" />
                            </div>
                        </div>
                        <chatInput :userInput="userText" @update:userInput="updateUserText" />
                    </div>
                </div>
            </div>
            <!-- Chat content goes here -->
        </div>
    </div>
</template>


<style lang="scss" scoped>
@use "@fortawesome/fontawesome-free/scss/fontawesome.scss";
@use "@fortawesome/fontawesome-free/scss/solid.scss";
@use "@fortawesome/fontawesome-free/scss/regular.scss";
@use "@fortawesome/fontawesome-free/scss/brands.scss";

// $fa-font-path: "../webfonts";
$icon-color: rgb(187, 187, 187);

@font-face {
    font-family: 'Helvetica';
    src: url('/webfonts/Helvetica.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
}

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

.message {
    position: relative;
    padding-left: 8px;
    padding-right: 8px;
    border-radius: 12px;
    max-width: 85%;
    min-width: 8%;
    margin-bottom: 8px;
    clear: both;
    margin-top: 18px;
    font-size: 1em;
    line-height: 1.5;

    .copy-text {
        position: relative;
        display: inline-block;

        button {
            display: block;
            position: absolute;
            bottom: 10px;
            right: 10px;
        }

        &:hover {
            button {
                display: block;
                z-index: 9999;
            }
        }
    }

    pre {
        overflow: hidden;
        text-overflow: clip;
    }

    .label {
        position: absolute;
        top: -15px;
        color: #dadbde;
        font-size: 13px;
        min-width: 62px;
        font-weight: bold;
        padding: 2px 5px;
        border-radius: 5px;
    }

    &.user {
        float: right;
        background-color: #3d3144;
        color: #dadbde;

        border-right: 6px solid #614a63;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        margin-top: 40px;

        .label {
            border-radius: 8px;
            border-right: 6px solid #614a63;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            background-color: #3d3144;
            margin-top: -23px;
            overflow: hidden;
            right: -6px;
            min-width: 50px;
            padding: 6px;
        }
    }

    &.gpt {
        float: left;
        background-color: #4a424a;
        color: #dadbde;

        border-left: 6px solid #6a576c;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        margin-top: 40px;

        p {
            overflow: auto;
            text-overflow: clip;
        }

        .label {
            border-left: 6px solid #6a576c;
            background-color: #4a424a;
            left: 0px;
            color: #dadbde;
            border-radius: 8px;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            margin-top: -23px;
            left: -6px;
            padding: 6px;
            min-width: 54px;
            cursor: pointer;
            transition: opacity 0.2s ease-in-out;

            &:hover::before {
                content: 'Click to copy';
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #000;
                color: #fff;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.2s ease-in-out;
            }

            &:hover::after {
                content: "";
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 5px;
                border-style: solid;
                border-color: #000 transparent transparent transparent;
                opacity: 0;
                transition: opacity 0.2s ease-in-out;
            }

            &:hover::before,
            &:hover::after {
                opacity: 1;
            }
        }
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

$shadow-color: #252629;
$shadow-offset-x: 0px;
$shadow-offset-y: 1px;
$shadow-blur-radius: 2px;
$shadow-spread-radius: 0px;

.message-tag {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-right: 5px;
    margin-left: 5px;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 0.7em;
    font-weight: bold;
}

.message-container {
    display: flex;
    align-items: flex-end;
}

.message-container.user .message-tag {
    background-color: #0077ff;
    color: #fff;
}

.message-container.gpt .message-tag {
    background-color: #234b4a;
    color: #f0f0f0;
}

.loading {
    background-color: #3a3a3c;
    color: rgba(255, 255, 255, 0.7);
}

.loading::after {
    content: "";
    position: absolute;
    top: 0;
    left: -5px;
    border-width: 5px 5px 0 0;
    border-style: solid;
    border-color: transparent #3a3a3c;
}

.padded {
    padding: 10px;
}

@keyframes spinner {
    to {
        transform: rotate(360deg);
    }
}

.spinner {
    display: inline-block;
    width: 10px;
    color: lightskyblue;
    height: 10px;
    margin-left: 5px;
    border: 4px solid #3c8280;
    border-left-color: #1cdfd8;
    border-radius: 50%;
    animation: spinner 1s linear infinite;
}
</style>
