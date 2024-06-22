<template>
  <div ref="messageList" class="message-list" @swiped-left="swipedLeft" @swiped-right="swipedRight"
    data-swipe-threshold="15" data-swipe-unit="vw" data-swipe-timeout="500">
    <VirtualScroller :items="filteredMessages" :itemSize="1200" class="scroller" :scrollHeight="'87vh'" :delay="0"
      :lazy="true" :showLoader="false">
      <template #item="{ item, index }">
        <MessageItem :item="item" :active="true" :key="item.id" />
      </template>
    </VirtualScroller>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, watch, onMounted } from 'vue';
import { messages } from '@/libs/state-management/state';
import { swipedLeft, swipedRight } from '@/libs/utils/general-utils';
import 'swiped-events';
import MessageItem from '@/components/controls/MessageItem.vue';
import VirtualScroller from 'primevue/virtualscroller';

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
.p-virtualscroller {
  height: 87vh;
  width: 100%;
}

.p-virtualscroller-content {
  display: flex;
  flex-direction: column;
}

.p-virtualscroller-item {
  flex: 0 0 auto;
}

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
