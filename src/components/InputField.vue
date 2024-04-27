<!-- InputField.vue -->

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    label: String,
    value: String,
    inputId: String,
    placeholderText: String,
    isSecret: Boolean,
    type: {
        type: String,
        default: 'text'
    }
});

const emit = defineEmits(['update:value']);

const emitUpdate = (event) => {
    emit('update:value', event.target.value);
};
</script>

<template>
    <div class="input-field">
        <input :id="props.inputId" :value="props.value" @blur="emitUpdate" :type="props.isSecret ? 'password' : 'text'"
            :placeholder="props.placeholderText">
    </div>
</template>

<style scoped>
.input-field {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
    padding-bottom: 15px;
    padding-top: 10px;
    border-bottom: 1px solid #3f4151;

    label {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 5px;
    }

    @font-face {
        font-family: Roboto-Regular;
        src: url('/src/assets/webfonts/Roboto-Regular.ttf');
        font-weight: 400;
        font-style: normal;
    }

    input {
        width: 100%;
        padding: 10px;
        color: #e0e0e0;
        border-radius: 5px;
        border-color: rgb(70, 68, 68);
        background-color: rgb(70, 68, 68);
        font-size: 16px;
        font-family: Roboto-Regular, sans-serif;


        &:focus {
            outline: none;
            border-color: rgb(70, 68, 68);
        }
    }
}
</style>