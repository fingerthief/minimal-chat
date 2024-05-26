<!-- eslint-disable no-unused-vars -->

<script setup>
import { computed, ref } from 'vue';
import { Menu, ArchiveX, MessagesSquare, Github, MessageSquarePlus } from 'lucide-vue-next';
import { deleteCurrentConversation } from '@/libs/conversation-management/useConversations';
import { isSidebarOpen, showConversationOptions, selectedModel } from '@/libs/state-management/state';

// Define props
const props = defineProps({
  storedConversations: Array,
});

const emit = defineEmits(['toggle-sidebar', 'toggle-conversations', 'delete-conversation', 'new-conversation', 'change-model']);

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

async function onModelChange(newModel) {
  selectedModel.value = newModel.target.value;
}
</script>

<template>
  <div class="header box">
    <a v-for="modelType in visibleModelLinks" :key="modelType.name" id="navLink"
      href="https://github.com/fingerthief/minimal-chat" target="_blank" class="no-style-link">
      {{ modelType.display }}
    </a>
    <a href="https://github.com/fingerthief/minimal-chat" target="_blank" class="no-style-link">
      <Github :size="20" :stroke-width="2.5" class="header-icon" />
    </a>
    <div class="models-dropdown">
      <div class="control select-dropdown">
        <label for="quick-select-model-selector"></label>
        <select id="quick-select-model-selector" :value="selectedModel" @change="onModelChange">
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-4o">GPT-4 Omni</option>
          <option value="claude-3-opus-20240229">Claude 3 Opus</option>
          <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
          <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
          <option value="open-ai-format">Custom API Endpoint</option>
          <option value="web-llm">Local Browser Model (Chrome and Edge Only)</option>
        </select>
      </div>
    </div>
    <div class="settings-btn" @click="toggleSidebar">
      <Menu :stroke-width="0.5" :size="30" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* Add your component-specific styles here */
$icon-color: rgb(187, 187, 187);
$shadow-color: #252629;
$shadow-offset-x: 0px;
$shadow-offset-y: 1px;
$shadow-blur-radius: 2px;
$shadow-spread-radius: 0px;

.control {
  margin-bottom: 15px;
  padding-bottom: 15px;
}

.chevron {
  top: 10px;
  position: absolute;
}

.models-dropdown {
  position: absolute;
  left: -2%;
  top: -2%;
  background-color: transparent;
  border: none;
  color: $icon-color;
  cursor: pointer;
  outline: none;
  max-width: fit-content;

  transition:
    background-color 0.3s ease,
    transform 0.2s ease;

  .select-dropdown {
    select {
      appearance: none;
      color: whitesmoke;
      background-color: transparent;
      margin-top: 6px;
      padding: 6px;
      border-bottom: 2px solid rgba(83, 56, 101, 0.7882352941);
      border-top: none;
      border-left: none;
      border-right: none;
      max-width: 80%;
      cursor: pointer;
      font-size: 16px;
      transition:
        background-color 0.3s ease,
        transform 0.2s ease;

      &:hover {
        background-color: #262627;
      }

      &:focus {
        outline: none;
      }
    }

    option {
      background-color: #222;
      outline: none;
      border: 0px;
      color: #fff;
    }
  }

  @media (max-width: 600px) {
    display: none;
  }
}

.saved-conversations {
  display: none;
}

.saved-conversations--visible {
  display: flex;
}

.box {
  box-shadow: $shadow-offset-x $shadow-offset-y $shadow-blur-radius $shadow-spread-radius $shadow-color;
}

.header {
  background-color: #212121;
  min-height: 50px;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid #4e386587;
  text-align: center;
  position: relative; // Add this line
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  a {
    top: 22%;
    position: relative;

    @media (max-width: 600px) {
      background-color: #0a1e24;
      position: relative;
    }
  }
}

.header-icon {
  top: 6%;
  position: relative;
}

.conversations-count {
  display: contents;
  position: relative;
  left: 0px;

  .count-icon {
    padding: 2px;
    top: 18%;
    right: 11px;
    color: $icon-color;
    float: right;
    position: relative;
  }
}

.save-icon {
  display: none;
  padding: 2px;
  top: 10%;
  right: 10px;
  color: $icon-color;
  float: right;
  position: relative;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    transform: scale(1.15);
  }

  @media (max-width: 600px) {
    display: inline;
  }
}

.settings-btn {
  position: absolute;
  left: 10px;
  top: 18%;
  background-color: transparent;
  border: none;
  color: $icon-color;
  cursor: pointer;
  outline: none;
  display: none;

  transition:
    background-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    transform: scale(1.15);
  }

  @media (max-width: 600px) {
    display: inline;
  }
}

.saved-conversations-dropdown {
  position: absolute;
  top: 17%;
  right: 55px;
  cursor: pointer;
  color: $icon-color;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  display: none;

  &:hover {
    transform: scale(1.15);
  }

  @media (max-width: 600px) {
    display: inline;
  }
}

.saved-conversations-dropdown select {
  padding: 6px 12px;
  font-size: 14px;
  border: 1px solid #5a5a5a;
  border-radius: 4px;
  background-color: #3a3a3a;
  color: #f1f1f1;
  /* Change the text color to a lighter shade */
  cursor: pointer;
}

.saved-conversations-dropdown select:focus {
  outline: none;
  /* Remove the default focus outline */
  box-shadow: 0 0 0 1px #5a5a5a;
}

.trash-btn {
  position: absolute;
  left: 50px;
  top: 18%;
  color: $icon-color;
  display: none;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    transform: scale(1.15);
  }

  @media (max-width: 600px) {
    display: inline;
  }
}

.clearfix::after {
  content: '';
  clear: both;
  display: table;
}

.clear-button {
  width: 72%;
  margin-bottom: 10px;
  padding: 5px 10px;
}

.no-style-link {
  text-decoration: none;
  color: inherit;
}

.hover-increase-size {
  cursor: pointer;
  transition: transform 0.3s;
}

.hover-increase-size:hover {
  transform: scale(1.1);
}
</style>
