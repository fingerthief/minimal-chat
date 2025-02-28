<script setup>
import { onMounted, ref, nextTick, computed } from 'vue';
import { Plus, Eraser, Download, Upload, MessageSquareX, Settings, Pencil, Database, Trash, MoreHorizontal, Github, MessageSquare, X } from 'lucide-vue-next';
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
// Cache for conversation character counts to avoid recalculating
const conversationTokenCache = new Map();

function conversationCharacterCount(conversation) {
  // Return cached result if available and conversation hasn't changed
  const cacheKey = `${conversation.id}-${conversation.messageHistory.length}`;
  if (conversationTokenCache.has(cacheKey)) {
    return conversationTokenCache.get(cacheKey);
  }
  
  let totalTextLength = 0;

  // Optimize the loop by using a direct for loop instead of for...of
  const history = conversation.messageHistory;
  for (let i = 0; i < history.length; i++) {
    const message = history[i];
    if (Array.isArray(message.content)) {
      const content = message.content;
      for (let j = 0; j < content.length; j++) {
        const contentItem = content[j];
        if (contentItem.type === 'text' && contentItem.text) {
          totalTextLength += contentItem.text.length;
        }
      }
    } else if (message.content) {
      totalTextLength += String(message.content).length;
    }
  }

  const tokenCount = Math.ceil(totalTextLength / 4);
  
  // Cache the result
  conversationTokenCache.set(cacheKey, tokenCount);
  
  // Prevent unlimited cache growth by cleaning old entries when cache gets too large
  if (conversationTokenCache.size > 100) {
    const oldestKey = conversationTokenCache.keys().next().value;
    conversationTokenCache.delete(oldestKey);
  }
  
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
  if (confirm("Are you sure you want to delete all conversations?")) {
    localStorage.removeItem('conversations');
    storedConversations.value = [];
    conversations.value = [];
    messages.value = [];
    selectedConversation.value = null;
    lastLoadedConversationId.value = 0;
    // Set a reasonable delay to allow the animation to complete
    setTimeout(() => {
      saveMessagesHandler();
    }, 300);

    showToast('All Conversations Purged');
  }
}

function deleteConversation(conversationId) {
  const conversationIndex = conversations.value.findIndex(
    (conversation) => conversation.id === conversationId
  );

  if (conversationIndex !== -1) {
    const conversation = conversations.value[conversationIndex];
    conversation.deleting = true;

    // Delay actual deletion to allow for animation
    setTimeout(() => {
      conversations.value.splice(conversationIndex, 1);
      if (selectedConversation.value && selectedConversation.value.id === conversationId) {
        // Set selected conversation to the next one if available
        if (conversations.value.length > 0) {
          const nextIndex = Math.min(conversationIndex, conversations.value.length - 1);
          selectedConversation.value = conversations.value[nextIndex];
          messages.value = selectedConversation.value.messageHistory;
        } else {
          selectedConversation.value = null;
          messages.value = [];
        }

        if (conversations.value.length === 0) {
          messages.value = [];
          saveMessagesHandler();
          showToast('Conversation Deleted');
          return;
        }

        saveMessagesHandler();
        loadSelectedConversation(selectedConversation.value);
        showToast('Conversation Deleted');
      }
    }, 200); // Duration of the scaleDown animation
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

function toggleConversations() {
  showConversationOptions.value = !showConversationOptions.value;
}

</script>

<template>
  <div class="conversations-dialog">
    <!-- Header Bar -->
    <div class="dialog-header">
      <div class="header-left">
        <h2>
          <span>Conversations</span>
        </h2>
      </div>
      
      <div class="header-actions">
        <!-- Desktop actions -->
        <div v-if="!isSmallScreen" class="desktop-actions">
          <button class="action-btn" @click.stop="showStoredFiles = !showStoredFiles" id="stored-Files" title="Stored Files">
            <Database :size="20" />
          </button>
          <ToolTip :targetId="'stored-Files'">View Stored Files</ToolTip>
          
          <a class="github-link" href="https://github.com/fingerthief/minimal-chat" target="_blank" title="GitHub">
            <Github :size="20" />
          </a>
          
          <button class="action-btn" @click="() => isSidebarOpen = true" title="Settings">
            <Settings :size="20" />
          </button>
        </div>
        
        <!-- Menu button -->
        <button class="action-btn menu-btn" @click="toggleContextMenu" id="contextMenu">
          <MoreHorizontal :size="20" />
        </button>
        
        <!-- Dropdown menu -->
        <transition name="fade-slide">
          <div v-show="showContextMenu" class="context-menu-dropdown">
            <div class="menu-item" @click="purgeConversations" id="purgeConversations">
              <Eraser :size="18" />
              <span>Purge Conversations</span>
            </div>
            <div class="menu-item" @click="exportConversations" id="exportConversations">
              <Download :size="18" />
              <span>Export Conversations</span>
            </div>
            <div class="menu-item" @click="importConversations" id="importConversations">
              <Upload :size="18" />
              <span>Import Conversations</span>
            </div>
          </div>
        </transition>
      </div>
    </div>
    
    <!-- Conversations List -->
    <div class="conversations-container">
      <div class="conversations-list">
        <ul>
          <!-- Conversation Items -->
          <li v-for="(conversation, index) in conversations" 
              :key="index" 
              :id="'conversation-' + index"
              :contenteditable="conversation.isEditing" 
              @click="loadSelectedConversation(conversation)"
              @dblclick="onEditConversationTitle(conversation)" 
              @blur="saveEditedConversationTitle(conversation, $event)"
              :class="{ 
                selected: selectedConversation && selectedConversation.id === conversation.id, 
                deleting: conversation.deleting,
                editing: conversation.isEditing
              }">
            
            <!-- Conversation Content -->
            <div class="conversation-content">
              <div class="conversation-title">
                <MessageSquare :size="16" class="conversation-icon" />
                {{ conversation.title }}
              </div>
              
              <div class="conversation-actions">
                <span class="token-count">
                  {{ conversationCharacterCount(conversation) }} Tokens
                </span>
                
                <div class="action-icons">
                  <button class="icon-btn edit-btn" @click.stop="onEditConversationTitle(conversation)" 
                     title="Edit Title">
                    <Pencil :size="14" />
                  </button>
                  <button class="icon-btn delete-btn" @click.stop="deleteConversation(conversation.id)"
                    title="Delete Conversation">
                    <Trash :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </li>
          
          <!-- New Conversation Button -->
          <li class="new-conversation-btn" @click="startNewConversation">
            <Plus :size="16" class="plus-icon" />
            <span>New Conversation</span>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Mobile Bottom Panel -->
    <div v-if="isSmallScreen" class="mobile-bottom-panel">
      <button v-show="isSmallScreen" class="bottom-action-btn delete-conversation-btn" 
        @click="deleteCurrentConversation">
        <MessageSquareX :size="18" />
        <span>Delete Current</span>
      </button>
      
      <button v-show="showConversationOptions && isSmallScreen" 
        class="bottom-action-btn close-btn" @click="toggleConversations">
        <X :size="18" />
        <span>Close</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Variables
$primary-color: #157474;
$primary-light: #1a8f8f;
$primary-dark: #0f5454;
$bg-dark: #1d1e1e;
$bg-darker: #1b1b1b;
$bg-lighter: #2b2b2b;
$text-color: #ffffff;
$text-muted: #b0b0b0;
$header-bg: #212121;
$border-color: rgba(21, 116, 116, 0.5);
$danger-color: #e74c3c;
$warning-color: #f39c12;
$success-color: #27ae60;
$border-radius: 8px;
$transition-speed: 0.2s;

// Animations
@keyframes pulse {
  0% { box-shadow: 0 2px 8px rgba(21, 116, 116, 0.2); }
  100% { box-shadow: 0 2px 16px rgba(21, 116, 116, 0.4); }
}

@keyframes scaleDown {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0); opacity: 0; }
}

@keyframes gentle-pulse {
  0% { box-shadow: 0 4px 12px rgba(21, 116, 116, 0.2); }
  100% { box-shadow: 0 4px 15px rgba(21, 116, 116, 0.4); }
}

// Main container
.conversations-dialog {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-dark;
  position: relative;
  margin: 0;
  padding: 0; 
  
  @media (max-width: 600px) {
    height: 100vh;
    max-height: 100vh;
  }
}

// Header section
.dialog-header {
  background-color: $header-bg;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid $border-color;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  
  .header-left {
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: $text-color;
      display: flex;
      align-items: center;
      
      @media (max-width: 600px) {
        font-size: 17px;
      }
    }
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    
    .desktop-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .github-link {
      display: flex;
      align-items: center;
      justify-content: center;
      color: $text-muted;
      text-decoration: none;
      padding: 6px;
      border-radius: 6px;
      transition: all $transition-speed ease;
      
      &:hover {
        color: $text-color;
        background-color: rgba($primary-color, 0.15);
      }
    }
    
    .action-btn {
      background: transparent;
      border: none;
      color: $text-muted;
      padding: 6px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all $transition-speed ease;
      
      &:hover {
        background-color: rgba($primary-color, 0.15);
        color: $text-color;
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
    
    .menu-btn {
      position: relative;
      z-index: 11;
    }
    
    // Dropdown menu
    .context-menu-dropdown {
      position: absolute;
      top: 40px;
      right: 0;
      background-color: $bg-darker;
      border: 1px solid rgba($primary-color, 0.3);
      border-radius: $border-radius;
      width: 200px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 10;
      overflow: hidden;
      
      .menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        transition: background-color $transition-speed ease;
        cursor: pointer;
        
        &:hover {
          background-color: rgba($primary-color, 0.15);
        }
        
        svg {
          color: $primary-color;
          opacity: 0.9;
        }
        
        span {
          font-size: 14px;
        }
      }
    }
  }
}

// Conversations list container
.conversations-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    width: 6px;
    
    @media (max-width: 600px) {
      width: 5px;
    }
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba($primary-color, 0.4);
    border-radius: 10px;
    
    &:hover {
      background-color: rgba($primary-color, 0.6);
    }
  }
  
  // Conversations list
  .conversations-list {
    ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
      
      // Conversation item
      li {
        border-radius: $border-radius;
        cursor: pointer;
        margin-bottom: 8px;
        transition: all $transition-speed ease;
        overflow: hidden;
        
        &.editing {
          outline: none;
          border: 2px solid rgba($primary-color, 0.6);
          padding: 16px;
          border-radius: $border-radius;
          text-align: center;
          background-color: rgba($bg-lighter, 0.5);
        }
        
        &:not(.new-conversation-btn) {
          background-color: rgba($bg-lighter, 0.3);
          border-left: 3px solid transparent;
          
          &:hover {
            background-color: rgba($bg-lighter, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
          }
          
          &.selected {
            background-color: rgba($primary-color, 0.15);
            border-left: 3px solid $primary-color;
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
            
            &:hover {
              background-color: rgba($primary-color, 0.2);
            }
          }
          
          &.deleting {
            animation: scaleDown $transition-speed linear forwards;
          }
        }
        
        // Conversation content
        .conversation-content {
          padding: 14px;
          
          .conversation-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 15px;
            word-break: break-word;
            
            .conversation-icon {
              color: $primary-color;
              opacity: 0.8;
              flex-shrink: 0;
            }
          }
          
          .conversation-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 8px;
            
            .token-count {
              font-size: 12px;
              color: $text-muted;
              background-color: rgba($bg-darker, 0.5);
              padding: 2px 8px;
              border-radius: 4px;
            }
            
            .action-icons {
              display: flex;
              gap: 8px;
              
              .icon-btn {
                background: transparent;
                border: none;
                color: $text-muted;
                padding: 5px;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all $transition-speed ease;
                
                &:hover {
                  background-color: rgba($bg-darker, 0.6);
                  
                  &.edit-btn {
                    color: $warning-color;
                  }
                  
                  &.delete-btn {
                    color: $danger-color;
                  }
                }
              }
            }
          }
        }
        
        // New conversation button
        &.new-conversation-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background-color: rgba($primary-color, 0.1);
          padding: 14px;
          border: 1px dashed rgba($primary-color, 0.3);
          margin-top: 12px;
          margin-bottom: 24px;
          
          .plus-icon {
            color: $primary-color;
          }
          
          span {
            font-weight: 500;
          }
          
          &:hover {
            background-color: rgba($primary-color, 0.2);
            border-color: rgba($primary-color, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba($primary-color, 0.2);
          }
          
          &:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba($primary-color, 0.15);
          }
        }
      }
    }
  }
}

// Mobile bottom panel
.mobile-bottom-panel {
  display: flex;
  padding: 10px;
  background-color: $bg-darker;
  border-top: 1px solid rgba($primary-color, 0.2);
  gap: 10px;
  
  .bottom-action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: $bg-lighter;
    border: none;
    color: $text-color;
    padding: 12px;
    border-radius: $border-radius;
    cursor: pointer;
    font-size: 14px;
    transition: all $transition-speed ease;
    
    svg {
      color: $text-muted;
    }
    
    &.delete-conversation-btn {
      background-color: rgba($danger-color, 0.1);
      border: 1px solid rgba($danger-color, 0.2);
      
      &:hover {
        background-color: rgba($danger-color, 0.2);
        border-color: rgba($danger-color, 0.3);
      }
      
      svg {
        color: rgba($danger-color, 0.8);
      }
    }
    
    &.close-btn {
      background-color: rgba($primary-color, 0.1);
      border: 1px solid rgba($primary-color, 0.2);
      
      &:hover {
        background-color: rgba($primary-color, 0.2);
        border-color: rgba($primary-color, 0.3);
      }
      
      svg {
        color: rgba($primary-color, 0.8);
      }
    }
    
    &:hover {
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
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
</style>