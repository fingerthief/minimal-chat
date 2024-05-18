<script setup>
import { ref, watch, defineEmits } from 'vue';
import { SquareArrowUp, ImageUp, CircleStop, Upload } from 'lucide-vue-next';
import ToolTip from './ToolTip.vue';
import "swiped-events";

// Define props and emits
const props = defineProps({
    userInput: String,
    isLoading: Boolean
});

const emit = defineEmits(['update:userInput', 'abort-stream', 'send-message', 'swipe-left', 'swipe-right', 'vision-prompt', 'upload-context']);
// Local reactive state
const localUserInput = ref(props.userInput);

const userInputRef = ref(null);

// Watch for changes in localUserInput and emit an event
watch(localUserInput, (newVal) => {
    emit('update:userInput', newVal);
});

// Methods
const sendMessage = () => {
    localUserInput.value = "";
    emit('send-message');
    autoResize();
};

function swipedLeft() {
    emit('swipe-left');
}

function swipedRight() {
    emit('swipe-right');
}

const autoResize = () => {
    if (!localUserInput.value || localUserInput.value.trim() === "") {
        userInputRef.value.style.height = '30px';
        return;
    }

    userInputRef.value.style.height = 'auto';
    userInputRef.value.style.height = `${userInputRef.value.scrollHeight - 15}px`;
};

const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        if (event.ctrlKey) {
            event.preventDefault();
            const cursorPosition = event.target.selectionStart;
            const text = localUserInput.value;
            localUserInput.value = text.slice(0, cursorPosition) + "\n" + text.slice(cursorPosition);
            userInputRef.value.selectionStart = userInputRef.value.selectionEnd = cursorPosition + 1;
            autoResize();
        } else {
            event.preventDefault(); // Prevent the default Enter behavior
            sendMessage();
        }
    }
};

const visionImageUploadClick = () => {
    emit("vision-prompt");
    localUserInput.value = "";
};

const importFileUploadClick = () => {
    emit("upload-context");
    localUserInput.value = "";
};

async function abortStream() {
    emit("abort-stream");
}
</script>

<template>
    <form @submit.prevent="sendMessage" id="chat-form" @swiped-left="swipedLeft" @swiped-right="swipedRight"
        data-swipe-threshold="15" data-swipe-unit="vw" data-swipe-timeout="250">
        <div class="input-container">
            <textarea class="user-input-text" id="user-input" rows="1" v-model="localUserInput" ref="userInputRef"
                :class="{ 'loading-border': props.isLoading }" @input="autoResize" @focus="autoResize"
                @blur="autoResize" @keydown="handleKeyDown" placeholder="Enter a prompt"></textarea>
            <div class="icons">
                <ToolTip :targetId="'imageButton'">
                    Upload image for vision processing
                </ToolTip>
                <div class="image-button" id="imageButton" @click="visionImageUploadClick">
                    <span>
                        <ImageUp />
                    </span>
                </div>
                <ToolTip :targetId="'uploadButton'">
                    Upload file to add contents to current conversation
                </ToolTip>
                <div class="upload-button" id="uploadButton" @click="importFileUploadClick">
                    <span>
                        <Upload />
                    </span>
                </div>
                <div class="send-button" @click="props.isLoading ? abortStream() : sendMessage()">
                    <span class="stop-button" v-if="props.isLoading">
                        <CircleStop />
                    </span>
                    <span v-if="!props.isLoading">
                        <SquareArrowUp />
                    </span>
                </div>
            </div>
        </div>
    </form>
</template>

<style lang="scss" scoped>
$icon-color: rgb(187, 187, 187);

#chat-form {
    position: absolute;
    display: flex;
    width: 58vw;
    align-self: center;
    top: 104%;

    @media (max-width: 600px) {
        max-width: 98vw;
        width: 100%;
    }

    .input-container {
        display: flex;
        align-items: center;
        width: 100%;
        position: relative;
    }

    .icons {
        display: flex;
        align-items: center;
        position: absolute;
        right: 20px;
    }

    .image-button,
    .upload-button,
    .send-button,
    .stop-button {
        background-color: transparent;
        cursor: pointer;
        outline: none;
        color: $icon-color;
        display: grid;
        align-content: center;
        border-radius: 30px;
        justify-content: space-around;
        transition: background-color 0.3s ease, transform 0.2s ease;
        margin-left: 10px;

        &:hover {
            transform: scale(1.30);
        }
    }

    #user-input {
        flex-grow: 1;
        border: 1px solid #70707087;
        outline: none;
        background-color: #212121;
        border-radius: 10px;
        font-size: 18px;
        color: #f0f0f0;
        resize: vertical;
        overflow: hidden;
        white-space: pre-wrap;
        min-height: 50px;
        transition: 0.2s height ease-in-out;
        padding-right: 150px; // Adjust padding to make space for icons
        box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.3);

        @media (max-width: 600px) {
            max-width: 98vw;
            margin-left: 2vw;
        }
    }

    @font-face {
        font-family: Roboto-Regular;
        src: url('/src/assets/webfonts/Roboto-Regular.ttf');
        font-weight: 400;
        font-style: normal;
    }

    textarea {
        padding-top: 14px;
        padding-left: 20px;
        transition: 0.2s height ease-in-out;
        margin-right: 6px;

        font-family: Roboto-Regular, sans-serif;
    }

    .loading-border {
        animation: pulse 3.0s infinite;
    }

    @keyframes pulse {
        0% {
            border-color: #0b8181c4;
            box-shadow: 0 0 5px #0b8181c4;
        }

        50% {
            border-color: #6a4292e0;
            box-shadow: 0 0 10px #6a4292d9;

        }

        100% {
            border-color: #0b8181c4;
            box-shadow: 0 0 5px #0b8181c4;
        }
    }
}
</style>
