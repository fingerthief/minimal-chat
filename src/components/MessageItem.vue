<script setup>
import hljs from 'highlight.js/lib/common';
import MarkdownIt from 'markdown-it';
import { RefreshCcw, Trash, Copy } from 'lucide-vue-next';
import { ref, nextTick, computed, watch, onMounted } from 'vue';
import '/node_modules/highlight.js/scss/github-dark-dimmed.scss';
import ToolTip from './ToolTip.vue';
import ContextWindow from './ContextWindow.vue'; // Import the context menu
import { showToast } from '@/libs/utils/general-utils';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { saveMessagesHandler } from '@/libs/conversation-management/useConversations';
import {
  isLoading,
  messages,
  systemPrompt,
  selectedModel,
  sliderValue,
  localModelName,
  localSliderValue,
  localModelEndpoint,
  conversations,
  abortController,
  streamedMessageText,
  selectedConversation,
  modelDisplayName,
  higherContrastMessages,
  contextMenuOpened,
  isSmallScreen,
  showConversationOptions
} from '@/libs/state-management/state';
import {
  setSystemPrompt,
  regenerateMessageResponse,
  editPreviousMessage,
  deleteMessageFromHistory,
} from '@/libs/conversation-management/conversations-management';
import { updateUIWrapper, swipedLeft, swipedRight } from '@/libs/utils/general-utils';
import 'swiped-events';
// Refs
const loadingIcon = ref(-1);
const messageList = ref(null);
const scroller = ref(null);
const contextWindow = ref(null); // Reference to the context menu

onMounted(() => {

});

// Utility functions
function formatMessage(content) {
  const md = new MarkdownIt({
    highlight: (str, lang) => {
      try {
        return hljs.highlightAuto(str, lang ? [lang] : undefined).value;
      } catch (__) {
        return '';
      }
    },
  });

  let combinedContent = content;

  if (Array.isArray(content)) {
    combinedContent = content.reduce((result, item) => {
      if (item.type === 'text' && item.text) {
        result += item.text + ' ';
      } else if (item.type === 'image_url' && item.image_url && item.image_url.url) {
        result += `![](${item.image_url.url})` + ' \r\n';
      }
      return result;
    }, '').trim();
  }

  return md
    .render(combinedContent)
    .replace(/<(ul|li)>\s*\n/g, '<$1> ')
    .replace(/\n\s*<\/(ul|li)>/g, ' </$1>')
    .replace(/\n/g, '<br>')
    .replace(/^<br\s*\/?>|<br\s*\/?>\s*$/g, '');
}



function messageClass(role) {
  higherContrastMessages.value = JSON.parse(localStorage.getItem("higherContrastMessages") || false);
  return role === 'user' ? 'user message' + (higherContrastMessages.value === true ? ' high-constrast-mode' : '') : 'gpt message' + (higherContrastMessages.value === true ? ' high-constrast-mode' : '');
}

function copyText(message) {
  let textToCopy = '';

  if (Array.isArray(message)) {
    textToCopy = message
      .filter(item => item.text)
      .map(item => item.text)
      .join(' ');
  } else {
    textToCopy = message.text || '';
  }

  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      showToast('Copied text!');
      console.log('Content copied to clipboard');
    })
    .catch((error) => {
      console.error('Failed to copy content: ', error);
    });
}

function startLoading(id) {
  loadingIcon.value = id;
}

// Message editing
let initialMessage = '';

function editMessage(message) {
  if (message.role !== 'user' || message.isEditing) return;
  message.isEditing = true;
  initialMessage = message;
  nextTick(() => {
    const messageContent = document.getElementById(`message-${message.id}`);
    if (messageContent) messageContent.focus();
  });
}

async function saveEditedMessage(message, event) {
  message.isEditing = false;
  const updatedContent = event.target.innerText.trim();
  if (updatedContent !== initialMessage.content.trim()) {
    isLoading.value = true;
    setSystemPrompt(messages.value, systemPrompt.value);

    const result = await editPreviousMessage(
      conversations.value,
      messages,
      initialMessage,
      updatedContent,
      sliderValue.value,
      selectedModel.value,
      localSliderValue.value,
      localModelName.value,
      localModelEndpoint.value,
      updateUIWrapper,
      abortController,
      streamedMessageText
    );

    messages.value = result.baseMessages;
    selectedConversation.value.messageHistory = messages.value;
    isLoading.value = false;
    saveMessagesHandler();
  }
}

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

// Message actions
async function regenerateMessage(content) {
  isLoading.value = true;
  setSystemPrompt(messages.value, systemPrompt.value);

  const result = await regenerateMessageResponse(
    conversations.value,
    messages,
    content,
    sliderValue.value,
    selectedModel.value,
    localSliderValue.value,
    localModelName.value,
    localModelEndpoint.value,
    updateUIWrapper,
    abortController,
    streamedMessageText
  );

  isLoading.value = false;
  messages.value = result.baseMessages;
  selectedConversation.value.messageHistory = messages.value;
  saveMessagesHandler();
}

async function deleteMessage(content) {
  messages.value = deleteMessageFromHistory(messages.value, content);
  saveMessagesHandler();
}

// Handle click and hold event
let holdTimeout = null;

let lastTapTime = 0;
function handleDoubleTap(event) {
  if (!contextWindow.value) {
    return;
  }

  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;

  if (tapLength < 500 && tapLength > 0) {
    // Double tap detected
    contextWindow.value.showContextMenu(event);
  } else {
    // Single tap detected
    lastTapTime = currentTime;
    contextWindow.value.hideContextMenu();
  }
}

let tapCount = 0;
function handleTripleTap(event) {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;

  if (tapLength < 500 && tapLength > 0) {
    tapCount++;
    if (tapCount === 2) {
      // Double tap detected
      contextWindow.value.showContextMenu(event);
      tapCount = 0;
    } else if (tapCount === 3) {
      // Triple tap detected
      contextWindow.value.hideContextMenu();
      showConversationOptions.value = true;
      tapCount = 0;
    }
  } else {
    // Single tap detected
    tapCount = 1;
    contextWindow.value.hideContextMenu();
    showConversationOptions.value = false;
  }

  lastTapTime = currentTime;
}

</script>

<template>
  <div ref="messageList" class="message-list" @swiped-left="swipedLeft" @swiped-right="swipedRight"
    @touchstart="handleDoubleTap" data-swipe-threshold="15" data-swipe-unit="vw" data-swipe-timeout="500">
    <DynamicScroller :min-item-size="1200" :buffer="1200" ref="scroller" class="scroller" @emitUpdates="true"
      :items="filteredMessages" key-field="id" v-slot="{ item, active }">
      <DynamicScrollerItem :item="item" :active="active" :data-index="item.id">
        <div v-if="active" :class="messageClass(item.role)">
          <div class="message-header">
            <RefreshCcw v-if="item.role === 'user'" class="icon" :id="'message-refresh-' + item.id" :size="18"
              :class="{ loading: isLoading && loadingIcon === item.id }"
              @click.stop="regenerateMessage(item.content), startLoading(item.id)" />
            <ToolTip v-if="item.role === 'user'" :targetId="'message-refresh-' + item.id">Regenerate </ToolTip>

            <Copy v-if="item.role === 'user'" class="delete-icon" :id="'message-copy-' + item.id" :size="18"
              @click.stop="copyText(item.content)" />
            <ToolTip v-if="item.role === 'user'" :targetId="'message-copy-' + item.id">Copy</ToolTip>

            <Trash v-if="item.role === 'user'" class="delete-icon" :id="'message-trash-' + item.id" :size="18"
              @click.stop="deleteMessage(item.content), startLoading(item.id)" />
            <ToolTip v-if="item.role === 'user'" :targetId="'message-trash-' + item.id">Remove</ToolTip>
            <div class="label" @click="copyText(item.content)" :id="'message-label-' + item.id">
              {{ item.role === 'user' ? '' : modelDisplayName }}
            </div>
            <ToolTip :targetId="'message-label-' + item.id">Copy message</ToolTip>
          </div>
          <div class="message-contents" :id="'message-' + item.id" :contenteditable="item.isEditing"
            @dblclick="editMessage(item)" @blur="saveEditedMessage(item, $event)" v-html="formatMessage(item.content)">
          </div>
          <ToolTip v-if="item.role === 'user'" :targetId="'message-' + item.id">Double click to edit message </ToolTip>
        </div>
      </DynamicScrollerItem>
    </DynamicScroller>
    <ContextWindow ref="contextWindow" v-if="isSmallScreen" />
  </div>
</template>


<style lang="scss" scoped>
.scroller,
.message-list {
  height: 87vh;
  overflow-y: auto;
  scrollbar-width: none;
}

.icon {
  color: #b8b6b67d;
  transition:
    background-color 0.75s ease,
    transform 0.75s ease;

  &:hover {
    animation: spin 0.5s linear;
    transform: scale(1.2);
    cursor: pointer;
  }
}

.delete-icon {
  color: #b8b6b67d;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    transform: scale(1.2);
    cursor: pointer;
  }
}

.loading {
  animation: spin 1s infinite linear;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.message {
  position: relative;
  min-width: 10%;
  width: fit-content;
  padding: 8px 0;
  clear: both;
  font-size: 1em;
  line-height: 1.5;
  max-width: 75vw;
  margin-top: 20px;

  @media (max-width: 600px) {
    max-width: 85vw;
  }

  &.user {
    margin-left: auto;
    background-color: #2d2d2d;
    border-radius: 16px;
    max-width: 75%;
    padding-left: 12px;
    padding-bottom: 4px;
    padding-top: 8px;
    padding-right: 4px;

    @media (max-width: 600px) {
      max-width: 75vw
    }

    &.high-constrast-mode {
      background-color: #2f2d44d9;
      border-radius: 12px;
      transition: background-color 0.3s ease;
      margin-bottom: 20px;
      margin-top: 20px;
      max-width: 90vw;
      top: -20px;
      padding: 0px;

      .message-header {
        justify-content: end;
      }
    }

    .message-header {
      justify-content: end;
      right: 1%;
      position: relative;
    }

    .label:hover {
      background-color: #583e72d9;
    }
  }

  &.gpt {
    margin-right: auto;
    transition: background-color 0.3s ease;

    &.high-constrast-mode {
      background-color: #123638e3;
      border-radius: 12px;
      transition: background-color 0.3s ease;
      margin-bottom: 20px;
      margin-top: 20px;
      max-width: 90vw;
      display: inline-block;
      padding: 0px;

      .message-header {
        justify-content: start;
        border-bottom: 2px solid #0b6363e5;
      }
    }

    .message-header {
      justify-content: start;
      border-bottom: 2px solid #0b6363e5;
    }

    .label:hover {
      background-color: #0b6363e5;
    }
  }

  .message-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #dadbde;
    padding: 3px 6px;

    .label {
      color: #dadbde;
      font-weight: 500;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;

      &:hover {
        border-radius: 3px;
        padding: 6px;
        margin: -6px;
      }
    }
  }

  .message-contents {
    padding: 8px;
    margin: 8px;
    display: block;
    overflow-wrap: break-word;

    &[contenteditable='true'] {
      outline: none;
      outline: 2px solid #423d42;
      border-radius: 5px;
      text-align: left;
    }
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
