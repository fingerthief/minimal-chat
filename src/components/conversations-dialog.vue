<script setup>
import { onMounted, ref, computed, nextTick } from 'vue';
import { Eraser, Download, Upload, MessageSquarePlus, MessageSquareX, Settings, Pencil } from 'lucide-vue-next';
import ToolTip from './ToolTip.vue';

const props = defineProps({
    isSidebarOpen: Boolean,
    conversations: Array,
    selectedConversationItem: Object,
    showConversationOptions: Boolean
});

const loadedConversation = ref({});

const selectedConversation = computed(() => {
    return props.conversations.find(conversation =>
        conversation.id === props.selectedConversationItem.id
    );
});

onMounted(() => {
    const lastConversationId = parseInt(localStorage.getItem("lastConversationId")) || 0;
    const lastConversation = props.conversations.find(conversation => conversation.id === lastConversationId);

    // Only set loadedConversation if the conversation exists
    if (lastConversation) {
        loadedConversation.value = lastConversation;
    } else {
        // Fallback if no matching conversation is found
        loadedConversation.value = {
            conversation: {
                title: '',
                messageHistory: [{}]
            },
            id: 0
        };
    }
});

const emit = defineEmits(['toggle-sidebar', 'load-conversation', 'new-conversation', 'import-conversations', 'export-conversations', 'purge-conversations', 'delete-current-conversation', 'open-settings', 'edit-conversation-title']);

let initialConversation = "";

const editConversationTitle = (conversation) => {
    if (conversation.isEditing) {
        return;
    }

    conversation.isEditing = !conversation.isEditing;

    if (conversation.isEditing) {
        initialConversation = conversation;

        nextTick(() => {
            const messageContent = document.getElementById(`conversation-${props.conversations.indexOf(conversation)}`);
            if (messageContent) {
                messageContent.focus();
            }
        });
    }
};

const saveEditedConversationTitle = (conversation, event) => {
    conversation.isEditing = false;
    const updatedContent = event.target.innerText.trim();

    if (updatedContent !== initialConversation.conversation.title.trim()) {
        emit('edit-conversation-title', initialConversation, updatedContent);
    }
};

async function loadSelectedConversation(conversation) {
    loadedConversation.value = conversation;
    emit('load-conversation', conversation);
}

function startNewConversation() {
    emit('new-conversation');
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
</script>

<template>
    <div class="resize-container">
        <div class="settings-header">
            <h2>
                Conversations
                &nbsp;
                <ToolTip :targetId="'purgeConversations'">
                    Purge all conversations</ToolTip>
                <Eraser @click="purgeConversations" id="purgeConversations" :size="25" :stroke-width="1.00" />&nbsp;
                <ToolTip :targetId="'exportConversations'">
                    Export conversations</ToolTip>
                <Download @click="exportConversations" id="exportConversations" :size="25" :stroke-width="1.00" />&nbsp;
                <ToolTip :targetId="'importConversations'">
                    Import conversations</ToolTip>
                <Upload @click="importConversations" id="importConversations" :size="25" :stroke-width="1.00" />
            </h2>
        </div>
        <div class="sidebar-content-container">
            <div class="scrollable-list">
                <ul>
                    <li v-for="(conversation, index) in props.conversations" :key="index" :id="'conversation-' + index"
                        :contenteditable="conversation.isEditing" @click="loadSelectedConversation(conversation)"
                        @dblclick="editConversationTitle(conversation)"
                        @blur="saveEditedConversationTitle(conversation, $event)"
                        :class="{ 'selected': selectedConversation && selectedConversation.id === conversation.id }">
                        <Pencil :id="'pencil-' + index" :size="15" @click="editConversationTitle(conversation)" />
                        <ToolTip :targetId="'pencil-' + index">Edit title</ToolTip>
                        <span>&nbsp;&nbsp;{{ conversation.conversation.title }}</span>
                    </li>
                </ul>
            </div>

        </div>
        <div class="bottom-panel">
            <div class="scrollable-list--bottom">
                <ul>
                    <li class="new-conversation-option" @click="startNewConversation">
                        <span class="new-icon">
                            <MessageSquarePlus :stroke-width="1.5" />
                            <span class="new-text">Start New Conversation</span>
                        </span>
                    </li>
                    <li class="new-conversation-option--delete" @click="$emit('delete-current-conversation')">
                        <span class="delete-icon">
                            <MessageSquareX :stroke-width="1.5" />
                            <span class="delete-text">Delete Current Conversation</span>
                        </span>
                    </li>
                    <li v-if="!props.showConversationOptions" class="new-conversation-option--settings"
                        @click="$emit('open-settings')">
                        <span class="settings-icon">
                            <Settings :stroke-width="1.5" />
                            <span class="settings-text">Settings</span>
                        </span>
                    </li>
                    <li v-if="props.showConversationOptions" class="new-conversation-option--settings"
                        @click="$emit('toggle-sidebar')">
                        <span class="settings-icon">
                            <Settings :stroke-width="1.5" />
                            <span class="settings-text">Close</span>
                        </span>
                    </li>
                </ul>
            </div>
        </div>
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
    width: 6px;
    height: 100%;
    cursor: col-resize;
    background-color: #191b1b;
    z-index: 1000;
    max-width: 100%;
}

.settings-header {
    font-size: 15px;
    font-weight: bold;
    position: relative;
    border-bottom: 1px solid #3d3d3d;
    padding-bottom: 11px;
    padding-top: 10px;
    background-color: #151517;
    text-align: left;
    white-space: nowrap;
    padding-left: 22px;

    @media (max-width: 600px) {
        border-bottom: 5px solid #3d3d3d;
        padding-bottom: 25px;
        padding-top: 25px;
        padding-left: 0px;
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
    flex-direction: column;
    width: 100%;

    .settings-cog {
        text-align: center;
    }


    @media (max-width: 600px) {
        width: 100%;
    }
}

.scrollable-list {
    @media (max-width: 600px) {
        height: 68vh;
    }

    max-width: 100%;
    overflow-x: hidden;
    width: 100%;
    height: 77dvh;
    min-height: 0vh;
    overflow: auto;
    box-sizing: border-box;

    &--bottom-options {
        display: flex;
        align-items: flex-end;
    }

    .new-conversation-option {
        text-align: left;
        background-color: #0d3937;
        color: #FFFFFF;
        font-weight: bold;
        border-radius: 5px;
        padding: 15px;
        display: flex;
        cursor: pointer;
        position: relative;

        &:hover {
            background-color: #104745aa;
        }

        .new-icon {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 5px;

            .new-text {
                line-height: 1;
            }
        }
    }


    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    li {
        padding: 15px;
        border-bottom: 1px solid #100d0d;
        background-color: #1c292ea8;
        transition: background-color 0.2s ease;
        border-left: 6px solid #353434;

        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;

        &[contenteditable="true"] {
            outline: none;
            border: 2px solid #423d42;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
        }

        &:hover {
            background-color: #0d3837aa;
        }

        &.selected {
            background-color: #222a23eb;
            font-weight: bold;
            box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 6px solid #009463d5;
        }
    }
}

.scrollable-list--bottom {
    max-width: 100%;
    overflow-x: hidden;
    width: 100%;
    height: 22dvh;
    max-height: 22dvh;
    min-height: 0vh;
    overflow: auto;
    box-sizing: border-box;

    .new-conversation-option {
        text-align: left;
        background-color: #1047456f;
        color: #FFFFFF;
        font-weight: bold;
        border-radius: 5px;
        display: flex;
        cursor: pointer;
        position: relative;

        &--delete {
            background-color: #6b44385f;

            &:hover {
                background-color: #6b4438;
            }

            .delete-icon {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 5px;

                .delete-text {
                    line-height: 1;
                }

            }

        }

        &--settings {

            background-color: #292530ae;

            &:hover {
                background-color: #332e3c;
            }

            .settings-icon {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 5px;

                .settings-text {
                    line-height: 1;
                }

            }

        }

        &:hover {
            background-color: #104745;
        }

        .new-icon {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 5px;

            .new-text {
                line-height: 1;
            }
        }
    }


    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    li {
        padding: 10px;
        border-bottom: 1px solid #100d0d;
        background-color: #2a2121;
        transition: background-color 0.2s ease;

        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;

        &:hover {
            background-color: #114335;
        }

        &.selected {
            background-color: #3e3347;
            font-weight: bold;
            box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.1);
            animation: pulse 0.250s ease-out forwards;
            border: 1px solid #513f77;
        }

        &.selected:before {
            content: '\2713'; // Unicode for checkmark
            font-family: 'Arial Unicode MS';
            display: inline-block;
            margin-right: 10px;
            color: #4cae4c; // Green color for the checkmark
        }

        @keyframes pulse {
            0% {
                background-color: #352d458c;
                transform: scale(1);
            }

            50% {
                background-color: #413558; // Slightly lighter color for the pulse effect
                transform: scale(1.02);
            }

            100% {
                background-color: #352d458c;
                transform: scale(1);
            }
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