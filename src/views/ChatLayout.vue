// ChatLayout.vue

<script setup>
import { onMounted, ref, watch } from 'vue';
import { determineModelDisplayName, handleDoubleClick, removeAPIEndpoints, startResize, resize, stopResize } from '@/libs/utils/general-utils';
import { handleExportConversations } from '@/libs/conversation-management/conversations-management';
import { onUploadFileContentsToConversation, uploadFile, imageInputChanged } from '@/libs/file-processing/file-processing';
import messageItem from '@/components/controls/MessagesList.vue';
import chatInput from '@/components/layout/ChatInput.vue';
import chatHeader from '@/components/layout/ChatHeader.vue';
import settingsDialog from '@/components/dialogs/SettingsDialog.vue';
import conversationsDialog from '@/components/dialogs/ConversationsDialog.vue';
import StoredFilesList from '@/components/dialogs/StoredFilesDialog.vue';
import {
  userText,
  isLoading,
  selectedModel,
  isSidebarOpen,
  showConversationOptions,
  messages,
  modelDisplayName,
  localModelName,
  localModelEndpoint,
  imageInput,
  lastLoadedConversationId,
  conversations,
  higherContrastMessages,
  showStoredFiles,
  isSmallScreen,
  availableModels
} from '@/libs/state-management/state';
import { setupWatchers } from '@/libs/state-management/watchers';
import { saveMessagesHandler, selectConversationHandler } from '@/libs/conversation-management/useConversations';
import { addMessage } from '@/libs/conversation-management/message-processing';
import { runTutortialForNewUser } from '@/libs/utils/tutorial-utils';
import "driver.js/dist/driver.css";
import "../assets/tutorial.css";
import { getOpenAICompatibleAvailableModels } from '@/libs/api-access/open-ai-api-standard-access';

const sidebarContentContainer = ref(null);
const initialWidth = ref(325);
const initialMouseX = ref(0);

function startResizeHandler(event) {
  initialWidth.value = sidebarContentContainer.value.offsetWidth;
  initialMouseX.value = event.clientX;
  document.addEventListener('mousemove', resizeHandler);
  document.addEventListener('mouseup', stopResizeHandler);
}

function resizeHandler(event) {
  if (!sidebarContentContainer.value) return;
  const deltaX = event.clientX - initialMouseX.value;
  const newWidth = Math.max(250, Math.min(600, initialWidth.value + deltaX));
  sidebarContentContainer.value.style.width = `${newWidth}px`;
  
  // Update the chat container margin to match
  const chatContainer = document.querySelector('.chat-container');
  if (chatContainer) {
    chatContainer.style.marginLeft = `${newWidth}px`;
    chatContainer.style.width = `calc(100% - ${newWidth}px)`;
  }
  
  // Also set the same width for the inner elements 
  const sidebarConversations = document.querySelector('.sidebar-conversations');
  if (sidebarConversations) {
    sidebarConversations.style.width = `${newWidth}px`;
    sidebarConversations.style.minWidth = `${newWidth}px`;
    sidebarConversations.style.maxWidth = `${newWidth}px`;
  }
}

function stopResizeHandler() {
  document.removeEventListener('mousemove', resizeHandler);
  document.removeEventListener('mouseup', stopResizeHandler);
}

function resetSidebarForMobile() {
  if (!sidebarContentContainer.value) return;
  
  // Reset to 100vw for mobile
  sidebarContentContainer.value.style.width = '100vw';
  sidebarContentContainer.value.style.minWidth = '100vw';
  sidebarContentContainer.value.style.maxWidth = '100vw';
  
  // Reset the sidebar conversations element too
  const sidebarConversations = document.querySelector('.sidebar-conversations');
  if (sidebarConversations) {
    sidebarConversations.style.width = '100vw';
    sidebarConversations.style.minWidth = '100vw';
    sidebarConversations.style.maxWidth = '100vw';
  }
  
  // Reset chat container
  const chatContainer = document.querySelector('.chat-container');
  if (chatContainer) {
    chatContainer.style.marginLeft = '0';
    chatContainer.style.width = '100%';
  }
}

function resetSidebarForDesktop() {
  if (!sidebarContentContainer.value) return;
  
  // Reset to 325px for desktop
  const defaultWidth = '325px';
  sidebarContentContainer.value.style.width = defaultWidth;
  
  // Reset the sidebar conversations element too
  const sidebarConversations = document.querySelector('.sidebar-conversations');
  if (sidebarConversations) {
    sidebarConversations.style.width = defaultWidth;
    sidebarConversations.style.minWidth = defaultWidth;
    sidebarConversations.style.maxWidth = defaultWidth;
  }
  
  // Reset chat container
  const chatContainer = document.querySelector('.chat-container');
  if (chatContainer) {
    chatContainer.style.marginLeft = defaultWidth;
    chatContainer.style.width = `calc(100% - ${defaultWidth})`;
  }
}

//#region File/Upload Handling
function handleImportConversations() {
  openFileSelector();
}

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

async function fetchAvailableModels() {
  try {
    if (localModelEndpoint.value.trim() !== '') {
      const models = await getOpenAICompatibleAvailableModels(removeAPIEndpoints(localModelEndpoint.value));
      availableModels.value = models;
    }
  } catch (error) {
    console.error('Error fetching available models:', error);
  }
}

//#region Lifecycle Hooks
onMounted(async () => {
  setupWatchers();
  sidebarContentContainer.value = document.querySelector('#conversations-dialog');
  
  if (sidebarContentContainer.value) {
    // Initialize with fixed width
    sidebarContentContainer.value.style.width = '325px';
  }
  
  // Watch for screen size changes to reset sidebar width on mobile
  watch(isSmallScreen, (newIsSmallScreen) => {
    if (newIsSmallScreen) {
      // Reset to mobile view (full width)
      resetSidebarForMobile();
    } else {
      // Reset to desktop default
      resetSidebarForDesktop();
    }
  });

  selectedModel.value = localStorage.getItem('selectedModel') || 'gpt-4o';

  modelDisplayName.value = determineModelDisplayName(selectedModel.value);
  higherContrastMessages.value = localStorage.getItem('higherContrastMessages') || false;

  if (selectedModel.value === 'open-ai-format') {
    fetchAvailableModels();
  }

  selectConversationHandler(lastLoadedConversationId.value || conversations.value[0]?.id);

  document.addEventListener('swiped-left', function (e) {
    if (!e.detail.xStart || !(window.innerWidth - e.detail.xStart <= 100)) {
      console.log('Swipe did not start at the edge of the right side of the screen');
      showConversationOptions.value = false;
    }
  });

  document.addEventListener('swiped-right', function (e) {
    if (!e.detail.xStart || e.detail.xStart >= 100) {
      console.log('Swipe did not start at the edge of the left side of the screen');
      isSidebarOpen.value = false;
    }
  });

  await runTutortialForNewUser();
});

function closeDialogs() {
  isSidebarOpen.value = false;
  showConversationOptions.value = false;
  showStoredFiles.value = false;
}

//#endregion
</script>

<template>
  <div id="fileUploadDiv">
    <input type="file" id="fileUpload" style="display: none"
      @change="(event) => uploadFile(event, conversations, selectConversationHandler)" />
    <input type="file" id="fileImportUpload" style="display: none"
      @change="(event) => onUploadFileContentsToConversation(event, userText, addMessage)" />
    <div @click="openFileSelector" style="display: none">Upload File</div>
    <div @click="importFileClick" style="display: none">Import File</div>
    <input id="imageInput" ref="imageInput" @change="imageInputChangedHandler" style="display: none" type="file" />
  </div>
  <div class="app-body">
    <div class="app-container" id="app-container">
      <transition name="fade">
        <div @click="closeDialogs" class="overlay" v-show="isSidebarOpen || showConversationOptions || showStoredFiles">
        </div>
      </transition>

      <Transition name="dialog-slide">
        <div class="sidebar-common" id="settings-dialog" v-if="isSidebarOpen">
          <settingsDialog />
        </div>
      </Transition>
      <Transition name="dialog-slide">
        <div class="sidebar-conversations" id="conversations-dialog"
          v-if="showConversationOptions || !isSmallScreen">
          <conversationsDialog @import-conversations="handleImportConversations"
            @export-conversations="handleExportConversations" />
          <div id="resize-handle" class="resize-handle" 
               @mousedown="startResizeHandler" 
               @dblclick="() => handleDoubleClick(sidebarContentContainer)">
          </div>
        </div>
      </Transition>
      <Transition name="dialog-slide">
        <StoredFilesList id="stored-files" v-if="showStoredFiles" />
      </Transition>
      <div class="chat-container">
        <div class="container">
          <div class="chat">
            <chatHeader :storedConversations="storedConversations" />
            <div class="messages">
              <messageItem />
            </div>
            <chatInput :userInput="userText" @abort-stream="abortStream" @upload-context="importFileClick"
              @update:userInput="updateUserText" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
$icon-color: rgb(187, 187, 187);
$background-color: #1c1c1e;
$container-bg-color: #1b1b1b;
$sidebar-bg-color: #0a0a0a;
$scrollbar-track-color: #665067;
$scrollbar-thumb-color: #4f3d50;
$scrollbar-thumb-hover-color: #5d455e;
$border-color: #444;
$hover-bg-color: #4a4a4c;
$button-bg-color: #3a3a3c;
$button-hover-bg-color: #4a4a4c;
$font-color: #f0f0f0;
$overlay-bg-color: rgba(15, 15, 15, 0.709);

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dialog-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.25, 1.25, 0.5, 1);
  transform: translateY(0);
  opacity: 1;

  @media (max-width: 600px) {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform: scale(1);
    opacity: 1;
  }
}

.dialog-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.55, 0.085, 0.68, 0.53);
  transform: translateY(-100%);
  opacity: 0;

  @media (max-width: 600px) {
    transition: all 0.25s cubic-bezier(0.55, 0.085, 0.68, 0.53);
    transform: scale(0.2);
    opacity: 0;
  }
}

.dialog-slide-enter-from {
  transform: translateY(-100%);
  opacity: 0;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);

  @media (max-width: 600px) {
    transform: scale(0.2);
    opacity: 0;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
}

.dialog-slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);

  @media (max-width: 600px) {
    transform: scale(0.2);
    opacity: 0;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
}

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
  height: 100vh;
  position: relative;
  max-height: 100vh;
  overflow: hidden;

  @media (max-width: 600px) {
    height: 100vh;
    overflow: hidden;
  }
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat {
  width: 99dvw;
  background-color: $container-bg-color;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 0;
  position: relative; /* Added to establish positioning context */
  padding-bottom: env(safe-area-inset-bottom, 0px); /* iOS safe area support */

  @media (max-width: 600px) {
    width: 100%;
    height: calc(100dvh - env(safe-area-inset-bottom, 0px));
    margin: 0;
    padding-bottom: 80px; /* Ensure space for the input */
  }

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
  overflow-y: hidden;
  flex: 1 1 auto;
  min-height: 0;
  scrollbar-width: none; // For Firefox
  -ms-overflow-style: none; // For Internet Explorer and Edge
  padding-bottom: 80px; /* Reduced space for the input to allow messages to extend lower */
  position: relative;

  @media (max-width: 600px) {
    width: 100%;
    padding: 8px 8px 75px 8px;
    /* Using flex instead of fixed heights for better adaptability */
    flex: 1; 
    /* Ensure content is visible on iOS Safari which has bottom bars */
    padding-bottom: calc(55px + env(safe-area-inset-bottom, 5px));
    margin-bottom: 0; /* Removed margin to maximize message space */
  }

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
    background-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    transform: scale(1.2);
  }
}

pre {
  background-color: #212426 !important;
  color: #d8d8d8 !important;
  padding: 10px;
  border-radius: 12px;
  max-width: 98vw;
  scrollbar-width: none;
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
  width: 6px;
  height: 100%;
  cursor: col-resize;
  background-color: #212121;
  z-index: 1000;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #157474;
  }
}

.sidebar-conversations,
.sidebar-common {
  background-color: $sidebar-bg-color;
  padding: 0;
  overflow: hidden;
  z-index: 0;

  @media (max-width: 600px) {
    position: fixed;
    width: 100vw;
  }
}

.sidebar-conversations {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  max-width: 325px;
  min-width: 325px;
  width: 325px;
  z-index: 2;
  margin: 0;
  padding-top: 0;
  border-right: 1px solid $border-color;

  @media (max-width: 600px) {
    position: fixed;
    border-right: 2px solid $border-color;
    z-index: 2;
    width: 100vw;
    max-width: 100vw;
    min-width: 100vw;
    height: 101vh;
    left: 0;
    top: 0;

    &.open {
      width: 100vw;
      height: 100vh;
    }
  }
}


.sidebar-common {
  min-width: 25vw;
  max-width: 100vw;
  position: fixed;
  top: 5%;
  padding: 0;
  border-right: 2px solid $border-color;
  z-index: 3;
  border-radius: 12px;
  border: 2px solid #083e35d9;
  width: 60vw;
  height: 85vh;
  font-size: 12px;

  @media (max-width: 600px) {
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    right: 0;
    border-radius: 0;
    border: none;
    z-index: 3;
  }

  &.sidebar-right {
    right: 0;
    
    @media (max-width: 600px) {
      right: 0;
      left: 0;
    }
  }

  &.open {
    opacity: 1;
  }
}

.sidebar-left {
  left: 0;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: $overlay-bg-color;
  z-index: 1;
  transition: opacity 0.15s linear;
  display: block;

  @media (max-width: 600px) {
    /* Show overlay on mobile for better UI experience */
    display: block;
    z-index: 1;
  }

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
  width: 100%;
  max-width: 100%;
  background-color: #1d1d1d;
  justify-content: space-between;
  position: relative;
  
  /* Add space for the input */
  padding-bottom: 80px;
  
  @media (min-width: 601px) {
    margin-left: 325px; /* Same as the width of sidebar-conversations */
    width: calc(100% - 325px);
  }
  
  @media (max-width: 600px) {
    min-height: 100%;
    height: 100vh;
    width: 100%;
    min-width: 100%;
    padding: 0 0 80px 0;
    /* Ensure it works with iOS safe areas */
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0));
    margin: 0;
  }
}
</style>
