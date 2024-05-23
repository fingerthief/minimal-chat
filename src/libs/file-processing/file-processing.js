// file-processing.js

import { showToast } from '@/libs/utils/general-utils';
import { analyzeImage } from '@/libs/file-processing/image-analysis';

export async function uploadFileContentsToCoversation(event, userText, addMessage) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const contents = e.target.result;

    if (file.type.startsWith('image/')) {
      showToast('Cannot add images to context currently.');
    } else {
      // The uploaded file is not an image
      addMessage('user', userText.value + ' ' + contents);
      addMessage('assistant', 'Context added');
      showToast('Context Added');
    }
  };

  await reader.readAsText(file);
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
