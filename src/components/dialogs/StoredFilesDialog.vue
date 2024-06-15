<template>
    <div v-if="showStoredFiles" class="stored-files-container">
        <DialogHeader :icon="Database" :iconSize="32" :tooltipText="tooltipText" title="Stored Files"
            headerId="stored-files-header" @close="closeStoredFiles" />
        <div class="search-section">
            <span class="p-input-icon-left">
                <InputText v-model="filters['global'].value" placeholder="Search files..." />
            </span>
            <div class="upload-section">
                <input multiple type="file" ref="fileInput" @change="uploadFile" />
                <Button @click="$refs.fileInput.click()">
                    Upload File &nbsp;<Upload></Upload>
                </Button>
            </div>
        </div>
        <DataTable ref="dt" :value="files" stripedRows paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]"
            tableStyle="min-width: 25rem"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} files" :filters="filters"
            @filter="onFilter">
            <Column field="id" header="File ID" style="width: 20%"></Column>
            <Column field="fileName" header="File Name" style="width: 50%"></Column>
            <Column field="fileSize" header="Size" style="width: 20%">
                <template #body="slotProps">
                    {{ formatFileSize(slotProps.data.fileSize) }}
                </template>
            </Column>
            <Column field="fileType" header="Format" style="width: 100%"></Column>
            <Column field="id" header="" style="width: 20%">
                <template #body="{ data }">
                    <Button @click="downloadFile(data)" icon="pi pi-download" class="p-button-rounded p-button-info"
                        title="Download File" />
                </template>
            </Column>
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
            <template #footer>
                <div class="add-new-file-row" @click="$refs.fileInput.click()">
                    <i class="pi pi-plus"></i>
                    <span>Add New File</span>
                </div>
            </template>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import DialogHeader from '../controls/DialogHeader.vue';
import { showStoredFiles, userText } from '@/libs/state-management/state';
import { addMessage } from '@/libs/conversation-management/message-processing';
import { saveMessagesHandler } from '@/libs/conversation-management/useConversations';
import { showToast } from '@/libs/utils/general-utils';
import { Upload, X, Database } from 'lucide-vue-next';
import { storeFileData } from '@/libs/file-processing/image-analysis';
import InputText from 'primevue/inputtext';

const files = ref([]);

const dt = ref(null);
const filters = ref({
    global: { value: null, matchMode: 'contains' }
});

const formatFileSize = (sizeInBytes) => {
    return (sizeInBytes / 1024).toFixed(2) + ' KB';
};

const onFilter = () => {
    const searchQuery = filters.value.global.value;
    if (searchQuery) {
        dt.value.filteredValue = files.value.filter(file =>
            file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    } else {
        dt.value.filteredValue = files.value;
    }
};

const closeStoredFiles = () => {
    showStoredFiles.value = false;
};

const fetchStoredFiles = async () => {
    try {
        const request = indexedDB.open('UserFilesDB', 4);

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
    const request = indexedDB.open('UserFilesDB', 4);

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

const downloadFile = async (file) => {
    try {
        const blob = new Blob([file.fileData], { type: file.fileType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('File downloaded successfully');
    } catch (error) {
        console.error('Error downloading file:', error);
        showToast('Failed to download file');
    }
};

const uploadFile = async (event) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles.length) return;

    const processFile = async (file) => {
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

                    await storeFileData(file.name, pdfText, file.size, file.type);
                    showToast('File uploaded and stored successfully');
                } catch (error) {
                    console.error('Error parsing PDF:', error);
                    showToast('Failed to parse PDF. It might be encrypted or corrupted.');
                }
            } else {
                await storeFileData(file.name, contents, file.size, file.type);
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

    for (const file of selectedFiles) {
        await processFile(file);
    }
};

const databaseSize = computed(() => {
    const totalSize = files.value.reduce((sum, file) => sum + file.fileSize, 0);
    return (totalSize / (1024 * 1024)).toFixed(2); // Convert to MB
});

const tooltipText = computed(() => `Total Browser Database Size: ${databaseSize.value}MB`);


onMounted(async () => {
    files.value = await fetchStoredFiles();
});
</script>

<style scoped lang="scss">
.search-section {
    margin-bottom: 0px
}

.add-new-file-row {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background-color: #3a3a3a;
    color: #ffffff;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #4a4a4a;
    }

    i {
        margin-right: 5px;
    }
}

/* Existing styles */
.search-section {
    margin-bottom: 0px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    background-color: #1d1e1e;
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
    display: none;
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
    background-color: #1d1e1e;
    color: #fff;
    border-radius: 10px;
    max-width: 50vw;
    width: 50vw;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-family: 'Roboto', sans-serif;

    @media (max-width: 600px) {
        width: 100vw;
        max-width: 100vw;
        height: 100vh;
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
