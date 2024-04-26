<!-- eslint-disable no-unused-vars -->

<script setup>
import { ref, computed } from 'vue';
import { Settings, Trash2, MessagesSquare, Save, Github } from 'lucide-vue-next';

// Define props
const props = defineProps({
    selectedModel: {
        type: String,
        required: true
    },
    isSidebarOpen: Boolean,
    showConversationOptions: Boolean,
    storedConversations: Array
});

const emit = defineEmits(['toggle-sidebar', 'toggle-conversations', 'delete-conversation', 'new-conversation']);

const faConversationsCountClass = computed(() => {
    const length = props.storedConversations.length;
    return `fa-${length > 0 ? length : '0'}`;
});

function toggleSidebar() {
    emit('toggle-sidebar');
}

function deleteCurrentConversation() {
    emit('delete-conversation');
}

function clearMessages() {
    // Implement message clearing logic
    emit('new-conversation');
}

function onShowConversationsClick() {
    // Implement showing conversations logic
    emit('toggle-conversations');
}
</script>

<template>
    <div class="header box">
        <a v-show="props.selectedModel.includes('claude')"
            href="https://github.com/fingerthief/minimal-gpt#try-minimalgpt" target="_blank" class="no-style-link">
            MinimalClaude
        </a>
        <a v-show="props.selectedModel.includes('gpt')" href="https://github.com/fingerthief/minimal-gpt#try-minimalgpt"
            target="_blank" class="no-style-link">
            MinimalGPT
        </a>
        <a v-show="props.selectedModel.includes('open-ai-format')"
            href="https://github.com/fingerthief/minimal-gpt#try-minimalgpt" target="_blank" class="no-style-link">
            MinimalCustom
        </a>
        <a v-show="props.selectedModel.includes('tgi')" href="https://github.com/fingerthief/minimal-gpt#try-minimalgpt"
            target="_blank" class="no-style-link">
            MinimalHugging
        </a>
        <a href="https://github.com/fingerthief/minimal-gpt#try-minimalgpt" target="_blank" class="no-style-link">
            <Github :size="20" :stroke-width="2.5" class="header-icon" />
        </a>
        <div class="settings-btn" @click="toggleSidebar">
            <Settings :size="30" />
        </div>
        <div class="trash-btn" @click="deleteCurrentConversation">
            <Trash2 :size="30" />
        </div>
        <span class="save-icon" @click="clearMessages">
            <Save :size="30" />
        </span>
        <div class="saved-conversations-dropdown" @click="onShowConversationsClick">
            <MessagesSquare :size="30" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
/* Add your component-specific styles here */
$icon-color: rgb(187, 187, 187);
$shadow-color: #252629;
$shadow-offset-x: 0px;
$shadow-offset-y: 1px;
$shadow-blur-radius: 2px;
$shadow-spread-radius: 0px;


.saved-conversations {
    display: none;
}

.saved-conversations--visible {
    display: flex;

}

.box {
    box-shadow: $shadow-offset-x $shadow-offset-y $shadow-blur-radius $shadow-spread-radius $shadow-color;
}

.header {
    background-color: #212121;
    height: 50px;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    border-bottom: 1px solid #3d3d3d;
    position: relative; // Add this line
    border-radius: 4px;
    align-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

    a {
        top: 15%;
        position: relative;

        @media (max-width: 600px) {
            left: 5%;
        }
    }
}

.header-icon {
    top: 6%;
    position: relative;
}

.conversations-count {
    display: contents;
    position: relative;
    left: 0px;

    .count-icon {
        padding: 2px;
        top: 18%;
        right: 11px;
        color: $icon-color;
        float: right;
        position: relative;
    }
}

.save-icon {
    padding: 2px;
    top: 10%;
    right: 50px;
    color: $icon-color;
    float: right;
    position: relative;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
        transform: scale(1.15);
    }
}


.settings-btn {
    position: absolute;
    left: 10px;
    top: 18%;
    background-color: transparent;
    border: none;
    color: $icon-color;
    cursor: pointer;
    outline: none;

    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
        transform: scale(1.15);
    }
}

.saved-conversations-dropdown {
    position: absolute;
    top: 21%;
    right: 10px;
    cursor: pointer;
    color: $icon-color;
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
        transform: scale(1.15);
    }
}

.saved-conversations-dropdown select {
    padding: 6px 12px;
    font-size: 14px;
    border: 1px solid #5a5a5a;
    border-radius: 4px;
    background-color: #3a3a3a;
    color: #f1f1f1;
    /* Change the text color to a lighter shade */
    cursor: pointer;
}

.saved-conversations-dropdown select:focus {
    outline: none;
    /* Remove the default focus outline */
    box-shadow: 0 0 0 1px #5a5a5a;
}

.trash-btn {
    position: absolute;
    left: 50px;
    top: 18%;
    color: $icon-color;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
        transform: scale(1.15);
    }
}

.clearfix::after {
    content: "";
    clear: both;
    display: table;
}

.clear-button {
    width: 72%;
    margin-bottom: 10px;
    padding: 5px 10px;
}


.no-style-link {
    text-decoration: none;
    color: inherit;
}

.hover-increase-size {
    cursor: pointer;
    transition: transform 0.3s;
}

.hover-increase-size:hover {
    transform: scale(1.1);
}
</style>