<!-- DialogHeader.vue -->
<template>
    <div :id="headerId" class="dialog-header">
        <h2>{{ title }}</h2>
        <button class="close-icon" @click="$emit('close')">
            <X />
        </button>
        <ToolTip :targetId="headerId">{{ tooltipText }}</ToolTip>
    </div>
</template>

<script setup>
import { X } from 'lucide-vue-next';
import ToolTip from '@/components/controls/ToolTip.vue';

defineProps({
    title: {
        type: String,
        required: true,
    },
    tooltipText: {
        type: String,
        default: '',
    },
    headerId: {
        type: String,
        required: true,
    },
});

defineEmits(['close']);
</script>

<style lang="scss" scoped>
.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    border-bottom: 5px solid rgba(66, 64, 69, 0.7098039216);
    margin-bottom: 20px;

    h2 {
        margin: 0;
    }

    .close-icon {
        background: none;
        border: none;
        color: #ffffff;
        font-size: 24px;
        cursor: pointer;
        transition: color 0.3s ease;

        &:hover {
            color: #ff6b6b;
        }
    }
}
</style>