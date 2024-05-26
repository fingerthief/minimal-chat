// ChatLayout.vue

<script setup>
import { onMounted, onUnmounted, ref, nextTick, computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import { determineModelDisplayName, handleDoubleClick } from '@/libs/utils/general-utils';
import { handleExportConversations } from '@/libs/conversation-management/conversations-management';
import { uploadFileContentsToCoversation, uploadFile, imageInputChanged } from '@/libs/file-processing/file-processing';
import messageItem from '@/components/MessageItem.vue';
import chatInput from '@/components/ChatInput.vue';
import chatHeader from '@/components/ChatHeader.vue';
import settingsDialog from '@/components/SettingsDialog.vue';
import conversationsDialog from '@/components/ConversationsDialog.vue';
import {
  shouldShowScrollButton,
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
  contextMenuOpened,
  selectedConversation
} from '@/libs/state-management/state';
import { setupWatchers } from '@/libs/state-management/watchers';
import { saveMessagesHandler, selectConversationHandler } from '@/libs/conversation-management/useConversations';
import { addMessage } from '@/libs/conversation-management/message-processing';
import { runTutortialForNewUser } from '@/libs/utils/tutorial-utils';
import "driver.js/dist/driver.css";
import "../assets/tutorial.css";

const sidebarContentContainer = ref(null);

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

//#region Global Event Handling
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
//#endregion

//#region Lifecycle Hooks
onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick);
});

onMounted(async () => {
  setupWatchers();
  sidebarContentContainer.value = document.querySelector('.sidebar-conversations');
  sidebarContentContainer.value.style.width = '420px';

  selectedModel.value = localStorage.getItem('selectedModel') || 'gpt-4o';

  modelDisplayName.value = determineModelDisplayName(selectedModel.value);
  higherContrastMessages.value = localStorage.getItem('higherContrastMessages') || false;


  selectConversationHandler(lastLoadedConversationId.value || conversations.value[0]?.id);

  document.addEventListener('click', handleGlobalClick);

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

//#endregion
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
        <settingsDialog />
      </div>

      <!-- Conversations Sidebar -->
      <div class="sidebar-conversations sidebar-right" id="conversations-dialog"
        :class="{ open: showConversationOptions }">
        <conversationsDialog @import-conversations="handleImportConversations"
          @export-conversations="handleExportConversations" />
        <div id="resize-handle" class="resize-handle" @dblclick="() => handleDoubleClick(sidebarContentContainer)">
        </div>
      </div>

      <div class="chat-container">
        <div class="container">
          <div class="chat">
            <!-- Header -->
            <chatHeader :storedConversations="storedConversations" />
            <!-- Messages -->
            <div class="messages">
              <messageItem />
            </div>
            <!-- Floating button to quick scroll to the bottom of the page -->
            <div class="floating-button scroll" id="scroll-button" @click="null"
              :class="{ show: shouldShowScrollButton }">
              <span>
                <ChevronDown :strokeWidth="3" />
              </span>
            </div>
            <!-- User Input -->
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
$container-bg-color: #212121;
$sidebar-bg-color: #0c1928;
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

  @media (max-width: 600px) {
    position: fixed;
    transform: translateX(0%) scale(0);
    border-right: 2px solid $border-color;
    transition: transform 0.25s ease-in-out;
    z-index: 1;
    width: 100vw;

    &.open {
      width: 100vw;
      height: 100vh;
      transition: transform 0.25s ease-in-out;
    }
  }
}


.sidebar-common {
  min-width: 25vw;
  max-width: 100vw;
  position: fixed;
  top: 15%;
  transform: translateX(0%) scale(0);
  border-right: 2px solid $border-color;
  z-index: 1;
  transition: transform 0.25s ease-in-out; // Adjusted duration and easing
  border-radius: 12px;
  opacity: 1;
  border: 2px solid #083e35d9;
  width: 60vw;
  height: 70vh;
  top: 15%;
  font-size: 12px;

  @media (max-width: 600px) {
    width: 100vw;
    height: 100vh;
    top: 0;
    transition: transform 0.25s ease-in-out; // Adjusted duration and easing
  }

  &.sidebar-right {
    right: 0;
    transform: translateX(0%) scale(0.0);
  }


  &.open {
    @media (min-width: 600px) {
      transform: translateX(50%) scale(1);
    }

    transform: translateX(0%) scale(1);
    opacity: 1;
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

  @media (max-width: 600px) {
    display: none;
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
  width: 100vw;
  max-width: 100vw;
  background-color: #1d1d1d;
  justify-content: space-between;
}
</style>
