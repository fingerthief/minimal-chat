<!-- eslint-disable no-unused-vars -->

<script setup>
import { ref, onMounted, computed } from 'vue';
import messageItem from '@/components/message-item.vue';
import chatInput from '@/components/chat-input.vue';
import chatHeader from '@/components/chat-header.vue';

let isProcessing = ref(false);
let hasFilterText = ref(false);
let selectedModel = ref(localStorage.getItem("selectedModel") || "");


let messages = ref([]);

// Reactive state for user input
const userText = ref('');

// Method to update user input based on child component's emitted value
const updateUserText = (newText) => {
    userText.value = newText;
};

function handleToggleSidebar() {
    console.log('Sidebar toggled');
}

function handleDeleteConversation() {
    console.log('Conversation deleted');
}

function handleClearMessages() {
    console.log('Messages cleared');
}

function handleShowConversations() {
    console.log('Show conversations');
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
                <!-- Settings content goes here -->
            </div>

            <!-- Conversations Sidebar -->
            <div class="sidebar box" id="conversations-dialog" :class="{ open: showConversationOptions }">
                <!-- Conversations content goes here -->
            </div>

            <!-- Chat Container -->
            <div class="chat-container">
                <div class="container">
                    <div class="chat">
                        <!-- Header -->
                        <chatHeader :selectedModel="selectedModel" />

                        <!-- Messages -->
                        <div class="messages" id="messagesContainer">
                            <div v-for="(message, index) in messages" :key="index">
                                <messageItem :role="message.role" :content="message.content"
                                    :hasFilterText="hasFilterText" :messages="messages" :index="index" />
                            </div>
                        </div>
                        <!-- User Input Section -->
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

.select-dropdown {
    select {
        appearance: none;
        background-color: #333;
        color: #fff;
        padding: 6px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;

        &:hover {
            background-color: #444;
        }

        &:focus {
            outline: none;
        }
    }

    option {
        background-color: #222;
        color: #fff;
    }
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

.close-btn {
    align-self: flex-end; // Align the button to the right
    padding: 5px 10px;
    border: 1px solid #444;
    border-radius: 12px;
    background-color: #3d3c3e;
    color: white;
    cursor: pointer;
    width: 98%;
    font-size: 18px;
    height: 50px;
    outline: none;
    margin-bottom: 10px; // Add some margin at the bottom
    transition: background-color 0.2s ease, transform 0.2s ease;

    &:hover {
        background-color: #3e3e3f;
        transform: scale(1.03);
    }
}

.bottom-panel {
    display: flex;
    justify-content: center;
}

.import-export-container {

    display: flex;

    .import-export-btn {
        align-self: flex-end; // Align the button to the right
        padding: 5px 10px;
        border: 1px solid #444;
        border-radius: 12px;
        margin-right: 6px;
        background-color: #3d3c3e;
        color: white;
        cursor: pointer;
        width: 100%;
        font-size: 18px;
        height: 50px;
        outline: none;
        margin-bottom: -12px; // Add some margin at the bottom
        max-width: 152px;

        &:hover {
            background-color: #4a4a4c;
        }
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

.settings-header {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    margin-top: -7px;
    position: relative;
    border-bottom: 5px solid gray;
}

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

.no-style-link {
    text-decoration: none;
    color: $icon-color;

    &:hover,
    &:focus {
        text-decoration: none;
    }
}

.slider-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 10px;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 2px solid gray;

    input[type="range"] {
        -webkit-appearance: none;
        flex-grow: 1;
        height: 15px;
        border-radius: 5px;
        background: #828282;
        outline: none;
        margin-left: 10px;

        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: #5b525c;
            cursor: pointer;
        }

        &::-moz-range-thumb {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: #5b525c;
            cursor: pointer;
        }
    }
}

.control {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 2px solid gray;
}

.api-key {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-bottom: 10px;
    flex-wrap: nowrap;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 2px solid gray;

    input {
        width: 70%;
        padding: 5px;
        border: 1px solid #444;
        border-radius: 5px;
        background-color: #1c1c1e;
        color: #f0f0f0;
        outline: none;
        margin-top: 5px;
    }
}

.settings-section {
    border-bottom: 1px solid #e0e0e0;
    padding: 1rem 0;
}

.settings-section h3 {
    margin-bottom: 0.5rem;
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
