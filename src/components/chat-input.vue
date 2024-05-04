<script setup>
import { ref, watch, defineEmits } from 'vue';
import { SendHorizontal, ImageUp, CircleStop } from 'lucide-vue-next';
import ToolTip from './ToolTip.vue';
import "swiped-events";

// Define props and emits
const props = defineProps({
    userInput: String,
    isLoading: Boolean
});

const emit = defineEmits(['update:userInput', 'abort-stream', 'send-message', 'swipe-left', 'swipe-right', 'vision-prompt']);
// Local reactive stat
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

async function abortStream() {
    emit("abort-stream");
}
</script>

<template>
    <form @submit.prevent="sendMessage" id="chat-form" @swiped-left="swipedLeft" @swiped-right="swipedRight"
        data-swipe-threshold="15" data-swipe-unit="vw" data-swipe-timeout="250">
        <textarea class="user-input-text" id="user-input" rows="1" v-model="localUserInput" ref="userInputRef"
            @input="autoResize" @focus="autoResize" @blur="autoResize" @keydown="handleKeyDown"
            placeholder="Enter your prompt"></textarea>
        <ToolTip :targetId="'imageButton'">
            Upload image for vision processing</ToolTip>
        <div class="image-button" id="imageButton" @click="visionImageUploadClick">
            <span>
                <ImageUp />
            </span>
        </div>
        <div class="send-button" @click="props.isLoading ? abortStream() : sendMessage()">
            <span v-show="props.isLoading" class="loading input-spinner">

            </span>
            <span class="stop-button" v-show="props.isLoading">
                <CircleStop />
            </span>
            <span v-show="!props.isLoading">
                <SendHorizontal />
            </span>
        </div>
    </form>
</template>
<SendHorizontal />
<style lang="scss" scoped>
$icon-color: rgb(187, 187, 187);

#chat-form {
    display: flex;

    .image-button {
        background-color: transparent;
        cursor: pointer;
        outline: none;
        color: $icon-color;
        position: absolute;
        min-height: 55px;
        display: grid;
        align-content: center;
        right: 62px;
        z-index: 99999;
        border-radius: 30px;
        justify-content: space-around;
        transition: background-color 0.3s ease, transform 0.2s ease;

        &:hover {
            transform: scale(1.30);
        }
    }


    .send-button {
        background-color: transparent;
        cursor: pointer;
        outline: none;
        color: $icon-color;
        position: absolute;
        min-height: 55px;
        display: grid;
        align-content: center;
        right: 7px;
        z-index: 99999;
        border-radius: 30px;
        min-width: 50px;
        justify-content: space-around;
        transition: background-color 0.3s ease, transform 0.2s ease;

        &:hover {
            transform: scale(1.30);
        }
    }

    .stop-button {
        background-color: transparent;
        cursor: pointer;
        outline: none;
        color: $icon-color;
        position: absolute;
        min-height: 55px;
        display: grid;
        align-content: center;
        right: -2px;
        z-index: 99999;
        border-radius: 30px;
        min-width: 50px;
        justify-content: space-around;
        transition: background-color 0.3s ease, transform 0.2s ease;

        &:hover {
            transform: scale(1.30);
        }
    }

    #user-input {
        flex-grow: 1;
        z-index: 9999;
        border: 1px solid #0d3937;
        outline: none;
        background-color: #1e1e20;
        font-size: 18px;
        color: #f0f0f0;
        resize: vertical;
        overflow: hidden;
        white-space: pre-wrap;
        min-height: 50px;
        transition: 0.2s height ease-in-out;
        box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.3);
        border-radius: 30px;

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
        padding-right: 100px;
        transition: 0.2s height ease-in-out;
        margin-right: 6px;

        font-family: Roboto-Regular, sans-serif;
    }

    .input-spinner {
        display: inline-block;
        width: 34px;
        color: lightskyblue;
        height: 34px;
        margin-left: 5px;
        border: 4px solid #3c8280;
        border-left-color: #1cdfd8;
        border-radius: 50%;
        animation: spinner 1s linear infinite;
    }
}
</style>