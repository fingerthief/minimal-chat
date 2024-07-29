<!-- eslint-disable no-unused-vars -->

<script setup>
import { computed, ref, watch } from 'vue';
import { Menu, Database, Github } from 'lucide-vue-next';
import { isSidebarOpen, showConversationOptions, selectedModel, showStoredFiles, availableModels, localModelName } from '@/libs/state-management/state';
import ContextWindow from '@/components/controls/ContextWindow.vue';
import Dropdown from 'primevue/dropdown';
import { update } from '@/libs/utils/settings-utils';

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
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
  { label: 'GPT-4 Omni', value: 'gpt-4o' },
  { label: 'Custom API Endpoint', value: 'open-ai-format' },
  { label: 'Local Browser Model (Chrome and Edge Only)', value: 'web-llm' },
];

function handleUpdate(field, value) {
  update(field, value);
}
</script>

<template>
  <div class="header box">
    <div class="models-dropdown">
      <div class="control select-dropdown">
        <label for="quick-select-model-selector"></label>
        <Dropdown id="quick-select-model-selector" :options="modelOptions" v-model="selectedModel" optionValue="value"
          optionLabel="label" @change="onModelChange" checkmark />
      </div>
      <div v-if="showCustomModelDropdown" class="control select-dropdown custom-model-dropdown">
        <label for="custom-model-selector"></label>
        <Dropdown id="custom-model-selector" :options="availableModels" v-model="localModelName"
          @change="handleUpdate('localModelName', $event.value)" optionValue="id" optionLabel="name" filter
          placeholder="Select a custom model" />
      </div>
    </div>
    <div class="settings-btn">
      <Menu @click="toggleSidebar" :stroke-width="1" :size="30" />&nbsp;&nbsp;
      <Database @click="() => showStoredFiles = true" :stroke-width="1" :size="30" />
    </div>
    <div class="context-menu-icon">
      <ContextWindow ref="contextWindow" />
    </div>
  </div>
</template>

<style lang="scss">
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


.p-dropdown-filter-icon {
  top: 28%;
}

.p-dropdown {
  background-color: transparent;
  border-bottom: 2px solid #157474;
  border-top: none;
  border-left: none;
  border-right: none;
  margin-left: 20px;
  width: 15vw;
  max-width: 15vw;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;


  &:hover {
    background-color: #262627;
  }

  &:focus {
    outline: none;
  }
}

.models-dropdown {
  position: absolute;
  left: -1%;
  top: -2%;
  background-color: transparent;
  border: none;
  color: $icon-color;
  cursor: pointer;
  outline: none;
  max-width: fit-content;
  display: flex;
  align-items: center;

  .custom-model-dropdown {
    margin-left: -30px;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;

    .custom-model-dropdown {
      margin-left: 0;
      margin-top: 10px;
    }
  }

  transition: background-color 0.15s ease,
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
        background-color 0.15s ease,
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
    background-color 0.15s ease,
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
    background-color 0.15s ease,
    transform 0.2s ease;

  &:hover {
    transform: scale(1.15);
  }

  @media (max-width: 600px) {
    display: inline;
  }
}

.context-menu-icon {
  position: absolute;
  right: 10px;
  top: 28%;
  background-color: transparent;
  border: none;
  color: $icon-color;
  cursor: pointer;
  outline: none;
  display: none;

  transition:
    background-color 0.15s ease,
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
    background-color 0.15s ease,
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
    background-color 0.15s ease,
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
  transition: transform 0.15s;
}

.hover-increase-size:hover {
  transform: scale(1.1);
}
</style>
