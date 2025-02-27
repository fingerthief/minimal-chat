<template>
    <div v-if="showStoredFiles" class="stored-files-container">
        <DialogHeader :icon="Database" :iconSize="32" :tooltipText="tooltipText" title="Stored Files"
            headerId="stored-files-header" @close="closeStoredFiles" />
        <div class="search-section">
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="searchQuery" placeholder="Search files..." @input="onFilter" />
            </span>
            <input multiple type="file" ref="fileInput" @change="uploadFile" class="hidden" />
        </div>
        <DataTable ref="dt" :value="filteredFiles" stripedRows paginator :rows="5" :rowsPerPageOptions="[5, 10, 15]"
            tableStyle="min-width: 25rem" class="files-table" scrollable scrollHeight="400px"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} files">
            <Column field="fileId" hidden header="File ID" style="width: 20%" />
            <Column field="fileName" header="File Name" style="width: 50%">
                <template #body="{ data }">
                    <div class="file-name-cell">
                        <i :class="getFileIcon(data.fileType)" />
                        <span>{{ data.fileName }}</span>
                    </div>
                </template>
            </Column>
            <Column field="fileSize" header="Size" style="width: 20%">
                <template #body="{ data }">
                    {{ formatFileSize(data.fileSize) }}
                </template>
            </Column>
            <Column field="fileType" header="Format" style="width: 100%">
                <template #body="{ data }">
                    <span class="file-format-badge">{{ getFileFormat(data.fileType) }}</span>
                </template>
            </Column>
            <Column header="Actions" style="width: 25%">
                <template #body="{ data }">
                    <div class="action-buttons">
                        <Button @click="downloadFile(data)" icon="pi pi-download" class="p-button-rounded p-button-info p-button-sm"
                            title="Download File" />
                        <Button @click.stop="addStoredFileToContext(data)" icon="pi pi-plus"
                            class="p-button-rounded p-button-success p-button-sm" title="Add to Context" />
                        <Button @click="handleDeleteFile(data.fileId)" icon="pi pi-trash"
                            class="p-button-rounded p-button-danger p-button-sm" title="Delete File" />
                    </div>
                </template>
            </Column>
            <template #footer>
                <div class="add-new-file-row" @click="$refs.fileInput.click()">
                    <i class="pi pi-plus"></i>
                    <span>Upload New Files</span>
                </div>
            </template>
            <template #empty>
                <div class="empty-message">
                    <i class="pi pi-inbox empty-icon"></i>
                    <p>No files found</p>
                    <Button @click="$refs.fileInput.click()" class="p-button-outlined">Upload Files</Button>
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
import { Upload, Database, FileText, Image as ImageIcon, FileJson } from 'lucide-vue-next';
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
    if (sizeInBytes < 1024) {
        return sizeInBytes + ' B';
    } else if (sizeInBytes < 1024 * 1024) {
        return (sizeInBytes / 1024).toFixed(2) + ' KB';
    } else {
        return (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
};

const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
        return 'pi pi-image';
    } else if (fileType === 'application/pdf') {
        return 'pi pi-file-pdf';
    } else if (fileType === 'application/json') {
        return 'pi pi-code';
    } else if (fileType.includes('text/')) {
        return 'pi pi-file-text';
    } else {
        return 'pi pi-file';
    }
};

const getFileFormat = (fileType) => {
    if (fileType.startsWith('image/')) {
        return fileType.split('/')[1].toUpperCase();
    } else if (fileType === 'application/pdf') {
        return 'PDF';
    } else if (fileType === 'application/json') {
        return 'JSON';
    } else if (fileType.includes('text/')) {
        return 'TEXT';
    } else {
        return fileType.split('/')[1] || 'FILE';
    }
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

const uploadDragDropFiles = async (files) => {
    if (!files.length) return;

    for (const file of files) {
        await processFile(file);

        await addStoredFileToContext(file);
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
    margin-bottom: 1rem;
    
    .p-input-icon-left {
        width: 100%;
        position: relative;
        display: inline-flex;
        
        i {
            color: #157474;
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1;
        }
        
        input {
            width: 100%;
            background-color: rgba(255, 255, 255, 0.08);
            border-color: transparent;
            border-bottom: 2px solid #157474;
            border-radius: 4px;
            padding-left: 2.5rem;
            
            &:focus {
                box-shadow: 0 0 0 2px rgba(21, 116, 116, 0.2);
            }
        }
    }
}

.files-table {
    margin-top: 1rem;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    flex: 1;
    display: flex;
    flex-direction: column;
    
    :deep(.p-datatable) {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
    }
    
    :deep(.p-datatable-wrapper) {
        flex: 1;
        overflow: hidden;
    }
    
    :deep(.p-datatable-header),
    :deep(.p-datatable-footer) {
        background-color: #212121;
    }
    
    :deep(.p-datatable-thead) th {
        background-color: #272727;
        color: #fff;
        font-weight: 600;
        border-color: #333;
        position: sticky;
        top: 0;
        z-index: 1;
    }
    
    :deep(.p-datatable-tbody) tr {
        transition: background-color 0.2s;
        
        &:hover {
            background-color: rgba(21, 116, 116, 0.1) !important;
        }
        
        &.p-highlight {
            background-color: rgba(21, 116, 116, 0.15) !important;
        }
    }
    
    :deep(.p-paginator) {
        background-color: #272727;
        border-top: 1px solid #333;
    }
    
    :deep(.p-dropdown-panel) {
        max-height: 200px;
    }
    
    :deep(.p-dropdown-items-wrapper) {
        max-height: 150px !important;
    }
}

.file-name-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    i {
        font-size: 1.25rem;
        color: #157474;
    }
    
    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.file-format-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: rgba(21, 116, 116, 0.2);
    color: #f0f0f0;
    border-radius: 4px;
    font-size: 0.8rem;
    text-transform: uppercase;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    
    button {
        width: 2rem;
        height: 2rem;
        transition: transform 0.2s;
        
        &:hover {
            transform: scale(1.15);
        }
    }
}

.add-new-file-row {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-color: rgba(21, 116, 116, 0.15);
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 0 0 8px 8px;

    &:hover {
        background-color: rgba(21, 116, 116, 0.3);
    }

    i {
        margin-right: 0.5rem;
        color: #157474;
    }
}

.empty-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 1rem;
    color: #aaa;
    
    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #555;
    }
    
    p {
        margin-bottom: 1.5rem;
    }
}

.stored-files-container {
    position: fixed;
    z-index: 3;
    padding: 1.5rem;
    background-color: #1d1e1e;
    color: #fff;
    border-radius: 10px;
    max-width: 700px;
    width: 80vw;
    max-height: 85vh;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    font-family: 'Roboto', sans-serif;
    border: 2px solid rgba(21, 116, 116, 0.7);
    backdrop-filter: blur(10px);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @media (max-width: 768px) {
        width: 95vw;
        max-height: 90vh;
    }
}

.hidden {
    display: none;
}

/* Custom scrollbar styling */
:deep(.p-datatable-wrapper),
:deep(.p-datatable-scrollable-body),
:deep(.p-dropdown-items-wrapper) {
    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgba(21, 116, 116, 0.4) rgba(20, 20, 20, 0.2);

    /* Chrome, Edge, Safari */
    &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(20, 20, 20, 0.2);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(21, 116, 116, 0.4);
        border-radius: 4px;
        transition: background 0.2s ease;

        &:hover {
            background: rgba(21, 116, 116, 0.6);
        }
    }
}
</style>
