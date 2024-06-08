<template>
    <div class="stored-files-container">
        <DialogHeader title="Stored Files" headerId="stored-files-header" @close="closeStoredFiles" />
        <div class="upload-section">
            <input type="file" ref="fileInput" @change="uploadFile" />
            <Button @click="$refs.fileInput.click()">
                Upload File &nbsp;<Upload></Upload>
            </Button>
        </div>
        <DataTable :value="files" stripedRows paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]"
            tableStyle="min-width: 25rem"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} files">
            <Column field="id" header="File ID" style="width: 20%"></Column>
            <Column field="fileName" header="File Name" style="width: 40%"></Column>
            <Column field="fileData" header="" style="width: 20%">
                <template #body="{ data }">
                    <Button @click.stop="addStoredFileToContext(data)" icon="pi pi-plus"
                        class="p-button-rounded p-button-success" title="Add to Context" />
                </template>
            </Column>
            <Column field="id" header="" style="width: 20%">
                <template #body="{ data }">
                    <Button @click="deleteFile(data.id)" icon="pi pi-trash" class="p-button-rounded p-button-danger"
                        title="Delete File" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DialogHeader from '../controls/DialogHeader.vue';
import { showStoredFiles, userText } from '@/libs/state-management/state';
import { addMessage } from '@/libs/conversation-management/message-processing';
import { saveMessagesHandler } from '@/libs/conversation-management/useConversations';
import { showToast } from '@/libs/utils/general-utils';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { Upload, X } from 'lucide-vue-next';
import { storeFileData } from '@/libs/file-processing/image-analysis';

const files = ref();

const closeStoredFiles = () => {
    showStoredFiles.value = false;
};

const fetchStoredFiles = async () => {
    try {
        const request = indexedDB.open('UserFilesDB', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('userFiles')) {
                db.createObjectStore('userFiles', { keyPath: 'id', autoIncrement: true });
            }
        };

        const event = await new Promise((resolve, reject) => {
            request.onsuccess = resolve;
            request.onerror = reject;
        });

        const db = event.target.result;
        const transaction = db.transaction(['userFiles'], 'readonly');
        const store = transaction.objectStore('userFiles');
        const getAllRequest = store.getAll();

        const result = await new Promise((resolve, reject) => {
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = reject;
        });

        return result;
    } catch (error) {
        console.error(`Error Fetching Stored Files: ${error}`);
    }
};


const addStoredFileToContext = (file) => {
    addMessage('user', userText.value + ' ' + file.fileData);
    addMessage('assistant', `${file.fileName} context added from storage.`);

    showToast("Successfully Added File Context From Storage");
    saveMessagesHandler();
    showStoredFiles.value = false;
};

const deleteFile = (fileId) => {
    const request = indexedDB.open('UserFilesDB', 1);

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['userFiles'], 'readwrite');
        const store = transaction.objectStore('userFiles');
        const deleteRequest = store.delete(fileId);

        deleteRequest.onsuccess = () => {
            files.value = files.value.filter(file => file.id !== fileId);
            showToast("File Deleted From Storage");
        };

        deleteRequest.onerror = (event) => {
            console.error('Failed to delete file:', event.target.error);
        };
    };

    request.onerror = (event) => {
        console.error('Failed to open database:', event.target.error);
    };
};

const uploadFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
        const contents = e.target.result;

        if (file.type === 'application/pdf') {
            try {
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

                await storeFileData(file.name, pdfText);
                showToast('File uploaded and stored successfully');
            } catch (error) {
                console.error('Error parsing PDF:', error);
                showToast('Failed to parse PDF. It might be encrypted or corrupted.');
            }
        } else {
            await storeFileData(file.name, contents);
            showToast('File uploaded and stored successfully');
        }

        files.value = await fetchStoredFiles();
    };

    if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file);
    }
};

onMounted(async () => {
    files.value = await fetchStoredFiles();
});
</script>

<style scoped lang="scss">
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    border-bottom: 5px solid rgba(66, 64, 69, 0.7098039216);
    margin-bottom: 20px;

    h2 {
        margin: 0;
    }

    .close-icon {
        background: none;
        border: none;
        color: #ffffff;
        font-size: 24px;
        cursor: pointer;
        transition: color 0.3s ease;

        &:hover {
            color: #ff6b6b;
        }
    }
}


.upload-section {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

.upload-section input[type="file"] {
    display: none;
}

.upload-section button {
    margin-left: 10px;
}


.stored-files-container {
    position: absolute;
    z-index: 3;
    padding: 20px;
    background-color: #23262a;
    color: #fff;
    border-radius: 10px;
    max-width: 50vw;
    width: 50vw;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-family: 'Roboto', sans-serif;


    @media (max-width: 600px) {
        width: 95vw;
        max-width: 95vw;
    }

    .header {
        padding-bottom: 12px;
        text-align: center;
    }
}

.scrollable-list {
    max-height: 65vh;
    overflow-y: auto;
    border: 1px solid #333;
    border-radius: 10px;
    padding: 10px;
    background-color: #2a2a2a;
}

ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    border-bottom: 1px solid #333;
    transition: background-color 0.3s ease;
    cursor: pointer;
}

li:hover {
    background-color: #3a3a3a;
}

.file-icon {
    margin-right: 15px;
    color: #4caf50;
    font-size: 1.5em;
}

.file-info {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.file-name {
    font-weight: bold;
    font-size: 1.1em;
}

.delete-icon {
    color: #b2b0b0;
    font-size: 1.2em;
    cursor: pointer;
    transition: color 0.3s ease;
    display: inline-block;
    padding-left: 6px;

}

.delete-icon:hover {
    color: #84433b;
}
</style>
