<template>
  <div ref="messageList" :class="['message-list', { dragging: isDragging }]" @swiped-left="swipedLeft"
    @swiped-right="swipedRight" @dragover.prevent="dragoverHandler" @dragenter.prevent="dragenterHandler"
    @dragleave.prevent="dragleaveHandler" @drop.prevent="dropHandler" data-swipe-threshold="15" data-swipe-unit="vw"
    data-swipe-timeout="500">


    <!-- Virtual scroller remains the same -->
    <DynamicScroller :items="filteredMessages" :min-item-size="50" :buffer="100" key-field="id" :emitUpdates="true"
      :size-dependencies="['content']" type-field="type" ref="scroller" class="scroller">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :data-index="index" :size-dependencies="['content']">
          <MessageItem :item="item" :active="active" />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>

  </div>
</template>

<script setup>
import { ref, nextTick, computed, watch, onMounted } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { claudeSliderValue, imageInput, localModelEndpoint, localModelKey, localSliderValue, messages, selectedModel, sliderValue, userText } from '@/libs/state-management/state';
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

const filteredMessages = computed(() =>
  messages.value
    .filter((message) => message.role !== 'system')
    .map(message => ({
      ...message,
      type: getItemType(message)
    }))
);

function getItemType(item) {
  const baseSize = 50;
  const contentLength = item.content.length;
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

async function scrollToBottom() {
  // Keep your scroll-to-bottom logic if you need it
}

watch(
  () => filteredMessages.value,
  async () => {
    await scrollToBottom();
  },
  { deep: true }
);

onMounted(() => {
  scrollToBottom();
});
</script>

<style lang="scss" scoped>
.scroller,
.message-list {
  height: 87vh;
  overflow-y: auto;
  scrollbar-width: none;
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
</style>