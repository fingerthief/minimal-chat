<script setup>
import { ref, defineEmits } from 'vue';
import { SquareArrowUp, ImageUp, CircleStop, Upload, Speech, Mic } from 'lucide-vue-next';
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
  if (!userInputRef.value) return;
  
  if (!userText.value || userText.value.trim() === '') {
    userInputRef.value.style.height = '56px'; // Match the min-height defined in CSS
    return;
  }

  // Temporarily shrink the textarea to get an accurate scrollHeight measurement
  userInputRef.value.style.height = 'auto';
  
  // Set the height based on content with a small padding
  const newHeight = Math.min(userInputRef.value.scrollHeight, 300); // Limit max height to 300px
  userInputRef.value.style.height = `${newHeight}px`;
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
  // if (engine !== undefined && selectedModel.value.includes('web-llm')) {
  //   engine.interruptGenerate();
  //   showToast('Aborted response stream');
  //   return;
  // }

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
      <textarea 
        class="user-input-text" 
        id="user-input" 
        rows="1" 
        v-model="userText" 
        ref="userInputRef"
        :class="{ 'loading-border': isLoading }" 
        @input="autoResize" 
        @focus="autoResize" 
        @blur="autoResize"
        @keydown="handleKeyDown" 
        placeholder="Enter a message..."
      ></textarea>
      <div class="icons">
        <ToolTip :targetId="'imageButton'">Upload image for vision processing</ToolTip>
        <div class="image-button" id="imageButton" @click="visionImageUploadClickHandler">
          <ImageUp size="18" />
        </div>
        <ToolTip :targetId="'uploadButton'">Upload file to add contents to conversation</ToolTip>
        <div class="upload-button" id="uploadButton" @click="importFileUploadClick">
          <Upload size="18" />
        </div>
        <div class="send-button" @click="isLoading ? abortStream() : sendNewMessage()">
          <CircleStop class="stop-button" size="18" v-if="isLoading" />
          <SquareArrowUp size="18" v-if="!isLoading" />
        </div>
      </div>
    </div>
    
    <div v-if="selectedModel.includes('gpt')" class="interact-mode-container">
      <div v-if="!isInteractModeOpen">
        <ToolTip :targetId="'interactButton'">
          Interact mode (Experimental)<br><br>Hands free conversational speech with the model
        </ToolTip>
        <div class="interact-button" id="interactButton" @click="isInteractModeOpen = !isInteractModeOpen">
          <Mic size="20" />
        </div>
      </div>
      <InteractMode 
        v-if="isInteractModeOpen" 
        @recognized-sentence="handleRecognizedSentence"
        @close-interact-mode="handleCloseInteractMode" 
      />
    </div>
  </form>

</template>

<style lang="scss" scoped>
$icon-color: rgb(187, 187, 187);
$primary-color: #0b8181;
$primary-hover: #0c9090;
$background-color: #212121;
$border-color: rgba(112, 112, 112, 0.53);

#chat-form {
  position: absolute;
  display: flex;
  gap: 10px;
  width: 80%;
  max-width: 800px;
  bottom: 20px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  /* Positioned between message list but below overlay/dialogs */
  z-index: 0.5;
  
  /* For desktop screens */
  @media (min-width: 601px) {
    width: 70%;
    max-width: 800px;
  }
  
  @media (max-width: 600px) {
    position: fixed;
    max-width: calc(100% - 12px);
    width: calc(100% - 12px);
    bottom: calc(env(safe-area-inset-bottom, 0px) + 5px);
    padding: 0;
    gap: 6px;
  }

  .input-container {
    display: flex;
    flex: auto;
    flex-shrink: 2;
    align-items: center;
    position: relative;
    width: 100%;
    border-radius: 14px;
    transition: all 0.2s ease;

    @media (max-width: 600px) {
      width: calc(100% - 50px - 0.5rem);
    }
  }

  .icons {
    display: flex;
    gap: 10px;
    align-items: center;
    position: absolute;
    right: 16px;
    height: 100%;
    padding-right: 4px;
    z-index: 1;
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
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: 38px;
    height: 38px;
    transition:
      background-color 0.15s ease,
      transform 0.2s ease,
      color 0.2s ease;

    &:hover {
      transform: scale(1.1);
      color: white;
      background-color: rgba(255, 255, 255, 0.08);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .send-button {
    background-color: $primary-color;
    color: white;

    &:hover {
      background-color: $primary-hover;
      color: white;
    }
  }

  .interact-button {
    margin-left: unset;
  }

  #user-input {
    flex-grow: 1;
    border: 1px solid $border-color;
    outline: none;
    background-color: $background-color;
    border-radius: 14px;
    font-size: 18px;
    color: #f0f0f0;
    resize: none;
    overflow: hidden;
    white-space: pre-wrap;
    min-height: 56px;
    transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
    transform: translateY(0);
    padding-right: 120px;
    padding-top: 16px;
    padding-left: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    
    &:focus {
      border-color: rgba($primary-color, 0.6);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba($primary-color, 0.2);
      transform: translateY(-2px);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    &::placeholder {
      color: rgba(240, 240, 240, 0.5);
    }
  }

  @font-face {
    font-family: Roboto-Regular;
    src: url('/src/assets/webfonts/Roboto-Regular.ttf');
    font-weight: 400;
    font-style: normal;
  }

  textarea {
    transition: 0.2s height ease-in-out;
    font-family: Roboto-Regular, sans-serif;
    line-height: 1.4;
  }

  .loading-border {
    animation: colorful-pulse 4s linear infinite;
  }

  @keyframes colorful-pulse {
    0% {
      border-color: #0b8181c4;
      box-shadow: 0 0 4px #0b8181c4;
    }

    20% {
      border-color: #1e90ffc4;
      box-shadow: 0 0 6px #1e90ffc4;
    }

    40% {
      border-color: #6a4292e0;
      box-shadow: 0 0 8px #6a4292d9;
    }

    60% {
      border-color: #d9544fb0;
      box-shadow: 0 0 8px #d9544fb5;
    }

    80% {
      border-color: #f0ac4eb6;
      box-shadow: 0 0 6px #f0ac4ec3;
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
  border-radius: 14px;
  height: 56px;
  width: 56px;
  border: 1px solid $border-color;
  background: $background-color;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba($primary-color, 0.6);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
}

.interact-toggle-button {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 1;
  padding: 10px 20px;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: $primary-hover;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
}
</style>
