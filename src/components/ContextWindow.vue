<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { deleteCurrentConversation, editConversationTitle } from '@/libs/conversation-management/useConversations';
import { messages, selectedConversation } from '@/libs/state-management/state';
import { showToast } from '@/libs/utils/general-utils';
import { Trash, SquarePlus } from 'lucide-vue-next';

const visible = ref(false);
const style = ref({ top: '0px', left: '0px' });

function showContextMenu(event) {
    style.value = {
        top: `${event.clientY}px`,
        left: `${event.clientX - 100}px`
    };
    visible.value = true;
}

function hideContextMenu() {
    visible.value = false;
}

function startNewConversation() {
    // Implement the logic to start a new conversation
    selectedConversation.value = null;
    messages.value = [];

    showToast('Conversation Saved');
    hideContextMenu();
}

function deleteCurrentConversationHandler() {
    // Implement the logic to delete the current conversation
    deleteCurrentConversation();
    hideContextMenu();
}

defineExpose({ showContextMenu, hideContextMenu });
</script>

<template>
    <transition name="context-menu">
        <div v-if="visible" :style="style" class="context-menu">
            <ul>
                <li @click="startNewConversation">
                    <SquarePlus :size="14" />&nbsp;&nbsp;New Conversation
                </li>
                <li @click="deleteCurrentConversationHandler">
                    <Trash :size="14" />&nbsp;&nbsp;Delete Conversation
                </li>
            </ul>
        </div>
    </transition>
</template>

<style scoped>
.context-menu {
    position: absolute;
    background: #151515f4;
    color: rgb(228, 228, 228);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    transform: scale(1);
    transition: transform 0.15s ease;
}

.context-menu-enter-active,
.context-menu-leave-active {
    transition: transform 0.15s ease;
}

.context-menu-enter-from,
.context-menu-leave-to {
    transform: scale(0);
}

.context-menu-enter-to,
.context-menu-leave-from {
    transform: scale(1);
}

.context-menu ul {
    list-style: none;
    padding: 0px;
    margin: 0;
}

.context-menu li {
    padding: 8px 12px;
    /* Slightly larger padding for a more spacious feel */
    cursor: pointer;
    transition: background 0.3s, transform 0.3s;
    /* Smooth transition for background and transform */
    border-bottom: 1px solid #023939e5;

    /* Subtle shadow for depth */
    background-color: #063737;
    /* White background for contrast */
}

.context-menu li:hover {
    background-color: #063838;
    /* Light grey background on hover */
    transform: translateY(-2px);
    /* Slight lift effect on hover */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    /* Enhanced shadow on hover */
}
</style>
