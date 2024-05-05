<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    labelText: String, // Added labelText prop
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
        <!-- Render the label if labelText is provided -->
        <label :for="props.inputId" v-if="props.labelText">{{ props.labelText }}</label>
        <input :id="props.inputId" :value="props.value" @blur="emitUpdate"
            :type="props.isSecret ? 'password' : props.type" :placeholder="props.placeholderText"
            :autocomplete="props.isSecret ? 'off' : 'on'" /> <!-- Disable autocomplete for secret fields -->
    </div>
</template>

<style lang="scss" scoped>
.input-field {
    display: flex;
    flex-direction: column;
    padding-bottom: 15px;

    label {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 5px;
        display: block;
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
