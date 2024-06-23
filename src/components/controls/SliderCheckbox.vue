<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
    inputId: String,
    labelText: String,
    modelValue: Boolean,
});

const componentModelValue = ref(props.modelValue);

const emit = defineEmits(['update:modelValue']);

const handleChange = (event) => {
    emit('update:modelValue', event.target.checked);
};
</script>

<template>
    <div class="control-checkbox">
        <label :for="inputId">
            {{ labelText }}:
            &nbsp;
            <ToggleButton :inputId="inputId" v-model="componentModelValue" @change="handleChange" />
        </label>
    </div>
</template>

<style scoped lang="scss">
.control-checkbox {
    display: flex;
    align-items: center;
    width: fit-content;

    label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 16px;
        color: #fff;
        position: relative;
        width: 100%;
        user-select: none;

        input[type="checkbox"] {
            opacity: 0;
            width: 0;
            height: 0;

            &:checked+.slider:before {
                transform: translateX(26px);
            }

            &:checked+.slider {
                background-color: #1a5951;
            }
        }

        .slider {
            width: 40px;
            height: 20px;
            background-color: #494747;
            border-radius: 34px;
            transition: background-color 0.3s;
            position: relative;
            margin-left: 10px;

            &:before {
                position: absolute;
                content: "";
                height: 12px;
                width: 12px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                border-radius: 50%;
                transition: transform 0.3s;
            }
        }
    }
}
</style>