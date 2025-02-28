<!-- eslint-disable no-unused-vars -->

<script setup>
import { computed, ref, watch } from 'vue';
import { Menu, Database, Github, Settings } from 'lucide-vue-next';
import { isSidebarOpen, showConversationOptions, selectedModel, showStoredFiles, availableModels, localModelName, modelDisplayName } from '@/libs/state-management/state';
import ContextWindow from '@/components/controls/ContextWindow.vue';
import Dropdown from 'primevue/dropdown';
import { update } from '@/libs/utils/settings-utils';
import { determineModelDisplayName } from '@/libs/utils/general-utils';

// Define props
const props = defineProps({
  storedConversations: Array,
});

const contextWindow = ref(null);

const emit = defineEmits(['toggle-sidebar', 'toggle-conversations', 'delete-conversation', 'new-conversation', 'change-model']);

const showCustomModelDropdown = computed(() => selectedModel.value.includes('open-ai-format'));

const selectedCustomModel = ref('');

watch(selectedCustomModel, (newValue) => {
  if (newValue) {
    // You might want to update the selectedModel or emit an event here
    console.log('Selected custom model:', newValue);
  }
});

function toggleSidebar() {
  event.stopPropagation();
  isSidebarOpen.value = !isSidebarOpen.value;
}

function clearMessages() {
  // Implement message clearing logic
  emit('new-conversation');
}

function onShowConversationsClick() {
  event.stopPropagation();
  showConversationOptions.value = !showConversationOptions.value;
}

async function onModelChange(event) {
  selectedModel.value = event.value;
}

const modelOptions = [
  { label: 'Custom API Endpoint', value: 'open-ai-format' },
  { label: 'Local Browser Model (Chrome and Edge Only)', value: 'web-llm' },
];

function handleUpdate(field, value) {
  update(field, value);
}
</script>

<template>
  <div class="header">
    <!-- Desktop View -->
    <div class="header-content desktop-only">
      <div class="model-selectors">
        <div class="model-dropdown">
          <Dropdown id="quick-select-model-selector" 
                    :options="modelOptions" 
                    v-model="selectedModel" 
                    optionValue="value"
                    optionLabel="label" 
                    @change="onModelChange" 
                    class="primary-dropdown" />
        </div>
        
        <div v-if="showCustomModelDropdown" class="model-dropdown custom-model-dropdown">
          <Dropdown id="custom-model-selector" 
                    :options="availableModels" 
                    v-model="localModelName"
                    @change="handleUpdate('localModelName', $event.value)" 
                    optionValue="id" 
                    optionLabel="name" 
                    filter
                    placeholder="Select a custom model"
                    class="secondary-dropdown" />
        </div>
      </div>
      
      <div class="app-title">
        <h1>Minimal Chat</h1>
      </div>
      
      <div class="header-actions">
        <button class="action-btn" @click="() => showStoredFiles = true" title="Stored Files">
          <Database size="20" />
        </button>
        <button class="action-btn" @click="toggleSidebar" title="Settings">
          <Settings size="20" />
        </button>
        <div class="context-action">
          <ContextWindow ref="contextWindow" />
        </div>
      </div>
    </div>
    
    <!-- Mobile View -->
    <div class="header-content mobile-only">
      <div class="header-left">
        <button class="action-btn" @click="toggleSidebar">
          <Menu size="24" />
        </button>
      </div>
      
      <div class="header-center">
        <h1 class="app-title-mobile">Minimal Chat</h1>
      </div>
      
      <div class="header-right">
        <button class="action-btn" @click="() => showStoredFiles = true">
          <Database size="22" />
        </button>
        <div class="context-action">
          <ContextWindow ref="contextWindow" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Variables
$primary-color: #157474;
$primary-dark: #0f5454;
$primary-light: #1a8f8f;
$background-dark: #1d1e1e;
$background-header: #212121;
$header-border: #157474;
$icon-color: #d8d8d8;
$text-color: #ffffff;
$transition-speed: 0.2s;
$border-radius: 8px;

// Desktop/Mobile display helpers
.desktop-only {
  @media (max-width: 600px) {
    display: none !important;
  }
}

.mobile-only {
  display: none !important;
  
  @media (max-width: 600px) {
    display: flex !important;
  }
}

// Header styling
.header {
  background-color: $background-header;
  width: 100%;
  position: relative;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid rgba($primary-color, 0.5);
}

// Desktop header
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  
  &.desktop-only {
    .model-selectors {
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: 40%;
    }
    
    .app-title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      
      h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: $text-color;
        letter-spacing: 0.5px;
      }
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
}

// Mobile header
.header-content.mobile-only {
  height: 56px;
  padding: 0 16px;
  
  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .header-center {
    .app-title-mobile {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: $text-color;
    }
  }
}

// Action buttons
.action-btn {
  background: transparent;
  border: none;
  color: $icon-color;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-speed ease;
  
  &:hover {
    background-color: rgba($primary-color, 0.15);
    color: lighten($icon-color, 10%);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0) scale(0.95);
  }
}

// Dropdown styling
.model-dropdown {
  min-width: 180px;
  position: relative;
  
  :deep(.p-dropdown) {
    background-color: rgba($background-dark, 0.3);
    border: 1px solid rgba($primary-color, 0.3);
    border-radius: $border-radius;
    width: 100%;
    font-size: 14px;
    height: 36px;
    transition: all $transition-speed ease;
    
    &:hover {
      border-color: rgba($primary-color, 0.7);
      background-color: rgba($background-dark, 0.5);
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
    }
    
    .p-dropdown-label {
      padding: 8px 12px;
      color: $text-color;
    }
    
    .p-dropdown-trigger {
      width: 36px;
      color: $primary-color;
    }
    
    .p-dropdown-panel {
      background-color: $background-dark;
      border: 1px solid rgba($primary-color, 0.5);
      border-radius: $border-radius;
      
      .p-dropdown-items-wrapper {
        .p-dropdown-item {
          padding: 10px 12px;
          color: $text-color;
          transition: background-color $transition-speed ease;
          
          &:hover {
            background-color: rgba($primary-color, 0.15);
          }
          
          &.p-highlight {
            background-color: rgba($primary-color, 0.25);
            color: $text-color;
          }
        }
      }
    }
  }
  
  &.custom-model-dropdown {
    :deep(.p-dropdown) {
      font-size: 13px;
      padding-right: 8px;
      
      .p-dropdown-label {
        padding: 8px 10px;
      }
    }
  }
}
</style>
