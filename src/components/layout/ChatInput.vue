<script setup>
import { ref, defineEmits } from 'vue';
import { SquareArrowUp, ImageUp, CircleStop, Upload, Speech } from 'lucide-vue-next';
import ToolTip from '@/components/controls/ToolTip.vue';
import InteractMode from '@/components/controls/InteractMode.vue';
import 'swiped-events';
import { swipedLeft, swipedRight, updateUI, showToast } from '@/libs/utils/general-utils';
import {
  isLoading,
  messages,
  selectedModel,
  userText,
  claudeSliderValue,
  sliderValue,
  localModelName,
  localSliderValue,
  localModelEndpoint,
  imageInput,
  abortController,
  isInteractModeOpen
} from '@/libs/state-management/state';
import { sendMessage, visionimageUploadClick, addMessage } from '@/libs/conversation-management/message-processing';
import { saveMessagesHandler } from '@/libs/conversation-management/useConversations';
import { engine } from '@/libs/api-access/web-llm-access';
// Define emits
const emit = defineEmits(['update:userInput', 'abort-stream', 'send-message', 'swipe-left', 'swipe-right', 'vision-prompt', 'upload-context']);
// Local reactive state
const userInputRef = ref(null);

// Methods for message handling
async function sendNewMessage() {
  isLoading.value = true;
  const messagePrompt = userText.value;
  userText.value = '';
  autoResize();

  await sendMessage(
    event,
    messagePrompt,
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

  isLoading.value = false;
}

function updateUIWrapper(content, autoScrollBottom = true, appendTextValue = true) {
  updateUI(content, messages.value, addMessage, autoScrollBottom, appendTextValue);
}

// Methods for UI interactions
function autoResize() {
  if (!userText.value || userText.value.trim() === '') {
    userInputRef.value.style.height = '30px';
    return;
  }

  userInputRef.value.style.height = 'auto';
  userInputRef.value.style.height = `${userInputRef.value.scrollHeight - 15}px`;
}

function handleKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    if (event.ctrlKey) {
      event.preventDefault();
      const cursorPosition = userInputRef.value.selectionStart;
      const text = userText.value;
      userText.value = text.slice(0, cursorPosition) + '\n' + text.slice(cursorPosition);
      userInputRef.value.selectionStart = userInputRef.value.selectionEnd = cursorPosition + 1;
      autoResize();
    } else {
      event.preventDefault(); // Prevent the default Enter behavior
      sendNewMessage();
    }
  }
}

// Methods for handling uploads and aborting streams
async function visionImageUploadClickHandler() {
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
  userText.value = '';
}

function importFileUploadClick() {
  emit('upload-context');
  userText.value = '';
}

async function abortStream() {
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

// Handle recognized sentence
async function handleRecognizedSentence({ text }) {
  isLoading.value = true;

  const messagePrompt = text;

  await sendMessage(
    event,
    messagePrompt,
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
  isLoading.value = false;
}
const handleCloseInteractMode = () => {
  isInteractModeOpen.value = false;
};
</script>

<template>
  <form @submit.prevent="sendNewMessage" id="chat-form" @swiped-left="swipedLeft" @swiped-right="swipedRight"
    data-swipe-threshold="15" data-swipe-unit="vw" data-swipe-timeout="250">
    <div class="input-container">
      <textarea class="user-input-text" id="user-input" rows="1" v-model="userText" ref="userInputRef"
        :class="{ 'loading-border': isLoading }" @input="autoResize" @focus="autoResize" @blur="autoResize"
        @keydown="handleKeyDown" placeholder="Enter a prompt"></textarea>
      <div class="icons">
        <ToolTip :targetId="'imageButton'"> Upload image for vision processing </ToolTip>
        <div class="image-button" id="imageButton" @click="visionImageUploadClickHandler">
          <ImageUp />
        </div>
        <ToolTip :targetId="'uploadButton'"> Upload file to add contents to current conversation </ToolTip>
        <div class="upload-button" id="uploadButton" @click="importFileUploadClick">
          <Upload />
        </div>
        <div class="send-button" @click="isLoading ? abortStream() : sendNewMessage()">
          <CircleStop class="stop-button" v-if="isLoading" />
          <SquareArrowUp v-if="!isLoading" />
        </div>
      </div>

    </div>
    <div v-if="selectedModel.includes('gpt')" class="interact-mode-container">
      <div v-if="!isInteractModeOpen">
        <ToolTip :targetId="'interactButton'"> Interact mode (Experimental) <br><br> Hands free conversational speech
          with the model
        </ToolTip>
        <div class="interact-button" id="interactButton" @click="isInteractModeOpen = !isInteractModeOpen">
          <Speech />
        </div>
      </div>
      <InteractMode v-if="isInteractModeOpen" @recognized-sentence="handleRecognizedSentence"
        @close-interact-mode="handleCloseInteractMode" />
    </div>
  </form>

</template>

<style lang="scss" scoped>
$icon-color: rgb(187, 187, 187);

#chat-form {
  position: absolute;
  display: flex;
  gap: 6px;
  width: 50vw;
  align-self: center;
  top: 104%;

  @media (max-width: 600px) {
    max-width: 100vw;
    width: 100%;
    top: calc(100% + 28px - 6px);
    padding: 6px;
  }

  .input-container {
    display: flex;
    flex: auto;
    flex-shrink: 2;
    align-items: center;
    position: relative;

    @media (max-width: 600px) {
      width: calc(100% - 50px - 0.5rem);
    }

  }

  .icons {
    display: flex;
    gap: 6px;
    align-items: center;
    position: absolute;
    right: 20px;
  }

  .image-button,
  .upload-button,
  .send-button,
  .stop-button,
  .interact-button {
    background-color: transparent;
    cursor: pointer;
    outline: none;
    color: $icon-color;
    display: grid;
    align-content: center;
    border-radius: 30px;
    justify-content: space-around;
    transition:
      background-color 0.3s ease,
      transform 0.2s ease;

    &:hover {
      transform: scale(1.3);
    }
  }

  .interact-button {
    margin-left: unset;
  }

  #user-input {
    flex-grow: 1;
    border: 1px solid #70707087;
    outline: none;
    background-color: #212121;
    border-radius: 10px;
    font-size: 18px;
    color: #f0f0f0;
    resize: vertical;
    overflow: hidden;
    white-space: pre-wrap;
    min-height: 50px;
    transition: 0.2s height ease-in-out;
    padding-right: 120px; // Adjust padding to make space for icons
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.3);
  }

  @font-face {
    font-family: Roboto-Regular;
    src: url('/src/assets/webfonts/Roboto-Regular.ttf');
    font-weight: 400;
    font-style: normal;
  }

  textarea {
    padding-top: 14px;
    padding-left: 20px;
    transition: 0.2s height ease-in-out;
    font-family: Roboto-Regular, sans-serif;
  }

  .loading-border {
    animation: colorful-pulse 2.5s ease-in-out infinite;
  }

  @keyframes colorful-pulse {
    0% {
      border-color: #0b8181c4;
      box-shadow: 0 0 4px #0b8181c4;
    }

    25% {
      border-color: #6a4292e0;
      box-shadow: 0 0 8px #6a4292d9;
    }

    50% {
      border-color: #d9544fb0;
      box-shadow: 0 0 12px #d9544fb5;
    }

    75% {
      border-color: #f0ac4eb6;
      box-shadow: 0 0 8px #f0ac4ec3;
    }

    100% {
      border-color: #0b8181c4;
      box-shadow: 0 0 4px #0b8181c4;
    }
  }
}

.interact-mode-container {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  height: 50px;
  width: 50px;
  border: 1px solid rgba(112, 112, 112, 0.5294117647);
  background: #212121;
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.3);
}

.interact-toggle-button {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 1000;
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
