// src/libs/utils/indexedDB-utils.js

const DB_NAME = 'UserFilesDB';
const DB_VERSION = 5;
const STORE_NAME = 'userFiles';

async function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => reject(`IndexedDB error: ${event.target.error}`);
        request.onsuccess = (event) => resolve(event.target.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'fileName' });
                console.log(`Created new object store: ${STORE_NAME}`);
            }
        };
    });
}

async function fetchStoredFiles() {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getAllRequest = store.getAll();

        return new Promise((resolve, reject) => {
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = reject;
        });
    } catch (error) {
        console.error(`Error Fetching Stored Files: ${error}`);
        return [];
    }
}

async function storeFile(fileName, fileData, fileSize, fileType) {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.put({ fileName, fileData, fileSize, fileType });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function deleteFile(fileId) {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.delete(fileId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export { fetchStoredFiles, storeFile, deleteFile };
