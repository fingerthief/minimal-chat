<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';

const props = defineProps({
    targetId: String
});

const visible = ref(false);
const position = reactive({ x: 0, y: 0 });

const updatePosition = (event) => {
    const tooltipElement = event.target.nextElementSibling;
    const tooltipWidth = tooltipElement.offsetWidth;
    const tooltipHeight = tooltipElement.offsetHeight;
    const padding = 10; // Padding from cursor

    let x = event.clientX + padding;
    let y = event.clientY - tooltipHeight; // Center vertically relative to the cursor

    // Adjust if tooltip goes beyond the right edge of the viewport
    if (x + tooltipWidth > window.innerWidth) {
        x = event.clientX - tooltipWidth - padding;
    }

    // Adjust if tooltip goes beyond the top edge of the viewport
    if (y < 0) {
        y = padding; // Reset to top padding if it goes above the viewport
    }

    // Adjust if tooltip goes beyond the bottom edge of the viewport
    if (y + tooltipHeight > window.innerHeight) {
        y = window.innerHeight - tooltipHeight - padding;
    }

    position.x = x;
    position.y = y;

    console.log(`Tooltip position: x=${x}, y=${y}`); //
};

const showTooltip = (event) => {
    updatePosition(event);
    visible.value = true;
};

const hideTooltip = () => {
    visible.value = false;
};

onMounted(() => {
    const target = document.getElementById(props.targetId);
    target.addEventListener('mouseenter', showTooltip);
    target.addEventListener('mousemove', updatePosition);
    target.addEventListener('mouseleave', hideTooltip);
});

onUnmounted(() => {
    const target = document.getElementById(props.targetId);
    target.removeEventListener('mouseenter', showTooltip);
    target.removeEventListener('mousemove', updatePosition);
    target.removeEventListener('mouseleave', hideTooltip);
});
</script>

<template>
    <div class="tooltip-container" v-show="visible" :style="{ top: position.y + 'px', left: position.x + 'px' }">
        <slot></slot>
    </div>
</template>

<style>
.tooltip-container {
    position: inherit;
    padding: 8px;
    background-color: #333;
    color: white;
    border-radius: 4px;
    font-size: 14px;
    display: flex;
    left: 0%;
    top: 0%;
    z-index: 1000001;
    /* Ensure it's on top */
    pointer-events: none;
    /* Prevents tooltip from blocking mouse events */
}
</style>
