<!-- Original component (e.g., MessageList.vue) -->
<template>
  <div ref="messageList" class="message-list" @swiped-left="swipedLeft" @swiped-right="swipedRight"
    @touchstart="handleDoubleTap" data-swipe-threshold="15" data-swipe-unit="vw" data-swipe-timeout="500">
    <DynamicScroller :min-item-size="1200" :buffer="1200" ref="scroller" class="scroller" @emitUpdates="true"
      :items="filteredMessages" key-field="id" v-slot="{ item, active }">
      <DynamicScrollerItem :item="item" :active="active" :data-index="item.id">
        <MessageItem :item="item" :active="active" />
      </DynamicScrollerItem>
    </DynamicScroller>
    <ContextWindow ref="contextWindow" v-if="isSmallScreen" />
  </div>
</template>

<script setup>
import { ref, nextTick, computed, watch, onMounted } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import {
  messages,
  conversations,
  selectedConversation,
  isSmallScreen,
  showConversationOptions
} from '@/libs/state-management/state';
import { swipedLeft, swipedRight } from '@/libs/utils/general-utils';
import 'swiped-events';
import MessageItem from '@/components/controls/MessageItem.vue';
import ContextWindow from '@/components/controls/ContextWindow.vue';

// Refs
const messageList = ref(null);
const scroller = ref(null);
const contextWindow = ref(null);

onMounted(() => {
  // Add any necessary onMounted logic
});

// Message filtering
const filteredMessages = computed(() => messages.value.filter((message) => message.role !== 'system'));

// Scrolling
async function scrollToBottom() {
  if (scroller.value && messageList.value) {
    await nextTick();
    scroller.value.scrollToItem(filteredMessages.value.length);
  }
}

watch(
  () => [filteredMessages],
  async () => {
    await scrollToBottom();
  },
  { deep: true }
);

// Handle click and hold event
let lastTapTime = 0;
let hideMenuTimer = null;
function handleDoubleTap(event) {
  if (!contextWindow.value) {
    return;
  }

  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;

  if (tapLength < 250 && tapLength > 0) {
    event.preventDefault();
    const x = event.clientX || event.touches[0].clientX;
    const y = event.clientY || event.touches[0].clientY;
    contextWindow.value.showContextMenu(x, y);

    // Clear any existing timer
    if (hideMenuTimer) {
      clearTimeout(hideMenuTimer);
    }

    // Start a new timer for 2 seconds
    hideMenuTimer = setTimeout(() => {
      contextWindow.value.hideContextMenu();
    }, 2000);
  } else {
    lastTapTime = currentTime;
  }
}
</script>

<style lang="scss" scoped>
.scroller,
.message-list {
  height: 87vh;
  overflow-y: auto;
  scrollbar-width: none;
}

.message-padding {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20px;
  pointer-events: auto;

  &.left {
    left: -20px;
  }

  &.right {
    right: -20px;
  }
}

.loading.spinner {
  display: inline-block;
  margin-left: 5px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #0077ff;
  width: 10px;
  height: 10px;
  animation: spin 1s infinite linear;
}
</style>
