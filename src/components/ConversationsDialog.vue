<script setup>
import { onMounted, ref, computed, nextTick } from 'vue';
import { Eraser, Download, Upload, MessageSquarePlus, MessageSquareX, Settings, Pencil, Database } from 'lucide-vue-next';
import ToolTip from './ToolTip.vue';
import {
  conversations,
  selectedConversation,
  showConversationOptions,
  messages,
  lastLoadedConversationId,
  storedConversations,
  isSidebarOpen,
} from '@/libs/state-management/state';
import { deleteCurrentConversation, editConversationTitle } from '@/libs/conversation-management/useConversations';
import { showToast } from '@/libs/utils/general-utils';
import { selectConversation } from '@/libs/conversation-management/conversations-management';
// State
const loadedConversation = ref({});
let initialConversation = '';

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


</script>
<template>
  <div class="resize-container">
    <div class="settings-header">
      <h2>
        Conversations &nbsp;
        <ToolTip :targetId="'purgeConversations'"> Purge all conversations</ToolTip>
        <Eraser @click="purgeConversations" id="purgeConversations" :size="25" :stroke-width="1.0" />&nbsp;
        <ToolTip :targetId="'exportConversations'"> Export conversations</ToolTip>
        <Download @click="exportConversations" id="exportConversations" :size="25" :stroke-width="1.0" />&nbsp;
        <ToolTip :targetId="'importConversations'"> Import conversations</ToolTip>
        <Upload @click="importConversations" id="importConversations" :size="25" :stroke-width="1.0" />
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
            <span> &nbsp;{{ conversation.title }} </span>
            <br /><br />
            <span v-if="!conversation.isEditing">
              <Database :size="13" />
              &nbsp;
              {{ conversationCharacterCount(conversation) }} Tokens
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div class="bottom-panel">
      <div class="scrollable-list--bottom">
        <ul>
          <li class="new-conversation-option" @click="startNewConversation">
            <span class="new-icon">
              <MessageSquarePlus :stroke-width="1.5" />
              <span class="new-text">Start New Conversation</span>
            </span>
          </li>
          <li class="new-conversation-option--delete" @click="deleteCurrentConversation">
            <span class="delete-icon">
              <MessageSquareX :stroke-width="1.5" />
              <span class="delete-text">Delete Current Conversation</span>
            </span>
          </li>
          <li v-if="!showConversationOptions" class="new-conversation-option--settings" @click="toggleSidebar">
            <span class="settings-icon">
              <Settings :stroke-width="1.5" />
              <span class="settings-text">Settings</span>
            </span>
          </li>
          <li v-if="showConversationOptions" class="new-conversation-option--settings" @click="toggleConversations">
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
  padding: 10px 22px;
  background-color: #1d1e1e;
  text-align: left;
  white-space: nowrap;
  border-bottom: 5px solid #424045b5;

  @media (max-width: 600px) {

    padding: 25px 0;
    text-align: center;
  }
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
    background-color: #1d1e1e;
  }

  max-width: 100%;
  overflow-x: hidden;
  width: 100%;
  height: 77dvh;
  overflow: auto;
  box-sizing: border-box;
  font-size: 12px;

  .new-conversation-option {
    text-align: left;
    background-color: #0a1e24b0;
    color: #ffffff;
    font-weight: bold;
    border-radius: 5px;
    padding: 15px;
    display: flex;
    cursor: pointer;

    &:hover {
      background-color: #104745aa;
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
    padding: 6px;
    border-bottom: 1px solid #77737b69;
    background-color: #313131a1;
    transition: background-color 0.2s ease;
    border-left: 6px solid #3a3a3a;
    color: #9e9d9d;
    user-select: none;
    animation: slideIn 0.25s ease-out forwards;
    /* Add this line */

    &[contenteditable='true'] {
      outline: none;
      border: 2px solid #423d42;
      padding: 15px;
      border-radius: 5px;
      text-align: center;
    }

    &:hover {
      background-color: #0d3837aa;
    }

    &.selected {
      background-color: #0f2f31;
      font-weight: bold;
      box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.1);
      border-left: 6px solid #02af75d5;
      color: whitesmoke;
    }

    &.deleting {
      /* Add this block */
      animation: scaleDown 0.25s ease-out forwards;
    }
  }
}


@keyframes slideIn {
  0% {
    transform: translateX(-100%);
    /* Start off-screen to the left */
    opacity: 0;
    /* Optional: Start with 0 opacity */
  }

  100% {
    transform: translateX(0);
    /* End at the original position */
    opacity: 1;
    /* Optional: End with full opacity */
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
