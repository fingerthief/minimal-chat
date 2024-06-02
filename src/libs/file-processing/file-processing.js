// file-processing.js

import { showToast } from '@/libs/utils/general-utils';
import { analyzeImage } from '@/libs/file-processing/image-analysis';
import { addMessage } from '../conversation-management/message-processing';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { userText } from '../state-management/state';
import { saveMessagesHandler } from '../conversation-management/useConversations';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.mjs';

export async function uploadFileContentsToConversation(event, userText2, addMessage2) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async (e) => {
    const contents = e.target.result;

    if (file.type.startsWith('image/')) {
      showToast('Cannot add images to context currently.');
    } else if (file.type === 'application/pdf') {
      try {
        console.log('Loading PDF document...');

        const loadingTask = pdfjsLib.getDocument({ data: contents });
        const pdfDoc = await loadingTask.promise;

        const numPages = pdfDoc.numPages;
        let pdfText = '';

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          pdfText += pageText + '\n';
        }

        addMessage('user', userText.value + ' ' + pdfText);
        addMessage('assistant', 'Context added from PDF');
        saveMessagesHandler();

        showToast('Context Added from PDF');
      } catch (error) {
        console.error('Error parsing PDF:', error);
        showToast('Failed to parse PDF. It might be encrypted or corrupted.');
      }
    } else {
      addMessage('user', userText.value + ' ' + contents);
      addMessage('assistant', 'Context added');
      saveMessagesHandler();

      showToast('Context Added');
    }
  };

  if (file.type === 'application/pdf') {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
}

export function uploadFile(event, conversations, selectConversationHandler) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const contents = e.target.result;

    try {
      const parsedContents = JSON.parse(contents);

      if (!parsedContents.some((item) => item.id)) {
        console.log('Invalid file format');
        showToast('Error importing conversations');
        return;
      }

      localStorage.setItem('gpt-conversations', contents);
      conversations = parsedContents;
      selectConversationHandler(conversations[0].id);
      showToast('Import successful!');
    } catch (err) {
      console.log('Bad file detected');
    }
  };

  reader.readAsText(file);
}

export async function imageInputChanged(
  event,
  userText,
  messages,
  selectedModel,
  localModelName,
  localModelEndpoint,
  addMessage,
  saveMessagesHandler,
  isLoading
) {
  const file = event.target.files[0];
  const fileType = file.type;

  if (!file) {
    return;
  }

  isLoading.value = true;

  let visionResponse = await processImage(file, fileType, userText, messages, selectedModel, localModelName, localModelEndpoint);

  addMessage('assistant', visionResponse);

  saveMessagesHandler();

  isLoading.value = false;
}

async function processImage(file, fileType, userText, messages, selectedModel, localModelName, localModelEndpoint) {
  userText.value = '';

  return await analyzeImage(file, fileType, messages.value, selectedModel.value, localModelName.value, localModelEndpoint.value);
}
