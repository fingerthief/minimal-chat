<!-- InputField.vue -->

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    label: String,
    value: String,
    inputId: String,
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
    <div class="api-key">
        <label :for="props.inputId">{{ props.label }}</label>
        <input :id="props.inputId" :value="props.value" @blur="emitUpdate" :type="type">
    </div>
</template>

<style scoped>
.api-key {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-bottom: 10px;
    flex-wrap: nowrap;
    align-items: center;
    margin-bottom: 15px;
    padding-top: 15px;
    padding-bottom: 15px;
    border-bottom: 2px solid gray;

    input {
        width: 70%;
        padding: 5px;
        border: 1px solid #444;
        border-radius: 1px solid #252534;
        background-color: #1e1e25;
        color: #f0f0f0;
        outline: none;
        margin-top: 5px;
    }
}
</style>