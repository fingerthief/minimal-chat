<template>
    <div class="stored-files-container">
        <h2 class="header">Stored Files</h2>
        <div class="scrollable-list">
            <ul>
                <li v-for="file in files" :key="file.id" @click="addStoredFileToContext(file)">
                    <div class="file-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="file-info">
                        <span class="file-name">{{ file.fileName }}</span>
                    </div>
                    <div class="delete-icon" @click.stop="deleteFile(file.id)">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { showStoredFiles, userText } from '@/libs/state-management/state';
import { addMessage } from '@/libs/conversation-management/message-processing';
import { saveMessagesHandler } from '@/libs/conversation-management/useConversations';
import { showToast } from '@/libs/utils/general-utils';

const files = ref([]);

const fetchStoredFiles = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('UserFilesDB', 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['userFiles'], 'readonly');
            const store = transaction.objectStore('userFiles');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result);
            };

            getAllRequest.onerror = (event) => {
                reject(event.target.error);
            };
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
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

onMounted(async () => {
    files.value = await fetchStoredFiles();
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

.stored-files-container {
    position: absolute;
    z-index: 3;
    padding: 20px;
    background-color: #23262a;
    color: #fff;
    border-radius: 10px;
    max-width: 50vw;
    width: 50vw;
    height: 55vh;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-family: 'Roboto', sans-serif;

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
