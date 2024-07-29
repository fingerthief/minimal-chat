<!-- Original component (e.g., MessageList.vue) -->
<template>
  <div ref="messageList" class="message-list" @swiped-left="swipedLeft" @swiped-right="swipedRight"
    data-swipe-threshold="15" data-swipe-unit="vw" data-swipe-timeout="500">
    <DynamicScroller :items="filteredMessages" :min-item-size="50" :buffer="100" key-field="id" :emitUpdates="true"
      :size-dependencies="['content']" type-field="type" ref="scroller" class="scroller">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :data-index="index" :size-dependencies="['content']">
          <MessageItem :item="item" :active="active" />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, watch, onMounted } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import {
  messages,
} from '@/libs/state-management/state';
import { swipedLeft, swipedRight } from '@/libs/utils/general-utils';
import 'swiped-events';
import MessageItem from '@/components/controls/MessageItem.vue';

const messageList = ref(null);
const scroller = ref(null);

const filteredMessages = computed(() =>
  messages.value
    .filter((message) => message.role !== 'system')
    .map(message => ({
      ...message,
      type: getItemType(message)
    }))
);

function getItemType(item) {
  const baseSize = 50;
  const contentLength = item.content.length;
  const estimatedSize = baseSize + Math.ceil(contentLength / 100) * 20; // Add 20px for every 100 characters
  return estimatedSize;
}

async function scrollToBottom() {
  if (scroller.value && messageList.value) {
    await nextTick();
    setTimeout(() => {
      scroller.value.scrollToItem(filteredMessages.value.length - 1);
    }, 50);
  }
}

watch(
  () => filteredMessages.value,
  async () => {
    await scrollToBottom();
  },
  { deep: true }
);

onMounted(() => {
  scrollToBottom();
});

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
