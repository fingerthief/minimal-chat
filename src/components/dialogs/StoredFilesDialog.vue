<template>
    <div v-if="showStoredFiles" class="stored-files-container">
        <DialogHeader :icon="Database" :iconSize="32" :tooltipText="tooltipText" title="Stored Files"
            headerId="stored-files-header" @close="closeStoredFiles" />
        <div class="search-section">
            <span class="p-input-icon-left">
                <InputText v-model="searchQuery" placeholder="Search files..." @input="onFilter" />
            </span>
            <div class="upload-section">
                <input multiple type="file" ref="fileInput" @change="uploadFile" class="hidden" />
                <Button @click="$refs.fileInput.click()">
                    Upload File &nbsp;
                    <Upload />
                </Button>
            </div>
        </div>
        <DataTable ref="dt" :value="filteredFiles" stripedRows paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]"
            tableStyle="min-width: 25rem"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} files">
            <Column field="fileId" hidden header="File ID" style="width: 20%" />
            <Column field="fileName" header="File Name" style="width: 50%" />
            <Column field="fileSize" header="Size" style="width: 20%">
                <template #body="{ data }">
                    {{ formatFileSize(data.fileSize) }}
                </template>
            </Column>
            <Column field="fileType" header="Format" style="width: 100%" />
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
                    <Button @click="handleDeleteFile(data.fileId)" icon="pi pi-trash"
                        class="p-button-rounded p-button-danger" title="Delete File" />
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
import { Upload, Database } from 'lucide-vue-next';
import { storeFileData } from '@/libs/file-processing/image-analysis';
import InputText from 'primevue/inputtext';
import { fetchStoredFiles, deleteFile, getTotalDatabaseSize } from '@/libs/utils/indexed-db-utils';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

const files = ref([]);
const searchQuery = ref('');
const fileInput = ref(null);
const databaseSize = ref('0.00');

const updateDatabaseSize = async () => {
    databaseSize.value = await getTotalDatabaseSize();
};

const filteredFiles = computed(() => {
    if (!searchQuery.value) return files.value;
    return files.value.filter(file =>
        file.fileName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const formatFileSize = (sizeInBytes) => {
    return (sizeInBytes / 1024).toFixed(2) + ' KB';
};

const onFilter = () => {
    // The filtering is now handled by the computed property
};

const closeStoredFiles = () => {
    showStoredFiles.value = false;
};

const handleFetchStoredFiles = async () => {
    files.value = await fetchStoredFiles();
};

const addStoredFileToContext = async (file) => {
    const messageContent = file.fileType.startsWith('image/')
        ? [
            { type: 'image_url', image_url: { url: file.fileData } },
            { type: 'text', text: `${userText.value}\n\nImage: ${file.fileName}` }
        ]
        : [{ type: 'text', text: `${userText.value} ${file.fileData}` }];

    if (file.fileType.startsWith('image/')) {
        addMessage('user', messageContent);
    }
    else {
        addMessage('user', `#contextAdded: ${file.fileName} | ${messageContent[0].text}`);
    }

    addMessage('assistant', `${file.fileName} context added from storage.`);

    showToast("Successfully Added File Context From Storage");
    saveMessagesHandler();
    showStoredFiles.value = false;
};

const handleDeleteFile = async (fileId) => {
    try {
        await deleteFile(fileId);
        files.value = files.value.filter(file => file.fileId !== fileId);
        await updateDatabaseSize();
        showToast("File Deleted From Storage");
    } catch (error) {
        console.error('Failed to delete file:', error);
    }
};

const downloadFile = async (file) => {
    try {
        const blob = new Blob([file.fileData], { type: file.fileType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName;
        a.click();
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

    for (const file of selectedFiles) {
        await processFile(file);
    }

    await updateDatabaseSize();
};

const processFile = async (file) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
        const contents = e.target.result;
        if (file.type.startsWith('image/')) {
            await storeFileData(file.name, contents, file.size, file.type);
        } else if (file.type === 'application/pdf') {
            await processPDF(contents, file);
        } else {
            await storeFileData(file.name, contents, file.size, file.type);
        }

        files.value = await fetchStoredFiles();
        console.log(files.value);

        showToast('File uploaded and stored successfully');
    };

    if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file);
    }
};

const processPDF = async (contents, file) => {
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
    } catch (error) {
        console.error('Error parsing PDF:', error);
        showToast('Failed to parse PDF. It might be encrypted or corrupted.');
    }
};

const tooltipText = computed(() => `Total Browser Database Size: ${databaseSize.value}MB`);

onMounted(async () => {
    files.value = await fetchStoredFiles();
    await updateDatabaseSize();
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
    transition: background-color 0.15s ease;

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
        transition: color 0.15s ease;

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
    border: 2px solid rgba(8, 62, 53, 0.8509803922);

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
    transition: background-color 0.15s ease;
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
    transition: color 0.15s ease;
    display: inline-block;
    padding-left: 6px;
}

.delete-icon:hover {
    color: #84433b;
}

.hidden {
    display: none;
}
</style>
