<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import tippy from 'tippy.js';
import 'tippy.js/animations/shift-away-subtle.css';

const props = defineProps({
  targetId: String,
  customClass: String,
});

const tooltipElement = ref(null);
let tippyInstance = null;

const createTooltip = () => {
  const target = document.getElementById(props.targetId);
  if (target && tooltipElement.value) {
    if (!tippyInstance) {
      tippyInstance = tippy(target, {
        content: tooltipElement.value,
        placement: 'bottom',
        trigger: 'mouseenter focus',
        appendTo: document.body,
        arrow: true,
        animation: 'shift-away-subtle',
        interactive: false,
        hideOnClick: true,
        theme: 'custom',
        maxWidth: 250,
        delay: [200, 0], // Add a small delay before showing the tooltip
      });
    }
  }
};


onMounted(() => {
  createTooltip();
});

onUnmounted(() => {
  if (tippyInstance) {
    tippyInstance.destroy();
  }
});
</script>

<template>
  <div ref="tooltipElement" :class="['tooltip-container', customClass]">
    <slot></slot>
  </div>
</template>

<style lang="scss">
.tooltip-container {
  padding: 8px 12px;
  background-color: #094444de;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  z-index: 1000001;
  pointer-events: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 250px;
  line-height: 1.4;
  transition: opacity 0.2s ease-in-out;
}

.tippy-box[data-animation='shift-away-subtle'][data-state='hidden'] {
  opacity: 0;
}

.tippy-arrow {
  color: rgba(26, 89, 81, 0.95);
}
</style>
