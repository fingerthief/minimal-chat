<script setup>
const props = defineProps({
    isSidebarOpen: Boolean,
    conversations: Array
});

const emit = defineEmits(['toggle-sidebar', 'load-conversation', 'new-conversation', 'import-conversations', 'export-conversations', 'purge-conversations']);

function loadSelectedConversation(conversation) {
    emit('load-conversation', conversation);
}

function newConversation() {
    emit('new-conversation');
}

function importConversations() {
    emit('import-conversations');
}

function exportConversations() {
    emit('export-conversations');
}

function purgeConversations() {
    emit('purge-conversations');
}

function toggleSidebar() {
    emit('toggle-sidebar');
}
</script>

<template>
    <div class="settings-header">
        <h2>Conversations</h2>
    </div>
    <div class="sidebar-content-container">
        <div class="scrollable-list">
            <ul>
                <li v-for="(conversation, index) in props.conversations" :key="index"
                    @click="loadSelectedConversation(conversation)">
                    <span>{{ conversation.conversation.title }}</span>
                </li>
            </ul>
        </div>
    </div>
    <div class="bottom-panel import-export-container">
        <button class="import-export-btn" @click="newConversation">New</button>
        <button class="import-export-btn" @click="importConversations">Import</button>
        <button class="import-export-btn" @click="exportConversations">Export</button>
        <button class="import-export-btn" @click="purgeConversations">Purge</button>
    </div>
    <div class="bottom-panel">
        <button class="close-btn" @click="toggleSidebar">Close</button>
    </div>
</template>

<style lang="scss" scoped>
$shadow-color: #252629;
$shadow-offset-x: 0px;
$shadow-offset-y: 1px;
$shadow-blur-radius: 2px;
$shadow-spread-radius: 0px;
$icon-color: rgb(187, 187, 187);


.import-export-container {
    z-index: 10000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

    .import-export-btn {
        /* Remove this line: align-self: flex-end; */
        padding: 5px 10px;
        border: 1px solid #444;
        border-radius: 0px;
        margin-right: 6px;
        color: white;
        cursor: pointer;
        width: 100%;
        font-size: 18px;
        height: 50px;
        outline: none;
        margin-bottom: 6px;
        transition: background-color 0.2s ease;
        background-color: #29293a;

        &:hover {
            background-color: #252534;
        }
    }
}

.bottom-panel {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    /* Add this line to align items at the bottom */
}

.scrollable-list {
    @media (max-width: 600px) {
        height: calc(87vh - 100px);
    }

    height: calc(94vh - 100px);
    min-height: 0vh;
    overflow: auto;
    background-color: rgb(37, 37, 52);

    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    li {
        padding: 10px;
        border-bottom: 1px solid #ddd;

        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;

        &:hover {
            background-color: #3d3346;
        }
    }
}

.settings-header {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    position: relative;
    border-bottom: 5px solid gray;
    padding-bottom: 25px;
    padding-top: 25px;
    background-color: #252534;
}

.close-btn {
    @media (max-width: 600px) {
        display: block;
    }

    display: none;
    align-self: flex-end; // Align the button to the right
    padding: 5px 10px;
    border: 1px solid #444;
    background-color: #3d3c3e;
    color: white;
    cursor: pointer;
    width: 99%;
    font-size: 18px;
    margin-right: 6px;
    height: 50px;
    outline: none;
    margin-bottom: 10px; // Add some margin at the bottom
    transition: background-color 0.2s ease;
    background-color: #29293a;

    &:hover {
        background-color: #252534;
    }
}

.box {
    box-shadow: $shadow-offset-x $shadow-offset-y $shadow-blur-radius $shadow-spread-radius $shadow-color;
}
</style>