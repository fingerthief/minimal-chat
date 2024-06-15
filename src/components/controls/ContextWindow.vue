<!-- ContextWindow.vue -->
<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { deleteCurrentConversation } from '@/libs/conversation-management/useConversations';
import { messages, selectedConversation, contextMenuOpened } from '@/libs/state-management/state';
import { showToast } from '@/libs/utils/general-utils';
import Menu from 'primevue/menu';

const menu = ref(null);

function showContextMenu(event) {
    menu.value.toggle(event);
}

function hideContextMenu() {
    contextMenuOpened.value = false;
}

function startNewConversation() {
    selectedConversation.value = null;
    messages.value = [];

    showToast('Conversation Saved');
    hideContextMenu();
}

function deleteCurrentConversationHandler() {
    deleteCurrentConversation();
    hideContextMenu();
}

const items = [
    {
        label: 'New Conversation',
        icon: 'pi pi-plus',
        command: startNewConversation
    },
    {
        label: 'Delete Conversation',
        icon: 'pi pi-trash',
        command: deleteCurrentConversationHandler
    }
];

defineExpose({ showContextMenu, hideContextMenu });

onMounted(() => {

});

onBeforeUnmount(() => {

});
</script>

<template>
    <div class="pi pi-ellipsis-v" @click="showContextMenu" aria-haspopup="true" aria-controls="overlay_menu"></div>
    <Menu ref="menu" id="overlay_menu" class="custom-context-menu" :model="items" :popup="true"></Menu>
</template>

<style lang="scss">
.custom-context-menu {
    .p-menu {
        background: #151515f4;
        background-color: #000000f4;
        color: rgb(228, 228, 228);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .p-menuitem {
        padding: 10px 14px;
        transition: background 0.15s, transform 0.15s;

        &:hover {
            background-color: #063838;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
    }

    .p-menuitem-text {
        padding-left: 6px;
    }

    .p-menuitem-link {
        color: rgb(228, 228, 228);
    }
}
</style>