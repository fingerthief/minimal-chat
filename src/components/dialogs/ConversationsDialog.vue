<script setup>
import { onMounted, ref, nextTick, computed } from 'vue';
import { Plus, Eraser, Download, Upload, MessageSquareX, Settings, Pencil, Database, Trash, MoreHorizontal, Github } from 'lucide-vue-next';
import ToolTip from '../controls/ToolTip.vue';
import {
  conversations,
  selectedConversation,
  showConversationOptions,
  messages,
  lastLoadedConversationId,
  storedConversations,
  isSidebarOpen,
  isSmallScreen,
  showStoredFiles,
  selectedModel,
} from '@/libs/state-management/state';
import { deleteCurrentConversation, editConversationTitle, saveMessagesHandler } from '@/libs/conversation-management/useConversations';
import { showToast } from '@/libs/utils/general-utils';
import { selectConversation } from '@/libs/conversation-management/conversations-management';

// State
const loadedConversation = ref({});
let initialConversation = '';
const showContextMenu = ref(false);

// Emits
const emit = defineEmits(['import-conversations', 'export-conversations']);

// Helper Functions
function conversationCharacterCount(conversation) {
  let totalTextLength = 0;

  for (const message of conversation.messageHistory) {
    if (Array.isArray(message.content)) {
      for (const contentItem of message.content) {
        if (contentItem.type === 'text') {
          totalTextLength += contentItem.text.length;
        }
      }
    } else {
      totalTextLength += message.content.length;
    }
  }

  const tokenCount = Math.ceil(totalTextLength / 4);
  return tokenCount;
}


// Lifecycle Hooks
onMounted(function () {
  const lastConversationId = parseInt(localStorage.getItem('lastConversationId')) || 0;
  const lastConversation = conversations.value.find(function (conversation) {
    return conversation.id === lastConversationId;
  });

  // Only set loadedConversation if the conversation exists
  if (lastConversation) {
    loadedConversation.value = lastConversation;
  } else {
    // Fallback if no matching conversation is found
    loadedConversation.value = {
      title: '',
      messageHistory: [],
      id: 0,
    };
  }
});

// Event Handlers
function onEditConversationTitle(conversation) {
  if (conversation.isEditing) {
    return;
  }

  conversation.isEditing = !conversation.isEditing;

  if (conversation.isEditing) {
    initialConversation = conversation;

    nextTick(function () {
      const messageContent = document.getElementById(`conversation-${conversations.value.indexOf(conversation)}`);
      if (messageContent) {
        messageContent.focus();
      }
    });
  }
}

function saveEditedConversationTitle(conversation, event) {
  conversation.isEditing = false;
  const updatedContent = event.target.innerText.trim();

  if (updatedContent !== initialConversation.title.trim()) {
    editConversationTitle(initialConversation, updatedContent);
  }
}

async function loadSelectedConversation(conversation) {
  loadedConversation.value = conversation;
  selectConversation(conversations.value, conversation.id, messages.value, lastLoadedConversationId.value, showToast);
  selectedConversation.value = conversation;
  messages.value = conversation.messageHistory;

  showConversationOptions.value = false;
}

async function startNewConversation() {
  selectedConversation.value = null;
  messages.value = [];

  showConversationOptions.value = false;

  showToast('Conversation Saved');
}

function importConversations() {
  emit('import-conversations');
}

function exportConversations() {
  emit('export-conversations');
}

function purgeConversations() {
  if (!confirm('Delete All Conversations?')) {
    return;
  }

  localStorage.setItem('gpt-conversations', '');
  messages.value = [];
  conversations.value = [];
  storedConversations.value = [];

  showToast('All Conversations Deleted.');
}

function toggleSidebar() {
  event.stopPropagation();
  isSidebarOpen.value = !isSidebarOpen.value;
}

function toggleConversations() {
  event.stopPropagation();
  showConversationOptions.value = !showConversationOptions.value;
}

function deleteConversation(conversationId) {
  const index = conversations.value.findIndex(convo => convo.id === conversationId);
  if (index !== -1) {
    const conversationElement = document.getElementById(`conversation-${index}`);
    if (conversationElement) {
      conversationElement.classList.add('deleting');
      setTimeout(() => {
        conversations.value.splice(index, 1);

        if (conversations.value.length === 0) {
          messages.value = [];
          saveMessagesHandler();
          showToast('Conversation Deleted');
          return;
        }

        saveMessagesHandler();
        loadSelectedConversation(selectedConversation.value);
        showToast('Conversation Deleted');
      }, 200); // Duration of the scaleDown animation
    }
  }
}


const contextMenuVisible = ref(false);

function toggleContextMenu() {
  if (contextMenuVisible.value) {
    contextMenuVisible.value = false;
    setTimeout(() => {
      showContextMenu.value = false;
    }, 200); // Duration of the closing animation
  } else {
    showContextMenu.value = true;
    nextTick(() => {
      contextMenuVisible.value = true;
    });
  }
}

const modelTypes = [
  { name: 'claude', display: 'MinimalClaude' },
  { name: 'gpt', display: 'MinimalGPT' },
  { name: 'open-ai-format', display: 'MinimalCustom' },
  { name: 'web-llm', display: 'MinimalLocal' },
  { name: 'general', display: 'No Model Selected' },
];

const visibleModelLinks = computed(() => {
  return modelTypes.filter((modelType) => selectedModel.value.includes(modelType.name));
});

</script>

<template>
  <div class="resize-container">
    <div class="settings-header">
      <h2>
        <span v-if="isSmallScreen">Conversations &nbsp;</span>
        <Database @click.stop="showStoredFiles = !showStoredFiles" v-if="!isSmallScreen" :id="'stored-Files'"
          class="database-icon" />
        <ToolTip :targetId="'stored-Files'" v-if="!isSmallScreen">View Stored Files</ToolTip>
        <a v-for="modelType in visibleModelLinks" :key="modelType.name" id="navLink" v-show="!isSmallScreen"
          href="https://github.com/fingerthief/minimal-chat" target="_blank" class="no-style-link">
          {{ modelType.display }}
          <Github :size="25" class="header-icon" />
        </a>
        <a href="https://github.com/fingerthief/minimal-chat" target="_blank" class="no-style-link">

        </a>
        <MoreHorizontal @blur="showContextMenu = false;" class="context-menu-icon" @click="toggleContextMenu"
          id="contextMenu" :size="25" :stroke-width="1.0" />
        <transition name="fade-slide">
          <div v-show="showContextMenu" class="context-menu">
            <ToolTip :targetId="'purgeConversations'">Purge all conversations</ToolTip>
            <Eraser @click="purgeConversations" id="purgeConversations" :size="25" :stroke-width="1.0" />&nbsp;
            <ToolTip :targetId="'exportConversations'">Export conversations</ToolTip>
            <Download @click="exportConversations" id="exportConversations" :size="25" :stroke-width="1.0" />&nbsp;
            <ToolTip :targetId="'importConversations'">Import conversations</ToolTip>
            <Upload @click="importConversations" id="importConversations" :size="25" :stroke-width="1.0" />
          </div>
        </transition>
        <Settings v-if="!isSmallScreen" @click="toggleSidebar" class="settings-icon" :size="25" />
      </h2>
    </div>
    <div class="sidebar-content-container">
      <div class="scrollable-list">
        <ul>
          <li v-for="(conversation, index) in conversations" :key="index" :id="'conversation-' + index"
            :contenteditable="conversation.isEditing" @click="loadSelectedConversation(conversation)"
            @dblclick="onEditConversationTitle(conversation)" @blur="saveEditedConversationTitle(conversation, $event)"
            :class="{ selected: selectedConversation && selectedConversation.id === conversation.id, deleting: conversation.deleting }">
            <Pencil v-if="isSmallScreen" :id="'pencil-' + index" :size="13"
              @click.stop="onEditConversationTitle(conversation)" />
            <ToolTip :targetId="'conversation-' + index">Double Click to Edit Title</ToolTip>
            <span>&nbsp;
              <Trash :id="'trash-' + index" :size="13" class="trash-icon"
                @click.stop="deleteConversation(conversation.id)" /> &nbsp;{{ conversation.title }}
            </span>
            <span v-if="!conversation.isEditing" class="token-count">
              {{ conversationCharacterCount(conversation) }} Tokens
            </span>
          </li>
          <li @click="startNewConversation" class="new-conversation">
            <span class="new-icon">
              <plus :size="13" />
              &nbsp;<span class="new-text">New Conversation</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div class="bottom-panel">
      <div class="scrollable-list--bottom">
        <ul>
          <li v-show="isSmallScreen" class="new-conversation-option--delete" @click="deleteCurrentConversation">
            <span class="delete-icon">
              <MessageSquareX :stroke-width="1.5" />
              <span class="delete-text">Delete Current Conversation</span>
            </span>
          </li>
          <li v-show="showConversationOptions && isSmallScreen" class="new-conversation-option--settings"
            @click="toggleConversations">
            <span class="settings-icon">
              <Settings :stroke-width="1.5" />
              <span class="settings-text">Close</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$shadow-color: #252629;

.header-icon {
  position: absolute;
  margin-left: 6px;
}

.new-conversation {
  border-top: 1px solid black;
  text-align: center;
  position: relative;
  right: 4%;
}

.token-count {
  font-size: 10px;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 3px;
  height: 100%;
  cursor: col-resize;
  background-color: #212121;
  z-index: 1000;
}


.settings-header {
  font-size: 15px;
  font-weight: bold;
  position: relative;
  padding: 8px;
  text-align: left;
  white-space: nowrap;

  a {
    left: 20px;
    top: 22%;
    position: relative;

    @media (max-width: 600px) {
      background-color: #0a1e24;
      position: relative;
    }
  }

  @media (max-width: 600px) {
    text-align: center;
    top: 16px;
  }

  .context-menu {
    position: absolute;
    top: 40px;
    right: 10px;
    background-color: #1d1e1e;
    border: 1px solid #424045b5;
    border-radius: 5px;
    padding: 10px;
    display: flex;
    z-index: 1;
    flex-direction: column;
    gap: 10px;
  }

  .context-menu-icon {
    display: block;
    float: right;

    @media (max-width: 600px) {
      margin-right: 8px;
    }
  }

  .database-icon {
    display: block;
    position: relative;
    float: left;
    right: 0px;
  }

  .settings-icon {
    display: block;
    position: relative;
    float: left;
    right: -12px;
  }
}


.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.bottom-panel {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  width: 100%;

  @media (max-width: 600px) {
    width: 100%;
  }

  .scrollable-list--bottom {
    max-width: 100%;
    overflow-x: hidden;
    width: 100%;
    height: 22dvh;
    max-height: 22dvh;
    overflow: auto;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    font-size: 14px;
    justify-content: flex-end;

    @media (max-width: 600px) {
      background-color: #1d1e1e;
    }

    .new-conversation-option {
      text-align: left;
      color: #ffffff;
      font-weight: bold;
      border-radius: 5px;
      display: flex;
      cursor: pointer;
      position: relative;
      background-color: #0d1f25a1;
      border-bottom: 2px solid #26622ab5;

      &:hover {
        background-color: #104745;
      }

      &--delete {
        border-bottom: 2px solid #713f3fe8;

        &:hover {
          background-color: #713f3f9d;
        }

        .delete-icon {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 5px;

          .delete-text {
            line-height: 1;
          }
        }
      }

      &--settings {
        border-bottom: 2px solid #725182b5;

        &:hover {
          background-color: #332e3c;
        }

        .settings-icon {
          display: flex;
          align-items: center;
          gap: 10px;

          .settings-text {
            line-height: 1;
          }
        }
      }

      .new-icon {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 5px;

        .new-text {
          line-height: 1;
        }
      }
    }

    ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    li {
      padding: 10px;
      border-bottom: 1px solid #100d0d;
      transition: background-color 0.2s ease;
      user-select: none;

      &:hover {
        background-color: #114335;
      }

      &.selected {
        background-color: #3e3347;
        font-weight: bold;
        box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #513f77;
        animation: pulse 0.15s ease-out forwards;
      }

      &.selected:before {
        content: '\2713';
        display: inline-block;
        margin-right: 10px;
        color: #4cae4c;
      }

      @keyframes pulse {
        0% {
          background-color: #352d458c;
          transform: scale(1);
        }

        50% {
          background-color: #413558;
          transform: scale(1.02);
        }

        100% {
          background-color: #352d458c;
          transform: scale(1);
        }
      }
    }
  }
}

.scale-down-enter-active,
.scale-down-leave-active {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.scale-down-enter-from,
.scale-down-leave-to {
  transform: scale(0);
  opacity: 0;
}

.scale-down-enter-to,
.scale-down-leave-from {
  transform: scale(1);
  opacity: 1;
}


.scrollable-list {
  @media (max-width: 600px) {
    height: 68vh;
    background-color: #1f1f1f;
  }

  max-width: 100%;
  overflow-x: none;
  width: 100%;
  margin-top: 25px;
  height: 77dvh;
  box-sizing: border-box;
  font-size: 14px;

  .new-conversation-option {
    text-align: left;
    background-color: #2b2b2b;
    color: #ffffff;
    font-weight: 600;
    border-radius: 10px;
    padding: 20px;
    display: flex;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

    &:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }

    .new-icon {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-top: 5px;

      .new-text {
        line-height: 1;
      }
    }
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  li {
    padding: 14px;
    border-left: 4px solid transparent;
    color: #eaeaea;
    text-overflow: ellipsis;
    text-wrap: nowrap;
    user-select: none;
    font-size: .875rem;
    animation: slideIn 0.2s linear forwards;

    .token-count {
      display: block;
      margin-top: 3px;
      left: 24px;
      font-size: 0.65rem;
      color: #b0b0b0;
      position: relative;
    }

    &[contenteditable='true'] {
      outline: none;
      border: 2px solid #444444;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      background-color: #2b2b2b;
    }

    &:hover {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      background-color: #252525;
    }

    &:hover .trash-icon {
      display: inline-block;

    }

    .trash-icon {
      display: none;
      cursor: pointer;
      margin-left: 6px;
    }

    &.selected {
      background-color: #242323;
      font-weight: 600;
      box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.2);
      border-left: 4px solid #157474;
      color: #ffffff;
    }

    &.deleting {
      animation: scaleDown 0.5s linear forwards;
    }
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0.4);
  }
}

@keyframes slideIn {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes scaleDown {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  100% {
    transform: scale(0);
    opacity: 0;
  }
}

li.deleting {
  animation: scaleDown 0.2s linear forwards;
}
</style>
