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

    display: flex;

    .import-export-btn {
        align-self: flex-end; // Align the button to the right
        padding: 5px 10px;
        border: 1px solid #444;
        border-radius: 0px;
        margin-right: 6px;
        background-color: #3d3c3e;
        color: white;
        cursor: pointer;
        width: 100%;
        font-size: 18px;
        height: 50px;
        outline: none;
        margin-bottom: 6px; // Add some margin at the bottom
        max-width: 152px;

        &:hover {
            background-color: #4a4a4c;
        }
    }
}

.bottom-panel {
    display: flex;
    justify-content: center;
}

.scrollable-list {
    height: 77vh;
    overflow: auto;

    /* Media query for screens that are 600px wide or less */
    @media (max-width: 600px) {
        height: 75vh;
    }


    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    li {
        padding: 10px;
        border-bottom: 1px solid #ddd;

        -webkit-user-select: none;
        /* Safari */
        -ms-user-select: none;
        /* IE 10 and IE 11 */
        user-select: none;
        /* Standard syntax */

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
}

.close-btn {
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
    transition: background-color 0.2s ease, transform 0.2s ease;

    &:hover {
        background-color: #4a4a4c;
    }
}

.box {
    box-shadow: $shadow-offset-x $shadow-offset-y $shadow-blur-radius $shadow-spread-radius $shadow-color;
}
</style>