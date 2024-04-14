<script setup>
import { ref, watch, defineEmits } from 'vue';


// Define props and emits
const props = defineProps({
    userInput: String,
    isLoading: Boolean
});

const emit = defineEmits(['update:userInput', 'send-message']);
// Local reactive stat
const localUserInput = ref(props.userInput);

// Watch for changes in localUserInput and emit an event
watch(localUserInput, (newVal) => {
    emit('update:userInput', newVal);
});

// Methods
const sendMessage = () => {
    localUserInput.value = "";
    emit('send-message');
};

const swipedLeft = () => {
};

const swipedRight = () => {
};

const autoResize = () => {
};

const visionImageUploadClick = () => {
};
</script>

<template>
    <form @submit.prevent="sendMessage" id="chat-form" @swipeleft="swipedLeft" @swiperight="swipedRight">
        <textarea class="user-input-text" id="user-input" rows="1" placeholder="" v-model="localUserInput"
            @input="autoResize" @focus="autoResize" @blur="autoResize" @keypress.enter.prevent="sendMessage"></textarea>
        <div class="image-button" @click="visionImageUploadClick">
            <span class="fa-solid fa-image fa-xl"></span>
        </div>
        <div class="send-button" @click="sendMessage">
            <span v-show="props.isLoading" class="loading input-spinner"></span>
            <span v-show="!props.isLoading" class="fa-solid fa-circle-arrow-up">
            </span>
        </div>
    </form>
</template>

<style lang="scss" scoped>
$icon-color: rgb(187, 187, 187);

#chat-form {
    display: flex;
    padding: 6px;
    height: 50px;
    border-top: 1px solid #444;

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


    #user-input {
        flex-grow: 1;
        z-index: 9999;
        border: 1px solid #444;
        outline: none;
        background-color: #1c1c1e;
        font-size: 18px;
        color: #f0f0f0;
        resize: vertical;
        overflow: hidden;
        white-space: pre-wrap;
        min-height: 50px;
        border-radius: 30px;
        transition: 0.2s height ease-in-out;

    }

    textarea {
        padding-top: 14px;
        padding-left: 20px;
        padding-right: 100px;
        transition: 0.2s height ease-in-out;
    }

    .input-spinner {
        display: inline-block;
        width: 25px;
        color: lightskyblue;
        height: 25px;
        margin-left: 5px;
        border: 4px solid #3c8280;
        border-left-color: #1cdfd8;
        border-radius: 50%;
        animation: spinner 1s linear infinite;
    }
}
</style>