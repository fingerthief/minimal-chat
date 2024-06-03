<script setup>
import { onMounted, ref, computed, nextTick } from 'vue';
import { Plus, Eraser, Download, Upload, MessageSquareX, Settings, Pencil, Database, Trash, MoreHorizontal } from 'lucide-vue-next';
import ToolTip from './ToolTip.vue';
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
  if (conversation) {
    const messageHistory = conversation.messageHistory;
    let totalCharacters = 0;

    for (let message of messageHistory) {
      totalCharacters += message.content.length;
    }

    return totalCharacters / 4; // Rough estimation of characters to tokens
  }
  return 0;
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
    conversations.value.splice(index, 1);
    saveMessagesHandler();
    showToast('Conversation Deleted');
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

</script>

<template>
  <div class="resize-container">
    <div class="settings-header">
      <h2>
        <span v-if="isSmallScreen">Conversations &nbsp;</span>
        <Database @click.stop="showStoredFiles = !showStoredFiles" :id="'stored-Files'" class="database-icon" />
        <ToolTip :targetId="'stored-Files'">View Stored Files</ToolTip>
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
        <Settings v-if="!isSmallScreen" @click="toggleSidebar" :size="25" :stroke-width="1.0" />
      </h2>
    </div>
    <div class="sidebar-content-container">
      <div class="scrollable-list">
        <ul>
          <li v-for="(conversation, index) in conversations" :key="index" :id="'conversation-' + index"
            :contenteditable="conversation.isEditing" @click="loadSelectedConversation(conversation)"
            @dblclick="onEditConversationTitle(conversation)" @blur="saveEditedConversationTitle(conversation, $event)"
            :class="{ selected: selectedConversation && selectedConversation.id === conversation.id }">
            <Pencil :id="'pencil-' + index" :size="13" @click.stop="onEditConversationTitle(conversation)" />
            <ToolTip :targetId="'pencil-' + index">Edit title</ToolTip>
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

  @media (max-width: 600px) {
    padding: 25px 0;
    text-align: center;
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
  }

  .database-icon {
    display: block;
    position: relative;
    float: left;
    right: 8px;
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
        animation: pulse 0.25s ease-out forwards;
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

.scrollable-list {
  @media (max-width: 600px) {
    height: 68vh;
    background-color: #1f1f1f;
  }

  max-width: 100%;
  overflow-x: none;
  width: 100%;
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
    transition: box-shadow 0.3s ease, transform 0.2s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

    &:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      transform: translateY(-2px);
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
    transition: box-shadow 0.2s ease, transform 0.2s ease;
    border-left: 4px solid transparent;
    color: #eaeaea;
    text-overflow: ellipsis;
    text-wrap: nowrap;
    user-select: none;
    animation: fadeIn 0.3s ease-out forwards;
    transition: background-color 0.2s ease-out;
    font-size: .875rem;

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
      animation: fadeOut 0.3s ease-out forwards;
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
    transform: scale(0.8);
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
</style>
