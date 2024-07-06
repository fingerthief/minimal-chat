import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'UserFilesDB';
const DB_VERSION = 6;
const STORE_NAME = 'userFiles';

/**
 * Opens or creates an IndexedDB database for storing user files.
 * 
 * This function attempts to open an IndexedDB database with the specified name and version.
 * If the database doesn't exist or needs to be upgraded, it creates a new object store
 * for user files with a 'fileId' key path and a 'fileName' index.
 * 
 * @returns {Promise<IDBDatabase>} A promise that resolves with the opened database object.
 * @throws {Error} If there's an error opening the database.
 */
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

/**
 * Fetches all stored files from the IndexedDB database.
 * 
 * This function opens the database, retrieves all files from the object store,
 * and ensures each file has a unique fileId. If a file doesn't have a fileId,
 * it generates one using uuidv4() and updates the file in the store.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of file objects.
 *                           Each file object contains properties such as fileId,
 *                           fileName, fileData, fileSize, fileType, and uploadDate.
 * @throws {Error} If there's an error fetching the files, it logs the error
 *                 and returns an empty array.
 */
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

/**
 * Fetches all stored image files from the IndexedDB database.
 * 
 * This function opens the database, retrieves all files from the object store,
 * filters for image files (based on the 'image/' MIME type prefix), and ensures
 * each image file has a unique fileId. If an image file doesn't have a fileId,
 * it generates one using uuidv4() and updates the file in the store.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of image file objects.
 *                           Each file object contains properties such as fileId,
 *                           fileName, fileData, fileSize, fileType, and uploadDate.
 * @throws {Error} If there's an error fetching the files, it logs the error
 *                 and returns an empty array.
 */
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


/**
 * Stores a file in the IndexedDB database.
 * 
 * This function takes file information as parameters and stores it in the IndexedDB database.
 * It generates a unique fileId using uuidv4() and includes the current date as the upload date.
 * 
 * @param {string} fileName - The name of the file to be stored.
 * @param {*} fileData - The data of the file to be stored. This can be of any type depending on how the file is represented.
 * @param {number} fileSize - The size of the file in bytes.
 * @param {string} fileType - The MIME type of the file.
 * @returns {Promise<string>} A promise that resolves with the generated fileId if the storage is successful.
 * @throws {Error} If there's an error storing the file, the promise is rejected with the error.
 */
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

/**
 * Deletes a file from the IndexedDB database based on its fileId.
 * 
 * This function opens a database transaction, accesses the object store,
 * and attempts to delete the file with the specified fileId.
 * 
 * @param {string} fileId - The unique identifier of the file to be deleted.
 * @returns {Promise<void>} A promise that resolves when the file is successfully deleted,
 *                          or rejects if an error occurs during the deletion process.
 * @throws {Error} If there's an error deleting the file, the promise is rejected with the error.
 */
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

/**
 * Calculates the total size of all files stored in the database.
 * 
 * This function fetches all stored files, sums up their sizes, and converts
 * the total size from bytes to megabytes (MB). The result is rounded to
 * two decimal places.
 * 
 * @returns {Promise<string>} A promise that resolves to a string representing
 *                            the total size of all files in MB, with two decimal places.
 *                            Returns '0.00' if an error occurs during calculation.
 * @throws {Error} If there's an error fetching the files or calculating the size,
 *                 it logs the error and returns '0.00'.
 */
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

/**
 * Clears all data from the IndexedDB database.
 * 
 * This function opens a database transaction, accesses the object store,
 * and attempts to clear all records from it.
 * 
 * @returns {Promise<void>} A promise that resolves when the database is successfully cleared,
 *                          or rejects if an error occurs during the clearing process.
 * @throws {Error} If there's an error clearing the database, the promise is rejected with the error.
 */
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
