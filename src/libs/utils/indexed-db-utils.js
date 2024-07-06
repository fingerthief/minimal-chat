import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'UserFilesDB';
const DB_VERSION = 6;
const STORE_NAME = 'userFiles';

async function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => reject(`IndexedDB error: ${event.target.error}`);
        request.onsuccess = (event) => resolve(event.target.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'fileId' });
                store.createIndex('fileName', 'fileName', { unique: false });
                console.log(`Created new object store: ${STORE_NAME}`);
            }
        };
    });
}

async function fetchStoredFiles() {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const getAllRequest = store.getAll();

        return new Promise((resolve, reject) => {
            getAllRequest.onsuccess = () => {
                const files = getAllRequest.result;
                const updatedFiles = files.map(file => {
                    if (!file.fileId) {
                        file.fileId = uuidv4();
                        store.put(file);
                    }
                    return file;
                });
                resolve(updatedFiles);
            };
            getAllRequest.onerror = reject;
        });
    } catch (error) {
        console.error(`Error Fetching Stored Files: ${error}`);
        return [];
    }
}

async function fetchStoredImageFiles() {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const getAllRequest = store.getAll();

        return new Promise((resolve, reject) => {
            getAllRequest.onsuccess = () => {
                const files = getAllRequest.result;
                const updatedImageFiles = files
                    .filter(file => file.fileType.startsWith('image/'))
                    .map(file => {
                        if (!file.fileId) {
                            file.fileId = uuidv4();
                            store.put(file);
                        }
                        return file;
                    });
                resolve(updatedImageFiles);
            };
            getAllRequest.onerror = reject;
        });
    } catch (error) {
        console.error(`Error Fetching Stored Image Files: ${error}`);
        return [];
    }
}


async function storeFile(fileName, fileData, fileSize, fileType) {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const file = {
        fileId: uuidv4(),
        fileName,
        fileData,
        fileSize,
        fileType,
        uploadDate: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
        const request = store.add(file);
        request.onsuccess = () => resolve(file.fileId);
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

async function getTotalDatabaseSize() {
    try {
        const files = await fetchStoredFiles();
        const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
        return (totalSize / (1024 * 1024)).toFixed(2); // Convert to MB
    } catch (error) {
        console.error(`Error calculating total database size: ${error}`);
        return '0.00';
    }
}

async function clearDatabase() {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export { fetchStoredImageFiles, fetchStoredFiles, storeFile, deleteFile, getTotalDatabaseSize, clearDatabase };
