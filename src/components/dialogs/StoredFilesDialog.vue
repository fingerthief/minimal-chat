<template>
    <div v-if="showStoredFiles" class="stored-files-container">
        <DialogHeader :icon="Database" :iconSize="32" :tooltipText="tooltipText" title="Stored Files"
            headerId="stored-files-header" @close="closeStoredFiles" />
        
        <div class="dialog-content">
            <div class="search-and-actions">
                <div class="search-wrapper">
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="searchQuery" placeholder="Search files..." @input="onFilter" />
                    </span>
                </div>
                <div class="upload-btn-wrapper">
                    <Button @click="$refs.fileInput.click()" icon="pi pi-upload" class="p-button-primary upload-btn" label="Upload Files" />
                    <input multiple type="file" ref="fileInput" @change="uploadFile" class="hidden" />
                </div>
            </div>
            
            <DataTable ref="dt" :value="filteredFiles" 
                :rowHover="true"
                stripedRows 
                paginator 
                :rows="5" 
                :rowsPerPageOptions="[5, 10, 15]"
                tableStyle="min-width: 25rem" 
                class="files-table" 
                scrollable 
                scrollHeight="400px"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} files">
                
                <Column field="fileId" hidden header="File ID" />
                
                <Column field="fileName" header="File" style="width: 50%">
                    <template #body="{ data }">
                        <div class="file-name-cell">
                            <div class="file-icon-wrapper">
                                <i :class="getFileIcon(data.fileType)" />
                            </div>
                            <div class="file-details">
                                <span class="file-name">{{ data.fileName }}</span>
                                <span class="file-size">{{ formatFileSize(data.fileSize) }}</span>
                            </div>
                        </div>
                    </template>
                </Column>
                
                <Column field="fileType" header="Format" style="width: 20%">
                    <template #body="{ data }">
                        <span class="file-format-badge">{{ getFileFormat(data.fileType) }}</span>
                    </template>
                </Column>
                
                <Column header="Actions" style="width: 30%">
                    <template #body="{ data }">
                        <div class="action-buttons">
                            <Button @click="downloadFile(data)" 
                                icon="pi pi-download" 
                                class="p-button-text p-button-rounded action-btn"
                                v-tooltip.top="'Download File'" />
                                
                            <Button @click.stop="addStoredFileToContext(data)" 
                                icon="pi pi-plus" 
                                class="p-button-text p-button-rounded action-btn action-btn-add"
                                v-tooltip.top="'Add to Context'" />
                                
                            <Button @click="handleDeleteFile(data.fileId)" 
                                icon="pi pi-trash" 
                                class="p-button-text p-button-rounded action-btn action-btn-delete"
                                v-tooltip.top="'Delete File'" />
                        </div>
                    </template>
                </Column>
                
                <template #empty>
                    <div class="empty-state">
                        <div class="empty-icon-wrapper">
                            <i class="pi pi-cloud-upload"></i>
                        </div>
                        <h3>No files found</h3>
                        <p>Upload files to see them here</p>
                        <Button @click="$refs.fileInput.click()" label="Upload Files" icon="pi pi-upload" class="p-button-outlined" />
                    </div>
                </template>
            </DataTable>
        </div>
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
.stored-files-container {
    position: fixed;
    z-index: 2000;
    padding: 0;
    background-color: #1a1e21;
    color: #fff;
    border-radius: 16px;
    max-width: 800px;
    width: 80vw;
    max-height: 85vh;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3), 0 8px 10px rgba(0, 0, 0, 0.22);
    font-family: 'Roboto', sans-serif;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    @media (max-width: 768px) {
        width: 95vw;
        max-height: 90vh;
    }
}

.dialog-content {
    padding: 0 1.5rem 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.search-and-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: stretch;
    }
}

.search-wrapper {
    flex: 1;
    
    .p-input-icon-left {
        width: 100%;
        position: relative;
        display: inline-flex;
        
        i {
            color: rgba(255, 255, 255, 0.6);
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1;
        }
        
        input {
            width: 100%;
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 0.7rem 1rem 0.7rem 2.5rem;
            transition: all 0.2s ease;
            color: #ffffff;
            
            &:focus {
                box-shadow: 0 0 0 3px rgba(21, 116, 116, 0.25);
                background-color: rgba(255, 255, 255, 0.08);
                border-color: rgba(21, 116, 116, 0.5);
            }
            
            &::placeholder {
                color: rgba(255, 255, 255, 0.4);
            }
        }
    }
}

.upload-btn-wrapper {
    .upload-btn {
        background: linear-gradient(45deg, #157474, #1b8f8f);
        border: none;
        border-radius: 8px;
        padding: 0.7rem 1.2rem;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        
        &:hover {
            background: linear-gradient(45deg, #1b8f8f, #21aaaa);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        &:active {
            transform: translateY(0);
        }
    }
}

.files-table {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    
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
    
    :deep(.p-datatable-header) {
        background-color: rgba(30, 30, 30, 0.5);
        padding: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    :deep(.p-datatable-thead) th {
        background-color: rgba(30, 30, 30, 0.7);
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
        border-color: rgba(255, 255, 255, 0.06);
        padding: 1rem;
        position: sticky;
        top: 0;
        z-index: 1;
        font-size: 0.9rem;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }
    
    :deep(.p-datatable-tbody) td {
        padding: 0.8rem 1rem;
        border-color: rgba(255, 255, 255, 0.04);
    }
    
    :deep(.p-datatable-tbody) tr {
        transition: background-color 0.2s ease;
        backdrop-filter: blur(5px);
        
        &:nth-child(odd) {
            background-color: rgba(255, 255, 255, 0.02);
        }
        
        &:hover {
            background-color: rgba(21, 116, 116, 0.08) !important;
        }
        
        &.p-highlight {
            background-color: rgba(21, 116, 116, 0.15) !important;
        }
    }
    
    :deep(.p-paginator) {
        background-color: rgba(30, 30, 30, 0.5);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding: 0.75rem;
        
        button {
            color: rgba(255, 255, 255, 0.7);
            
            &:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
            
            &.p-highlight {
                background-color: #157474;
            }
        }
    }
}

.file-name-cell {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .file-icon-wrapper {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(21, 116, 116, 0.15);
        border-radius: 8px;
        
        i {
            font-size: 1.3rem;
            color: #20abab;
        }
    }
    
    .file-details {
        display: flex;
        flex-direction: column;
        
        .file-name {
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: rgba(255, 255, 255, 0.95);
        }
        
        .file-size {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 0.25rem;
        }
    }
}

.file-format-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: rgba(21, 116, 116, 0.15);
    color: #20abab;
    border-radius: 30px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.action-buttons {
    display: flex;
    gap: 0.25rem;
    justify-content: flex-end;
    
    .action-btn {
        width: 2.2rem;
        height: 2.2rem;
        transition: all 0.2s ease;
        color: rgba(255, 255, 255, 0.7);
        background-color: transparent;
        border: none;
        
        &:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.95);
            transform: translateY(-2px);
        }
        
        &.action-btn-add:hover {
            color: #4caf50;
        }
        
        &.action-btn-delete:hover {
            color: #f44336;
        }
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4rem 1rem;
    text-align: center;
    
    .empty-icon-wrapper {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: rgba(21, 116, 116, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
        
        i {
            font-size: 2.5rem;
            color: #20abab;
        }
    }
    
    h3 {
        margin: 0 0 0.5rem 0;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
    }
    
    p {
        margin: 0 0 2rem 0;
        color: rgba(255, 255, 255, 0.6);
    }
    
    button {
        background-color: transparent;
        border: 2px solid #157474;
        color: #20abab;
        border-radius: 8px;
        padding: 0.5rem 1.5rem;
        transition: all 0.3s ease;
        
        &:hover {
            background-color: #157474;
            color: #ffffff;
        }
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
