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
              <MessageSquareX :stroke-width="1.5" :size="18" color="rgba(255, 255, 255, 0.95)" />
              <span class="delete-text">Delete Current Conversation</span>
            </span>
          </li>
          <li v-show="showConversationOptions && isSmallScreen" class="new-conversation-option--settings"
            @click="toggleConversations">
            <span class="settings-icon">
              <Settings :stroke-width="1.5" :size="18" color="rgba(255, 255, 255, 0.95)" />
              <span class="settings-text">Close</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Variables for consistent theming
$primary-color: #157474;
$secondary-color: #413558;
$background-dark: #1d1e1e;
$background-darker: #1f1f1f;
$background-lighter: #2b2b2b;
$text-color: #ffffff;
$text-muted: #b0b0b0;
$border-color: #424045;
$shadow-color: #252629;
$transition-speed: 0.2s;
$border-radius: 8px;

// Reusable mixins
@mixin card-shadow {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

@mixin hover-shadow {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

@mixin flex-center {
  display: flex;
  align-items: center;
}

// Core styles
.resize-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header-icon {
  position: absolute;
  margin-left: 6px;
  transition: transform $transition-speed ease;

  &:hover {
    transform: scale(1.1);
  }
}

.new-conversation {
  border-top: 1px solid rgba(0, 0, 0, 0.3);
  text-align: center;
  position: relative;
  padding: 14px !important;
  margin-top: 10px;
  transition: all $transition-speed ease;
  
  @media (min-width: 601px) {
    margin: 10px 8px 0 0;
    border-radius: 0 8px 8px 0 !important;
    border-top: none;
    border-left: 4px solid transparent;
    background-color: rgba(17, 67, 53, 0.35);
  }
  
  @media (max-width: 600px) {
    margin: 10px 0 14px 0;
    border-radius: 8px !important;
    background-color: rgba($primary-color, 0.2);
    border: 1px solid rgba($primary-color, 0.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    padding: 16px !important;
  }

  &:hover {
    background-color: rgba($primary-color, 0.3) !important;
    transform: translateY(-2px);
    @include card-shadow;
    
    @media (min-width: 601px) {
      border-left: 4px solid rgba($primary-color, 0.5);
    }
  }
  
  .new-icon {
    font-weight: 600;
  }
}

.token-count {
  font-size: 0.7rem;
  color: $text-muted;
  opacity: 0.8;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 3px;
  height: 100%;
  cursor: col-resize;
  background-color: rgba($primary-color, 0.3);
  z-index: 1000;

  &:hover {
    background-color: $primary-color;
  }
}

.settings-header {
  font-size: 16px;
  font-weight: bold;
  position: relative;
  padding: 12px 16px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid rgba($border-color, 0.4);
  backdrop-filter: blur(10px);

  h2 {
    margin: 0;
    display: flex;
    align-items: center;
  }

  a {
    position: relative;
    margin-left: 20px;
    transition: opacity $transition-speed ease;

    &:hover {
      opacity: 0.8;
    }

    @media (max-width: 600px) {
      background-color: rgba(10, 30, 36, 0.8);
      position: relative;
    }
  }

  @media (max-width: 600px) {
    text-align: center;
    padding: 16px 8px;
    background-color: rgba($background-dark, 0.9);
    border-bottom: 1px solid rgba($primary-color, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    position: sticky;
    top: 0;
    z-index: 5;
  }

  .context-menu {
    position: absolute;
    top: 40px;
    right: 10px;
    background-color: $background-dark;
    border: 1px solid rgba($border-color, 0.7);
    border-radius: $border-radius;
    padding: 12px;
    display: flex;
    z-index: 10;
    flex-direction: column;
    gap: 14px;
    @include card-shadow;

    svg {
      transition: transform $transition-speed ease;
      cursor: pointer;

      &:hover {
        transform: scale(1.1);
        color: $primary-color;
      }
    }
  }

  .context-menu-icon {
    display: block;
    float: right;
    cursor: pointer;
    transition: transform $transition-speed ease;

    &:hover {
      transform: scale(1.1);
      color: $primary-color;
    }

    @media (max-width: 600px) {
      margin-right: 8px;
    }
  }

  .database-icon {
    display: block;
    position: relative;
    float: left;
    cursor: pointer;
    transition: transform $transition-speed ease;

    &:hover {
      transform: scale(1.1);
      color: $primary-color;
    }
  }

  .settings-icon {
    display: block;
    position: relative;
    float: left;
    right: -12px;
    cursor: pointer;
    transition: transform $transition-speed ease;

    &:hover {
      transform: scale(1.1);
      color: $primary-color;
    }
  }
}

// Transitions
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity $transition-speed ease, transform $transition-speed ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.scale-down-enter-active,
.scale-down-leave-active {
  transition: transform $transition-speed ease, opacity $transition-speed ease;
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

// Bottom panel
.bottom-panel {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  width: 100%;
  border-top: 1px solid rgba($border-color, 0.5);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  z-index: 5;

  // Hide completely on non-mobile screens
  @media (min-width: 601px) {
    display: none;
  }

  @media (max-width: 600px) {
    width: 100%;
  }

  .scrollable-list--bottom {
    max-width: 100%;
    overflow-x: hidden;
    width: 100%;
    height: 18dvh;
    max-height: 18dvh;
    overflow: auto;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    font-size: 14px;
    justify-content: flex-end;
    padding: 6px 8px;

    @media (max-width: 600px) {
      background-color: rgba($background-dark, 0.97);
    }
    
    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba($primary-color, 0.3);
      border-radius: 8px;
      
      &:hover {
        background-color: rgba($primary-color, 0.5);
      }
    }

    .new-conversation-option {
      text-align: left;
      color: $text-color;
      font-weight: bold;
      border-radius: $border-radius;
      display: flex;
      cursor: pointer;
      position: relative;
      background-color: rgba(13, 31, 37, 0.6);
      border-bottom: 2px solid rgba(38, 98, 42, 0.7);
      transition: all $transition-speed ease;

      &:hover {
        background-color: rgba(16, 71, 69, 0.8);
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      }

      &--delete {
        border-radius: 6px;
        border: 1px solid rgba(181, 83, 83, 0.5);
        border-left: 3px solid rgba(230, 85, 85, 0.9);
        background-color: rgba(98, 40, 40, 0.6);
        transition: all $transition-speed ease;
        margin-bottom: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

        &:hover {
          background-color: rgba(149, 64, 64, 0.7);
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .delete-icon {
          @include flex-center;
          gap: 8px;
          padding: 0;
          height: 100%;

          .delete-text {
            line-height: 1.2;
            font-size: 0.85rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            color: rgba(255, 255, 255, 0.95);
          }
        }
      }

      &--settings {
        border-radius: 6px;
        border: 1px solid rgba(132, 94, 165, 0.5);
        border-left: 3px solid rgba(150, 107, 197, 0.9);
        background-color: rgba(61, 45, 80, 0.65);
        transition: all $transition-speed ease;
        margin-bottom: 8px;
        margin-top: 2px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

        &:hover {
          background-color: rgba(78, 63, 103, 0.8);
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .settings-icon {
          @include flex-center;
          gap: 8px;
          padding: 0;
          height: 100%;

          .settings-text {
            line-height: 1.2;
            font-size: 0.85rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            color: rgba(255, 255, 255, 0.95);
          }
        }
      }

      .new-icon {
        @include flex-center;
        gap: 10px;
        margin-top: 5px;
        padding: 10px;

        .new-text {
          line-height: 1.2;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
      }
    }

    ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
      width: 100%;
    }

    li {
      padding: 12px;
      margin-bottom: 6px;
      border-radius: 8px;
      transition: all $transition-speed ease;
      user-select: none;
      cursor: pointer;
      position: relative;
      @include card-shadow;

      &.new-conversation-option--delete {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        width: 90%;
        margin: 0 auto 6px auto;
      }

      &.new-conversation-option--settings {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        width: 90%;
        margin: 0 auto 6px auto;
      }

      &:hover {
        background-color: rgba(17, 67, 53, 0.7);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      }

      &.selected {
        background-color: rgba($secondary-color, 0.5);
        font-weight: bold;
        box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(81, 63, 119, 0.7);
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
          background-color: rgba(53, 45, 69, 0.55);
          transform: scale(1);
        }

        50% {
          background-color: rgba($secondary-color, 0.6);
          transform: scale(1.02);
        }

        100% {
          background-color: rgba(53, 45, 69, 0.55);
          transform: scale(1);
        }
      }
    }
  }
}

// Main scrollable list
.scrollable-list {
  @media (max-width: 600px) {
    height: 72vh;
    background-color: rgba($background-darker, 0.95);
    padding: 4px 6px;
    border-top: 1px solid rgba($border-color, 0.2);
    border-bottom: 1px solid rgba($border-color, 0.2);
  }

  max-width: 100%;
  width: 100%;
  margin-top: 10px;
  box-sizing: border-box;
  font-size: 14px;
  overflow-y: auto;
  overflow-x: hidden;
  
  @media (min-width: 601px) {
    padding: 6px 4px 0 0;
    background-color: rgba($background-darker, 0.5);
    border-radius: 0 0 8px 0;
  }

  &::-webkit-scrollbar {
    width: 6px;
    
    @media (max-width: 600px) {
      width: 5px;
    }
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    
    @media (max-width: 600px) {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba($primary-color, 0.4);
    border-radius: 10px;
    
    &:hover {
      background-color: rgba($primary-color, 0.6);
    }
    
    @media (max-width: 600px) {
      background-color: rgba($primary-color, 0.3);
      border-radius: 8px;
      
      &:hover {
        background-color: rgba($primary-color, 0.5);
      }
    }
  }

  .new-conversation-option {
    text-align: left;
    background-color: $background-lighter;
    color: $text-color;
    font-weight: 600;
    border-radius: $border-radius;
    padding: 16px;
    display: flex;
    cursor: pointer;
    @include card-shadow;
    transition: all $transition-speed ease;

    &:hover {
      @include hover-shadow;
      transform: translateY(-2px);
    }

    .new-icon {
      @include flex-center;
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
    padding: 16px 18px;
    border-left: 4px solid transparent;
    color: $text-color;
    text-overflow: ellipsis;
    text-wrap: nowrap;
    overflow: hidden;
    user-select: none;
    font-size: 0.925rem;
    animation: slideIn $transition-speed ease forwards;
    transition: all $transition-speed ease;
    margin-bottom: 4px;
    cursor: pointer;
    border-radius: 0 4px 4px 0;
    position: relative;
    display: flex;
    flex-direction: column;
    
    @media (min-width: 601px) {
      margin: 0 8px 6px 0;
      border-radius: 0 8px 8px 0;
    }
    
    @media (max-width: 600px) {
      margin: 0 0 8px 0;
      padding: 14px;
      border-radius: 8px;
      border-left: none;
      border-bottom: 1px solid rgba($border-color, 0.15);
      background-color: rgba($background-lighter, 0.3);
    }

    .token-count {
      display: block;
      margin-top: 6px;
      font-size: 0.65rem;
      color: $text-muted;
      position: relative;
      opacity: 0.8;
      transition: opacity $transition-speed ease;
    }

    &[contenteditable='true'] {
      outline: none;
      border: 2px solid rgba(68, 68, 68, 0.7);
      padding: 16px;
      border-radius: $border-radius;
      text-align: center;
      background-color: $background-lighter;
    }

    &:hover {
      @include card-shadow;
      background-color: rgba(37, 37, 37, 0.8);
      transform: translateY(-2px);
      
      .token-count {
        opacity: 1;
      }
      
      @media (max-width: 600px) {
        background-color: rgba($background-lighter, 0.5);
        transform: scale(1.02);
        border-bottom: 1px solid rgba($primary-color, 0.3);
      }
    }

    &:hover .trash-icon {
      display: inline-block;
      animation: fadeIn $transition-speed ease;
    }

    .trash-icon {
      display: none;
      cursor: pointer;
      margin-left: 6px;
      transition: all $transition-speed ease;

      &:hover {
        color: #ff6b6b;
        transform: scale(1.2);
      }
    }

    &.selected {
      background-color: rgba(36, 35, 35, 0.9);
      font-weight: 600;
      box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.2);
      border-left: 4px solid $primary-color;
      color: $text-color;
      
      @media (min-width: 601px) {
        background: linear-gradient(90deg, rgba(21, 116, 116, 0.2) 0%, rgba(36, 35, 35, 0.9) 100%);
      }
      
      @media (max-width: 600px) {
        background-color: rgba($primary-color, 0.2);
        border: 1px solid rgba($primary-color, 0.4);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        position: relative;
        
        &:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background-color: $primary-color;
          border-radius: 4px 0 0 4px;
        }
      }
    }

    &.deleting {
      animation: scaleDown 0.5s linear forwards;
    }
  }
}

// Animations
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
    transform: translateX(-20px);
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
  animation: scaleDown $transition-speed linear forwards;
}
</style>
