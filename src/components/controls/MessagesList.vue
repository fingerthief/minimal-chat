<!-- Original component (e.g., MessageList.vue) -->
<template>
  <div ref="messageList" class="message-list" @swiped-left="swipedLeft" @swiped-right="swipedRight"
    data-swipe-threshold="15" data-swipe-unit="vw" data-swipe-timeout="500">
    <DynamicScroller :min-item-size="1200" :buffer="1200" ref="scroller" class="scroller" :emitUpdates="true"
      :items="filteredMessages" key-field="id" v-slot="{ item, active }">
      <DynamicScrollerItem :item="item" :active="active" :data-index="item.id">
        <MessageItem :item="item" :active="active" />
      </DynamicScrollerItem>
    </DynamicScroller>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, watch, onMounted } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import {
  messages,
  isSmallScreen,
} from '@/libs/state-management/state';
import { swipedLeft, swipedRight } from '@/libs/utils/general-utils';
import 'swiped-events';
import MessageItem from '@/components/controls/MessageItem.vue';

const messageList = ref(null);
const scroller = ref(null);

const filteredMessages = computed(() => messages.value.filter((message) => message.role !== 'system'));

async function scrollToBottom() {
  if (scroller.value && messageList.value) {
    await nextTick();
    scroller.value.scrollToItem(filteredMessages.value.length);
  }
}

watch(
  () => filteredMessages.value,
  async () => {
    await scrollToBottom();
  },
  { deep: true }
);

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
