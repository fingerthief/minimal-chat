// file-processing.js

import { showToast } from '@/libs/utils/general-utils';
import { analyzeImage, storeFileData } from '@/libs/file-processing/image-analysis';
import { addMessage } from '../conversation-management/message-processing';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { userText } from '../state-management/state';
import { saveMessagesHandler } from '../conversation-management/useConversations';
import { handleTextStreamEnd } from '@/libs/utils/general-utils';

// Initialize PDF.js worker
initializePdfWorker();

async function initializePdfWorker() {
    try {
        const workerSrc = await import('pdfjs-dist/build/pdf.worker.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc.default;
    } catch (e) {
        console.error('Failed to initialize PDF worker:', e);
    }
}

// Core file processing functions
async function processTextFile(file, contents) {
    await storeFileData(file.name, contents, file.size, file.type);
    addMessage('user', '#contextAdded: ' + userText.value + ' ' + contents);
    addMessage('assistant', 'Context added');
    saveMessagesHandler();
    showToast('Context Added');
}

async function processPdfFile(file, contents) {
    try {
        console.log('Loading PDF document...');
        const pdfText = await extractPdfText(contents);
        await storeFileData(file.name, pdfText, file.size, file.type);

        addMessage('user', '#contextAdded: ' + userText.value + ' ' + pdfText);
        addMessage('assistant', 'Context added from PDF: ' + file.name);
        saveMessagesHandler();

        showToast('Context Added from PDF');
    } catch (error) {
        console.error('Error parsing PDF:', error);
        showToast('Failed to parse PDF. It might be encrypted or corrupted.');
    }
}

async function extractPdfText(pdfData) {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdfDoc = await loadingTask.promise;
    let pdfText = '';

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        pdfText += pageText + '\n';
    }

    return pdfText;
}

// File reader setup and handling
function setupFileReader(file, onLoadCallback) {
    const reader = new FileReader();
    reader.onload = onLoadCallback;

    if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file);
    }
}

// Exported functions
export async function onUploadFileContentsToConversation(event) {
    const file = event.target.files[0];
    if (!file) return;

    setupFileReader(file, async (e) => {
        const contents = e.target.result;

        if (file.type.startsWith('image/')) {
            showToast('Use the dedicated image upload button instead!');
            return;
        }

        if (file.type === 'application/pdf') {
            await processPdfFile(file, contents);
        } else {
            await processTextFile(file, contents);
        }
    });
}

export async function uploadFileContentsToConversation(providedFile) {
    if (!providedFile) return;

    setupFileReader(providedFile, async (e) => {
        const contents = e.target.result;

        if (providedFile.type.startsWith('image/')) {
            showToast('Use the dedicated image upload button instead!');
            return;
        }

        if (providedFile.type === 'application/pdf') {
            await processPdfFile(providedFile, contents);
        } else {
            await processTextFile(providedFile, contents);
        }
    });
}

export function uploadFile(event, conversations, selectConversationHandler) {
    const file = event.target.files[0];
    if (!file) return;

    setupFileReader(file, (e) => {
        try {
            const parsedContents = JSON.parse(e.target.result);
            if (!parsedContents.some((item) => item.id)) {
                console.log('Invalid file format');
                showToast('Error importing conversations');
                return;
            }

            localStorage.setItem('gpt-conversations', e.target.result);
            conversations = parsedContents;
            selectConversationHandler(conversations[0].id);
            showToast('Import successful!');
        } catch (err) {
            console.log('Bad file detected');
        }
    });
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
    if (!file) return;

    isLoading.value = true;
    userText.value = '';

    const visionResponse = await analyzeImage(
        file,
        file.type,
        messages.value,
        selectedModel.value,
        localModelName.value,
        localModelEndpoint.value
    );

    addMessage('assistant', visionResponse);
    saveMessagesHandler();
    handleTextStreamEnd(visionResponse);
    isLoading.value = false;
}