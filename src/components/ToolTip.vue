<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    targetId: String,
    alignment: {
        type: String,
        default: 'center',
        validator: (value) => ['left', 'center', 'right'].includes(value)
    }
});

const visible = ref(false);
const tooltipElement = ref(null);

const showTooltip = () => {
    visible.value = true;
    updatePosition();
};

const hideTooltip = () => {
    visible.value = false;
};

const updatePosition = () => {
    const target = document.getElementById(props.targetId);
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltipElement.value.getBoundingClientRect();

    let x = 0;
    if (props.alignment === 'left') {
        x = targetRect.left;
    } else if (props.alignment === 'center') {
        x = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
    } else if (props.alignment === 'right') {
        x = targetRect.right - tooltipRect.width;
    }

    const y = targetRect.bottom + 10; // Adjust the offset as needed

    tooltipElement.value.style.left = `${x}px`;
    tooltipElement.value.style.top = `${y}px`;
};

onMounted(() => {
    const target = document.getElementById(props.targetId);

    if (target) {
        target.addEventListener('mouseenter', showTooltip);
        target.addEventListener('mouseleave', hideTooltip);
        window.addEventListener('resize', updatePosition);
    }
});

onUnmounted(() => {
    const target = document.getElementById(props.targetId);

    if (target) {
        target.removeEventListener('mouseenter', showTooltip);
        target.removeEventListener('mouseleave', hideTooltip);
        window.removeEventListener('resize', updatePosition);
    }

});
</script>

<template>
    <div ref="tooltipElement" class="tooltip-container" v-show="visible">
        <slot></slot>
    </div>
</template>

<style>
.tooltip-container {
    position: fixed;
    padding: 8px;
    background-color: #333;
    color: white;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000001;
    /* Ensure it's on top */
    pointer-events: none;
    /* Prevents tooltip from blocking mouse events */
}
</style>
