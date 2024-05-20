// ChatLayout.vue

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import { showToast, determineModelDisplayName, updateUI, handleDoubleClick } from '@/libs/utils';
import {
  setSystemPrompt,
  deleteMessageFromHistory,
  regenerateMessageResponse,
  editPreviousMessage as EditPreviousMessageValue,
  handleExportConversations
} from '@/libs/conversations-management';
import { uploadFileContentsToCoversation, uploadFile, imageInputChanged } from '@/libs/file-processing';
import { sendMessage, visionimageUploadClick } from '@/libs/message-processing';
import messageItem from '@/components/message-item.vue';
import chatInput from '@/components/chat-input.vue';
import chatHeader from '@/components/chat-header.vue';
import settingsDialog from '@/components/settings-dialog.vue';
import conversationsDialog from '@/components/conversations-dialog.vue';
import { engine } from '@/libs/web-llm-access';
import {
  shouldShowScrollButton,
  userText,
  isLoading,
  hasFilterText,
  selectedModel,
  isSidebarOpen,
  showConversationOptions,
  messages,
  streamedMessageText,
  modelDisplayName,
  localModelKey,
  localModelName,
  localModelEndpoint,
  localSliderValue,
  gptKey,
  sliderValue,
  claudeKey,
  claudeSliderValue,
  selectedDallEImageCount,
  selectedDallEImageResolution,
  selectedAutoSaveOption,
  browserModelSelection,
  maxTokens,
  top_P,
  repetitionPenalty,
  systemPrompt,
  abortController,
  imageInput,
} from '@/libs/state';
import { setupWatchers } from '@/libs/watchers';
import { useConversations } from '@/libs/useConversations';

//#region UI Updates
const updateUserText = (newText) => {
  userText.value = newText;
};

function updateUIWrapper(content, autoScrollBottom = true, appendTextValue = true) {
  updateUI(content, messages.value, addMessage, autoScrollBottom, appendTextValue);
}

function toggleSidebar() {
  event.stopPropagation();
  isSidebarOpen.value = !isSidebarOpen.value;
}
//#endregion

//#region Conversation Handling
const {
  conversations,
  storedConversations,
  lastLoadedConversationId,
  selectedConversation,
  deleteCurrentConversation,
  saveMessagesHandler,
  selectConversationHandler,
  editConversationTitle,
} = useConversations();

async function startNewConversation() {
  selectedConversation.value = null;
  messages.value = [];

  showToast('Conversation Saved');
}

function handleImportConversations() {
  openFileSelector();
}

function handlePurgeConversations() {
  localStorage.setItem('gpt-conversations', '');
  messages.value = [];
  conversations.value = [];
  storedConversations.value = [];
  showToast('All Conversations Deleted.');
}

function showConversations() {
  event.stopPropagation();
  showConversationOptions.value = !showConversationOptions.value;
}
//#endregion

//#region Messages Handling
async function addMessage(role, message) {
  setSystemPrompt(messages.value, systemPrompt.value);

  const maxId = messages.value.reduce((max, message) => Math.max(max, message.id), 0);
  const newMessageId = maxId + 1;

  messages.value.push({ id: newMessageId, role, content: message });
}

function handleDeleteMessage(content) {
  messages.value = deleteMessageFromHistory(messages.value, content);
  saveMessagesHandler();
}

async function regenerateMessageResponseHandler(content) {
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
    claudeSliderValue.value,
    updateUIWrapper,
    abortController,
    streamedMessageText
  );

  isLoading.value = false;
  messages.value = result.baseMessages;
  selectedConversation.value.messageHistory = messages.value;
  saveMessagesHandler();
}

async function EditPreviousMessage(oldContent, newContent) {
  isLoading.value = true;
  setSystemPrompt(messages.value, systemPrompt.value);

  const result = await EditPreviousMessageValue(
    conversations.value,
    messages,
    oldContent,
    newContent,
    sliderValue.value,
    selectedModel.value,
    localSliderValue.value,
    localModelName.value,
    localModelEndpoint.value,
    claudeSliderValue.value,
    updateUIWrapper,
    abortController,
    streamedMessageText
  );

  messages.value = [...result.baseMessages];
  selectedConversation.value.messageHistory = messages.value;
  isLoading.value = false;
  saveMessagesHandler();
}

async function handleMessageSending() {
  isLoading.value = true;
  await processMessageSending();
  isLoading.value = false;
}

async function processMessageSending() {
  await sendMessage(
    event,
    userText.value,
    messages.value,
    selectedModel.value,
    claudeSliderValue.value,
    sliderValue.value,
    localModelName.value,
    localSliderValue.value,
    localModelEndpoint.value,
    updateUIWrapper,
    addMessage,
    saveMessagesHandler,
    imageInput.value
  );
}

async function visionimageUploadClickHandler() {
  await visionimageUploadClick(
    userText,
    messages,
    selectedModel,
    claudeSliderValue,
    sliderValue,
    localModelName,
    localSliderValue,
    localModelEndpoint,
    updateUIWrapper,
    addMessage,
    saveMessagesHandler,
    imageInput
  );
}
//#endregion

//#region File/Upload Handling
function importFileClick() {
  document.getElementById('fileImportUpload').click();
}

function openFileSelector() {
  document.getElementById('fileUpload').click();
}

async function imageInputChangedHandler(event) {
  await imageInputChanged(event, userText, messages, selectedModel, localModelName, localModelEndpoint, addMessage, saveMessagesHandler, isLoading);
}
//#endregion

//#region Swipe Events
function swipedLeft(event) {
  isSidebarOpen.value = false;
  showConversationOptions.value = !showConversationOptions.value;
}

function swipedRight(event) {
  showConversationOptions.value = false;
  isSidebarOpen.value = !isSidebarOpen.value;
}
//#endregion

//#region Utils
const refs = {
  selectedModel,
  localModelName,
  localModelEndpoint,
  localSliderValue,
  gptKey,
  sliderValue,
  claudeKey,
  claudeSliderValue,
  selectedDallEImageCount,
  selectedDallEImageResolution,
  selectedAutoSaveOption,
  maxTokens,
  top_P,
  repetitionPenalty,
  browserModelSelection,
  localModelKey,
  systemPrompt,
};

const updateSetting = (field, value) => {
  if (field in refs) {
    refs[field].value = value;
  }
};

function abortStream() {
  if (engine !== undefined && selectedModel.value.includes('web-llm')) {
    engine.interruptGenerate();
    showToast('Aborted response stream');
    return;
  }

  if (abortController.value) {
    abortController.value.abort();
    abortController.value = null;
    isLoading.value = false;
  }
}

async function onModelChange(newModel) {
  selectedModel.value = newModel;
}
//#endregion

//#region Global Click Handling
function handleGlobalClick(event) {
  const settingsDialogElement = document.getElementById('settings-dialog');
  const conversationsDialogElement = document.getElementById('conversations-dialog');

  if (settingsDialogElement && !settingsDialogElement.contains(event.target) && isSidebarOpen.value) {
    isSidebarOpen.value = false;
  }
  if (conversationsDialogElement && !conversationsDialogElement.contains(event.target) && showConversationOptions.value) {
    showConversationOptions.value = false;
  }
}

const sidebarContentContainer = ref(null);

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick);
});

function convertConversations(oldConversations) {
  return oldConversations.map((oldConversation) => ({
    id: oldConversation.id,
    title: oldConversation?.conversation?.title,
    messageHistory: oldConversation?.conversation?.messageHistory,
  }));
}
//#endregion

onMounted(() => {
  if (!localStorage.getItem('hasConvertedConversations')) {
    let oldConversationsStyle = loadConversationTitles();
    localStorage.setItem('gpt-conversations', JSON.stringify(convertConversations(oldConversationsStyle)));
    conversations.value = loadConversationTitles();
    localStorage.setItem('hasConvertedConversations', true);
  }

  sidebarContentContainer.value = document.querySelector('.sidebar-conversations');
  sidebarContentContainer.value.style.width = '420px';
  selectedModel.value = localStorage.getItem('selectedModel') || 'gpt-4o';
  modelDisplayName.value = determineModelDisplayName(selectedModel.value);
  selectConversationHandler(lastLoadedConversationId.value || conversations.value[0]?.id);
  document.addEventListener('click', handleGlobalClick);
  setupWatchers();
});
</script>

<template>
  <!-- File Upload -->
  <div id="fileUploadDiv">
    <input type="file" id="fileUpload" style="display: none"
      @change="(event) => uploadFile(event, conversations, selectConversationHandler)" />
    <input type="file" id="fileImportUpload" style="display: none"
      @change="(event) => uploadFileContentsToCoversation(event, userText, addMessage)" />
    <div @click="openFileSelector" style="display: none">Upload File</div>
    <div @click="importFileClick" style="display: none">Import File</div>
    <input id="imageInput" ref="imageInput" @change="imageInputChangedHandler" style="display: none" type="file" />
  </div>
  <div class="app-body">
    <!-- App Container -->
    <div class="app-container" id="app-container">
      <!-- Overlay for dimming effect -->
      <div class="overlay" v-show="isSidebarOpen || showConversationOptions"></div>

      <!-- Settings Sidebar -->
      <div class="sidebar-common sidebar-left" id="settings-dialog" :class="{ open: isSidebarOpen }">
        <settingsDialog :isSidebarOpen="isSidebarOpen" :selectedModel="selectedModel" :localModelName="localModelName"
          :localModelEndpoint="localModelEndpoint" :localSliderValue="localSliderValue" :gptKey="gptKey"
          :sliderValue="sliderValue" :claudeKey="claudeKey" :claudeSliderValue="claudeSliderValue"
          :browserModelSelection="browserModelSelection" :selectedDallEImageCount="selectedDallEImageCount"
          :selectedDallEImageResolution="selectedDallEImageResolution" :selectedAutoSaveOption="selectedAutoSaveOption"
          :maxTokens="maxTokens" :top_P="top_P" :repetitionPenalty="repetitionPenalty" :localModelKey="localModelKey"
          :systemPrompt="systemPrompt" @update:systemPrompt="updateSetting('systemPrompt', $event)"
          @update:maxTokens="updateSetting('maxTokens', $event)"
          @update:browserModelSelection="updateSetting('browserModelSelection', $event)"
          @update:repetitionPenalty="updateSetting('repetitionPenalty', $event)"
          @update:top_P="updateSetting('top_P', $event)" @update:model="updateSetting('selectedModel', $event)"
          @update:localModelName="updateSetting('localModelName', $event)"
          @update:localModelEndpoint="updateSetting('localModelEndpoint', $event)"
          @update:localModelKey="updateSetting('localModelKey', $event)"
          @update:localSliderValue="updateSetting('localSliderValue', $event)"
          @update:gptKey="updateSetting('gptKey', $event)" @update:sliderValue="updateSetting('sliderValue', $event)"
          @update:claudeKey="updateSetting('claudeKey', $event)"
          @update:claudeSliderValue="updateSetting('claudeSliderValue', $event)"
          @update:selectedDallEImageCount="updateSetting('selectedDallEImageCount', $event)"
          @update:selectedDallEImageResolution="updateSetting('selectedDallEImageResolution', $event)"
          @update:selectedAutoSaveOption="updateSetting('selectedAutoSaveOption', $event)"
          @toggle-sidebar="toggleSidebar" />
      </div>

      <!-- Conversations Sidebar -->
      <div class="sidebar-conversations sidebar-right" id="conversations-dialog"
        :class="{ open: showConversationOptions }">
        <conversationsDialog :isSidebarOpen="isSidebarOpen" :conversations="conversations"
          @toggle-sidebar="showConversations" @load-conversation="selectConversationHandler"
          :selectedConversationItem="selectedConversation" @new-conversation="startNewConversation"
          @edit-conversation-title="editConversationTitle" @import-conversations="handleImportConversations"
          @export-conversations="handleExportConversations" @purge-conversations="handlePurgeConversations"
          @delete-current-conversation="deleteCurrentConversation" @open-settings="toggleSidebar"
          :showConversationOptions="showConversationOptions" />
        <div id="resize-handle" class="resize-handle" @dblclick="() => handleDoubleClick(sidebarContentContainer)">
        </div>
      </div>

      <div class="chat-container">
        <div class="container">
          <div class="chat">
            <!-- Header -->
            <chatHeader :selectedModel="selectedModel" :isSidebarOpen="isSidebarOpen"
              :storedConversations="storedConversations" @toggle-sidebar="toggleSidebar"
              @delete-conversation="deleteCurrentConversation" @toggle-conversations="showConversations"
              @new-conversation="startNewConversation" @change-model="onModelChange" />
            <!-- Messages -->
            <div class="messages">
              <messageItem :hasFilterText="hasFilterText" :messages="messages" :isLoading="isLoading"
                :modelDisplayName="modelDisplayName" @regenerate-response="regenerateMessageResponseHandler"
                @delete-response="handleDeleteMessage" @edit-message="EditPreviousMessage" />
            </div>
            <!-- Floating button to quick scroll to the bottom of the page -->
            <div class="floating-button scroll" id="scroll-button" @click="null"
              :class="{ show: shouldShowScrollButton }">
              <span>
                <ChevronDown :strokeWidth="3" />
              </span>
            </div>
            <!-- User Input -->
            <chatInput :userInput="userText" :isLoading="isLoading" @abort-stream="abortStream"
              @send-message="handleMessageSending" @vision-prompt="visionimageUploadClickHandler"
              @upload-context="importFileClick" @update:userInput="updateUserText" @swipe-left="swipedLeft"
              @swipe-right="swipedRight" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style lang="scss">
$icon-color: rgb(187, 187, 187);
$background-color: #1c1c1e;
$container-bg-color: #212121;
$sidebar-bg-color: #07161a;
$scrollbar-track-color: #665067;
$scrollbar-thumb-color: #4f3d50;
$scrollbar-thumb-hover-color: #5d455e;
$border-color: #444;
$hover-bg-color: #4a4a4c;
$button-bg-color: #3a3a3c;
$button-hover-bg-color: #4a4a4c;
$font-color: #f0f0f0;
$overlay-bg-color: rgba(15, 15, 15, 0.5);

@font-face {
  font-family: Roboto-Regular;
  src: url('/src/assets/webfonts/Roboto-Regular.ttf');
  font-weight: 400;
  font-style: normal;
}

body {
  font-family: Roboto-Regular, sans-serif;
  margin: 0;
  padding: 0;
  background-color: $background-color;
  color: $font-color;
}

a {
  color: rgb(173, 167, 167);

  &:hover,
  &:focus,
  &:active,
  &:visited {
    color: $icon-color;
  }
}

.app-body {
  width: 100vw;
  height: 90vh;
  position: relative;
  max-height: 90vh;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat {
  width: 99dvw;
  background-color: $container-bg-color;
  height: 98dvh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &.header {
    background-color: $border-color;
    padding: 10px;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
  }

  &.api-key {
    display: flex;
  }
}

.messages {
  overflow-y: auto;
  padding: 3px;
  min-height: 93vh;
  scrollbar-width: none; // For Firefox
  -ms-overflow-style: none; // For Internet Explorer and Edge

  &::-webkit-scrollbar {
    display: none; // For Chrome, Safari, and Opera
  }
}

#user-search-input {
  flex-grow: 1;
  border: 1px solid $border-color;
  background-color: $background-color;
  font-size: 18px;
  color: $font-color;
  width: inherit;
  resize: vertical;
  overflow: auto;
  white-space: pre-wrap;
  min-height: 30px;
  border-radius: 30px;
  transition: 0.2s height ease-in-out;
  padding: 14px 14px 14px 20px;
}

button {
  border: 1px solid $border-color;
  background-color: $button-bg-color;
  color: $font-color;
  cursor: pointer;

  &:hover {
    background-color: $button-hover-bg-color;
  }
}

.hover-increase-size {
  transition:
    background-color 0.3s ease,
    transform 0.1s ease;

  &:hover {
    transform: scale(1.2);
  }
}

.floating-button {
  border: 1px solid $border-color;
  background: transparent;
  cursor: pointer;
  color: $icon-color;
  position: fixed;
  min-height: 50px;
  top: 130px;
  display: grid;
  align-content: center;
  right: 7px;
  z-index: 99999;
  border-radius: 30px;
  min-width: 54px;
  opacity: 0.5;
  justify-content: space-around;
  transition: opacity 0.1s ease-in-out;

  &.scroll {
    top: 76vh;
    opacity: 0;

    &.show {
      opacity: 1;
    }
  }

  &:hover {
    opacity: 1;
  }
}

.floating-search-field {
  border: 1px solid $border-color;
  background-color: #2f2f31;
  cursor: pointer;
  color: #433944;
  position: fixed;
  min-height: 0px;
  top: 130px;
  display: grid;
  align-content: center;
  right: 82px;
  width: 0px;
  border-radius: 30px;
  min-width: 0px;
  z-index: -5;
  justify-content: space-around;
  transition: width 0.25s ease-in-out;

  &.show {
    z-index: 99999;
    width: 70vw;
  }
}

pre {
  background-color: #212426 !important;
  color: #d8d8d8 !important;
  padding: 10px;
  border-radius: 12px;
  max-width: 98vw;
  overflow: auto;

  code {
    max-width: 97vw;
  }
}

.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1px;
  border-radius: 8px;
}

.general-processing {
  display: contents;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: $scrollbar-track-color;
}

::-webkit-scrollbar-thumb {
  background: $scrollbar-thumb-color;

  &:hover {
    background: $scrollbar-thumb-hover-color;
  }
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0px;
  width: 3px;
  height: 100%;
  cursor: col-resize;
  background-color: #212121;
  z-index: 1000;
}

.sidebar-conversations,
.sidebar-common {
  background-color: $sidebar-bg-color;
  padding: 6px;
  overflow: hidden;
  transition: transform 0.1s ease-in-out;
  z-index: 0;

  &.open {
    transform: translateX(0);
  }

  @media (max-width: 600px) {
    position: fixed;
    width: 100vw;
  }
}

.sidebar-conversations {
  min-width: 0;
  max-width: 100%;
  position: inherit;
  height: 99vh;
  width: auto;
  transform: translateX(-3px);

  @media (max-width: 600px) {
    position: fixed;
    transform: translateX(110%);
    border-right: 2px solid $border-color;
    z-index: 1;
    width: 100vw;

    &.open {
      width: 100vw;
      height: 102vh;
    }
  }
}

.sidebar-common {
  width: 35vw;
  min-width: 25vw;
  max-width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  transform: translateX(-100%);
  border-right: 2px solid $border-color;
  z-index: 1;

  @media (max-width: 600px) {
    width: 100vw;
  }

  &.sidebar-right {
    right: 0;
    transform: translateX(100%);
  }
}

.sidebar-left {
  left: 0;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: $overlay-bg-color;
  z-index: 0;
  transition: opacity 0.3s ease-in-out;
  display: block;

  &:not(:empty) {
    display: none;
  }
}

@keyframes delayZIndex {
  0% {
    z-index: -1;
  }

  100% {
    z-index: 9999;
  }
}

.chat-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 500px;
  min-width: 350px;
  width: 100vw;
  max-width: 100vw;
  background-color: #1d1d1d;
  justify-content: space-between;
}
</style>
