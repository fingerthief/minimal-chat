<template>
  <div ref="messageList" :class="['message-list', { dragging: isDragging }]" @swiped-left="swipedLeft"
    @swiped-right="swipedRight" @dragover.prevent="dragoverHandler" @dragenter.prevent="dragenterHandler"
    @dragleave.prevent="dragleaveHandler" @drop.prevent="dropHandler" data-swipe-threshold="15" data-swipe-unit="vw"
    data-swipe-timeout="500">


    <!-- Virtual scroller with automatic scrolling on update -->
    <DynamicScroller :items="filteredMessages" :min-item-size="50" :buffer="100" key-field="id" :emitUpdates="true"
      :size-dependencies="['content']" type-field="type" ref="scroller" class="scroller" 
      style="overflow-y: auto;" :watchData="true">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :data-index="index" :size-dependencies="['content']">
          <div style="padding-top: 3px; padding-bottom: 3px;">
            <MessageItem :item="item" :active="active" />
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>

    <!-- Always-visible scroll to bottom button -->
    <button 
      class="scroll-to-bottom-btn"
      @click="scrollToBottom" 
      aria-label="Scroll to bottom">
      <i class="pi pi-arrow-down"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { claudeSliderValue, imageInput, localModelEndpoint, localModelKey, localSliderValue, messages, selectedModel, sliderValue, userText, streamedMessageText, isLoading, conversationLoadTimestamp } from '@/libs/state-management/state';
import { showToast, swipedLeft, swipedRight, updateUIWrapper } from '@/libs/utils/general-utils';
import 'swiped-events';
import MessageItem from '@/components/controls/MessageItem.vue';
import StoredFilesDialog from '../dialogs/StoredFilesDialog.vue';
import { onUploadFileContentsToConversation, uploadFileContentsToConversation } from '@/libs/file-processing/file-processing';
import { addMessage, visionimageUploadClick } from '@/libs/conversation-management/message-processing';
import { saveMessagesHandler } from '@/libs/conversation-management/useConversations';
import { storeFileData } from '@/libs/file-processing/image-analysis';

const messageList = ref(null);
const scroller = ref(null);

// Reactive property to track if a file is being dragged over the list,
// so you can provide visual feedback (optional)
const isDragging = ref(false);

// No longer need showScrollButton as the button is always visible

// Memoize filtered messages to avoid expensive recalculations
const filteredMessages = computed(() => {
  // Skip processing if messages is empty
  if (!messages.value || messages.value.length === 0) return [];
  
  return messages.value
    .filter((message) => message.role !== 'system')
    .map(message => ({
      ...message,
      type: getItemType(message)
    }));
});

function getItemType(item) {
  const baseSize = 50;
  
  // Handle both array-based and string-based content
  let contentLength = 0;
  if (Array.isArray(item.content)) {
    contentLength = item.content.reduce((total, part) => {
      // For text parts, count their length
      if (part.type === 'text' && part.text) {
        return total + part.text.length;
      }
      // For image parts, add a fixed size estimate
      else if (part.type === 'image_url') {
        return total + 250; // Approximate size for image container
      }
      return total;
    }, 0);
  } else {
    contentLength = String(item.content).length;
  }
  
  const estimatedSize = baseSize + Math.ceil(contentLength / 100) * 20; // Add 20px per 100 characters
  return estimatedSize;
}

// Drag-and-drop event handlers
function dragenterHandler(e) {
  isDragging.value = true;
}

function dragoverHandler(e) {
  e.preventDefault();
  // You can also update UI feedback here if needed.
}

function dragleaveHandler(e) {
  // Optionally, you could check if the pointer has left the container entirely.
  isDragging.value = false;
}

function dropHandler(e) {
  isDragging.value = false;
  const dt = e.dataTransfer;
  if (dt && dt.files) {
    handleFiles(dt.files);
  }
  // Clear any data (optional)
  e.dataTransfer.clearData();
}

async function addStoredFileToContext(file, content) {
  const messageContent = file.type.startsWith('image/')
    ? [
      { type: 'image_url', image_url: { url: content } },
      { type: 'text', text: `${userText.value}\n\nImage: ${file.name}` }
    ]
    : [{ type: 'text', text: `${userText.value} ${content}` }];

  if (file.type.startsWith('image/')) {
    addMessage('user', messageContent);
  }
  else {
    addMessage('user', `#contextAdded: ${file.name} | ${messageContent[0].text}`);
  }

  addMessage('assistant', `${file.name} context added from storage.`);

  showToast("Successfully Added File Context From Storage");
  saveMessagesHandler();
};

async function handleFiles(files) {
  // Convert FileList to an array for processing
  const fileArray = Array.from(files);
  fileArray.forEach(async file => {
    // Check if the file is an image (MIME type starts with "image/")

    const reader = new FileReader();

    reader.onloadend = async (e) => {
      const contents = e.target.result;
      let pdfText = null;

      if (file.type.startsWith('image/')) {
        await storeFileData(file.name, contents, file.size, file.type);
      } else if (file.type === 'application/pdf') {
        pdfText = await processPDF(contents, file); // Get pdfText
      } else {
        await storeFileData(file.name, contents, file.size, file.type);
      }

      // Use pdfText if it's a PDF, otherwise use contents
      await addStoredFileToContext(file, pdfText || contents);

      showToast('File uploaded and stored successfully');
    };

    if (file.type === 'application/pdf') {
      reader.readAsArrayBuffer(file);
    }
    else if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    }
    else {
      reader.readAsText(file);
    }
  });
}

async function processPDF(contents, file) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: contents });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    let pdfText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      pdfText += textContent.items.map(item => item.str).join(' ') + '\n';
    }

    await storeFileData(file.name, pdfText, file.size, file.type);

    return pdfText;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    showToast('Failed to parse PDF. It might be encrypted or corrupted.');
  }
};

// Scroll to the bottom of the message list
function scrollToBottom(forceScroll = false) {
  if (!scroller.value) return;
  
  try {
    // Try to use virtual scroller's built-in method first
    if (typeof scroller.value.scrollToItem === 'function' && filteredMessages.value.length > 0) {
      const lastItemIndex = filteredMessages.value.length - 1;
      scroller.value.scrollToItem(lastItemIndex);
      
      // For conversation loads, use additional direct DOM scroll as backup
      if (forceScroll && scroller.value.$el) {
        const container = scroller.value.$el.querySelector('.vue-recycle-scroller');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }
      
      return;
    }
    
    // Fallback to direct DOM scrolling
    nextTick(() => {
      if (!scroller.value || !scroller.value.$el) return;
      
      const scrollerElement = scroller.value.$el;
      const scrollContainer = scrollerElement.querySelector('.vue-recycle-scroller') || 
                              scrollerElement.querySelector('.vue-recycle-scroller__item-wrapper') ||
                              scrollerElement;
      
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: forceScroll ? 'auto' : 'smooth'
        });
      }
    });
  } catch (error) {
    console.error("Error scrolling to bottom:", error);
  }
}

// Optimize the watcher to avoid deep watching the entire messages array
watch(
  // Only watch the length of the messages array for scrolling
  () => filteredMessages.value.length,
  async (newLength, oldLength) => {
    // Only scroll when new messages are added
    if (newLength > oldLength) {
      await scrollToBottom();
    }
  }
);

// This functionality has been temporarily disabled to avoid conflicts
/*
watch(
  () => streamedMessageText.value,
  () => {
    if (isLoading.value) {
      // This was causing conflicts
    }
  }
);
*/

// Watch for conversation load events using the timestamp
watch(conversationLoadTimestamp, () => {
  if (conversationLoadTimestamp.value > 0) {
    // Give DOM time to update with the new messages, then scroll
    nextTick(() => {
      scrollToBottom(true);
    });
    
    // Backup attempt after a short delay to ensure virtual scroller has updated
    setTimeout(() => {
      scrollToBottom(true);
    }, 100);
  }
});

onMounted(() => {
  // Simply scroll to bottom when component mounts
  scrollToBottom();
});
</script>

<style lang="scss">
.scroller,
.message-list {
  height: 100%;
  overflow-y: hidden;
  scrollbar-width: none;
  padding-bottom: 10px; /* Reduced padding to bring messages closer to input */
  padding-left: 16px; /* Added left padding */
  padding-right: 16px; /* Added right padding */
  margin-bottom: 0; /* Removed margin to maximize space */
  
  @media (max-width: 600px) {
    height: calc(100vh - 140px); /* Increased height for mobile */
    margin-bottom: 0;
    padding-bottom: 5px;
    padding-left: 4px; /* Minimized padding on mobile */
    padding-right: 4px; /* Minimized padding on mobile */
  }
}

.message-item-wrapper {
  display: block;
  padding: 0;
}

/* Visual feedback during drag-and-drop */
.message-list.dragging {
  border: 2px dashed #0077ff;
  background: rgba(0, 123, 255, 0.1);
}

.message-padding {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20px;
  pointer-events: auto;


  &.left {
    left: -20px;
  }

  &.right {
    right: -20px;
  }
}


.loading.spinner {
  display: inline-block;
  margin-left: 5px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #0077ff;
  width: 10px;
  height: 10px;
  animation: spin 1s infinite linear;
}

.scroll-to-bottom-btn {
  position: fixed;
  bottom: 80px; /* Position above input area */
  right: 16px;
  width: 36px; /* Base size */
  height: 36px;
  border-radius: 50%;
  background-color: var(--surface-card, #ffffff); /* Match app theme */
  color: var(--text-color-secondary, #64748b); /* Subtle color */
  border: 1px solid var(--surface-border, #dee2e6);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: all 0.2s ease;
  opacity: 0.8; /* Slightly transparent */
  
  &:hover {
    opacity: 1;
    background-color: var(--surface-hover, #f8f9fa);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  /* PrimeIcons sizing */
  i {
    font-size: 1rem;
  }
  
  /* Desktop size - make button larger */
  @media (min-width: 1024px) {
    width: 44px;
    height: 44px;
    
    i {
      font-size: 1.2rem;
    }
  }
  
  /* Adjust for mobile */
  @media (max-width: 600px) {
    bottom: 90px; /* Move higher up to avoid the input area on mobile */
    right: 10px;
    width: 32px;
    height: 32px;
    opacity: 0.7; /* Slightly more transparent on mobile */
  }
}
</style>