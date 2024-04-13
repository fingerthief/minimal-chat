<script setup>
import { ref, watch, defineEmits } from 'vue';


// Define props and emits
const props = defineProps({
    userInput: String
});

const emit = defineEmits(['update:userInput']);

const isLoading = ref(false);

// Local reactive state
const localUserInput = ref(props.userInput);

// Watch for changes in localUserInput and emit an event
watch(localUserInput, (newVal) => {
    emit('update:userInput', newVal);
});

// Methods
const sendMessage = () => {
    // Your method logic here
};

const swipedLeft = () => {
    // Your method logic here
};

const swipedRight = () => {
    // Your method logic here
};

const autoResize = () => {
    // Your method logic here
};

const visionImageUploadClick = () => {
    // Your method logic here
};
</script>

<template>
    <form @submit.prevent="sendMessage" id="chat-form" @swipeleft="swipedLeft" @swiperight="swipedRight">
        <textarea class="user-input-text" id="user-input" rows="1" placeholder="" v-model="localUserInput"
            @input="autoResize" @focus="autoResize" @blur="autoResize"></textarea>
        <div class="image-button" @click="visionImageUploadClick">
            <span class="fa-solid fa-image fa-xl"></span>
        </div>
        <div class="send-button" @click="sendMessage">
            <span v-show="isLoading" class="loading input-spinner"></span>
            <span class="fa-solid fa-circle-arrow-up fa-xl" v-show="!isLoading"></span>
        </div>
    </form>
</template>

<style lang="scss" scoped>
@use "@fortawesome/fontawesome-free/scss/fontawesome.scss";
@use "@fortawesome/fontawesome-free/scss/solid.scss";
@use "@fortawesome/fontawesome-free/scss/regular.scss";
@use "@fortawesome/fontawesome-free/scss/brands.scss";

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