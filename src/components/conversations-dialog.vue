<script setup>
import { onMounted, ref } from 'vue';
import { Eraser, Download, Upload } from 'lucide-vue-next';
// import ToolTip from './ToolTip.vue';

const props = defineProps({
    isSidebarOpen: Boolean,
    conversations: Array
});


const sidebarContentContainer = ref(null);
const initialWidth = ref(0);
const initialMouseX = ref(0);

function startResize(event) {
    initialWidth.value = sidebarContentContainer.value.offsetWidth;
    initialMouseX.value = event.clientX;
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
}

function resize(event) {
    const deltaX = event.clientX - initialMouseX.value;
    sidebarContentContainer.value.style.width = `${initialWidth.value + deltaX}px`;
}

function stopResize() {
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
}

function handleDoubleClick() {
    const currentWidth = sidebarContentContainer.value.offsetWidth;
    if (currentWidth === 0) {
        sidebarContentContainer.value.style.width = '420px';
    } else {
        sidebarContentContainer.value.style.width = '0px';
    }
}

onMounted(() => {
    sidebarContentContainer.value = document.querySelector(".reize-container");
    sidebarContentContainer.value.style.width = '420px';
});


const emit = defineEmits(['toggle-sidebar', 'load-conversation', 'new-conversation', 'import-conversations', 'export-conversations', 'purge-conversations']);

function loadSelectedConversation(conversation) {
    emit('load-conversation', conversation);
}


function importConversations() {
    emit('import-conversations');
}

function exportConversations() {
    emit('export-conversations');
}

function purgeConversations() {
    if (!confirm('Delete All Conversations?')) {
        return;
    }

    emit('purge-conversations');
}

function toggleSidebar() {
    emit('toggle-sidebar');
}
</script>

<template>
    <div class="reize-container">

        <div class="settings-header">
            <h2>
                <Eraser @click="purgeConversations" /> Conversations
                <Download @click="exportConversations" />&nbsp;
                <Upload @click="importConversations" />
            </h2>
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
        <div class="bottom-panel">
            <button class="close-btn" @click="toggleSidebar">Close</button>
        </div>
        <div id="resize-handle" class="resize-handle" @mousedown="startResize" @dblclick="handleDoubleClick"></div>
        <!-- <ToolTip targetId="resize-handle">
            Drag to resize. Double click to collapse/open.
        </ToolTip> -->
    </div>


</template>

<style lang="scss" scoped>
$shadow-color: #252629;
$shadow-offset-x: 0px;
$shadow-offset-y: 1px;
$shadow-blur-radius: 2px;
$shadow-spread-radius: 0px;
$icon-color: rgb(187, 187, 187);


.resize-handle {
    position: absolute;
    top: 0;
    right: 0px;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    background-color: #1e1e1f;
    z-index: 1000;
}

.settings-header {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    position: relative;
    border-bottom: 1px solid #3d3d3d;
    padding-bottom: 11px;
    padding-top: 10px;
    background-color: #151517;
    text-align: left;
    white-space: nowrap;

    @media (max-width: 600px) {
        border-bottom: 5px solid #3d3d3d;
        padding-bottom: 25px;
        padding-top: 25px;
        background-color: #212121;
        text-align: center;
    }

}


.import-export-container {
    z-index: 10000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.import-export-btn {
    /* Remove this line: align-self: flex-end; */
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    margin-right: 10px;
    color: white;
    cursor: pointer;
    width: 100%;
    font-size: 18px;
    height: 56px;
    outline: none;
    margin-bottom: 10px;
    transition: background-color 0.2s ease;
    background-color: #29293a;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
        background-color: #252534;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
}

.bottom-panel {
    display: flex;
    align-items: flex-end;
    width: fit-content;
    width: 77%;


    @media (max-width: 600px) {
        width: 100%;
    }
}

.scrollable-list {
    @media (max-width: 600px) {
        height: calc(87vh - 100px);
    }

    width: 100%;
    height: calc(97vh - 97px);
    min-height: 0vh;
    overflow: auto;

    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    li {
        padding: 10px;
        border-bottom: 1px solid #3f4151;

        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;

        &:hover {
            background-color: #3d3346;
        }
    }
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