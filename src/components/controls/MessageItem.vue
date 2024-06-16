<!-- MessageItem.vue -->
<script setup>
import { onMounted, ref } from 'vue';
import { RefreshCcw, Trash, Copy, Pencil } from 'lucide-vue-next';
import ToolTip from '@/components/controls/ToolTip.vue';
import { showToast } from '@/libs/utils/general-utils';
import {
    isLoading,
    messages,
    systemPrompt,
    selectedModel,
    sliderValue,
    localModelName,
    localSliderValue,
    localModelEndpoint,
    conversations,
    abortController,
    streamedMessageText,
    selectedConversation,
    modelDisplayName,
    higherContrastMessages,
} from '@/libs/state-management/state';
import {
    setSystemPrompt,
    regenerateMessageResponse,
    editPreviousMessage,
    deleteMessageFromHistory,
} from '@/libs/conversation-management/conversations-management';
import { updateUIWrapper } from '@/libs/utils/general-utils';
import { saveMessagesHandler } from '@/libs/conversation-management/useConversations';
import 'swiped-events';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import c from 'highlight.js/lib/languages/c';
import csharp from 'highlight.js/lib/languages/csharp';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/github-dark.css';
import MarkdownIt from 'markdown-it';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('c', c);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('python', python);

// Props
const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
});

// Refs
const loadingIcon = ref(-1);

// Utility functions
function messageClass(role) {
    higherContrastMessages.value = JSON.parse(localStorage.getItem("higherContrastMessages") || false);
    return role === 'user' ? 'user message' + (higherContrastMessages.value === true ? ' high-constrast-mode' : '') : 'gpt message' + (higherContrastMessages.value === true ? ' high-constrast-mode' : '');
}

function copyText(message) {
    let textToCopy = '';

    if (Array.isArray(message)) {
        textToCopy = message
            .filter(item => item.text)
            .map(item => item.text)
            .join(' ');
    } else {
        textToCopy = message.text || '';
    }

    navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
            showToast('Copied text!');
            console.log('Content copied to clipboard');
        })
        .catch((error) => {
            console.error('Failed to copy content: ', error);
        });
}

function startLoading(id) {
    loadingIcon.value = id;
}

// Message editing
let initialMessage = '';

function editMessage(message) {
    if (message.role !== 'user' || message.isEditing) return;
    message.isEditing = true;
    initialMessage = message;
}

async function saveEditedMessage(message, event) {
    message.isEditing = false;

    let parsedMessageText = '';

    if (Array.isArray(initialMessage.content)) {
        parsedMessageText = initialMessage.content
            .filter(item => item.text)
            .map(item => item.text)
            .join(' ');
    } else {
        parsedMessageText = message.text || '';
    }

    const updatedContent = event.target.innerText.trim();
    if (updatedContent !== parsedMessageText.trim()) {
        isLoading.value = true;
        setSystemPrompt(messages.value, systemPrompt.value);

        const result = await editPreviousMessage(
            conversations.value,
            messages,
            initialMessage,
            updatedContent,
            sliderValue.value,
            selectedModel.value,
            localSliderValue.value,
            localModelName.value,
            localModelEndpoint.value,
            updateUIWrapper,
            abortController,
            streamedMessageText
        );

        messages.value = result.baseMessages;
        selectedConversation.value.messageHistory = messages.value;
        isLoading.value = false;
        saveMessagesHandler();
    }
}

// Message actions
async function regenerateMessage(content) {
    isLoading.value = true;
    setSystemPrompt(messages.value, systemPrompt.value);

    const result = await regenerateMessageResponse(
        conversations.value,
        messages,
        content,
        sliderValue.value,
        selectedModel.value,
        localSliderValue.value,
        localModelName.value,
        localModelEndpoint.value,
        updateUIWrapper,
        abortController,
        streamedMessageText
    );

    isLoading.value = false;
    messages.value = result.baseMessages;
    selectedConversation.value.messageHistory = messages.value;
    saveMessagesHandler();
}

async function deleteMessage(content) {
    messages.value = deleteMessageFromHistory(messages.value, content);
    saveMessagesHandler();
}

const md = new MarkdownIt({
    highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(str, { language: lang }).value;
        }
        return hljs.highlightAuto(str).value;
    },
});

function formatMessage(content) {

    let combinedContent = '';

    if (Array.isArray(content)) {
        combinedContent = content.map(item => {
            if (item.type === 'text' && item.text) {
                return item.text;
            } else if (item.type === 'image_url' && item.image_url && item.image_url.url) {
                return `![](${item.image_url.url})`;
            }
            return '';
        }).join(' ').trim();
    } else {
        combinedContent = content;
    }

    let renderedContent = md.render(combinedContent);

    // Replace newlines with <br> tags
    renderedContent = renderedContent.split('\n').join('<br>');

    // Remove leading and trailing <br> tags
    if (renderedContent.startsWith('<br>')) {
        renderedContent = renderedContent.substring(4);
    }
    if (renderedContent.endsWith('<br>')) {
        renderedContent = renderedContent.slice(0, -4);
    }

    return renderedContent;
}
</script>

<template>
    <div v-ripple="{
        pt: {
            root: { style: 'background: #1574746c;' }
        }
    }" class="p-ripple box" v-if="active" :class="messageClass(item.role)">
        <div class="message-header">
            <RefreshCcw v-if="item.role === 'user'" class="icon" :id="'message-refresh-' + item.id" :size="18"
                :class="{ loading: isLoading && loadingIcon === item.id }"
                @click.stop="regenerateMessage(item.content), startLoading(item.id)" />
            <ToolTip v-if="item.role === 'user'" :targetId="'message-refresh-' + item.id">Regenerate </ToolTip>

            <Pencil v-if="item.role === 'user'" class="icon" :id="'message-edit-' + item.id" :size="18"
                @click.stop="editMessage(item)" />
            <ToolTip v-if="item.role === 'user'" :targetId="'message-refresh-' + item.id">Regenerate </ToolTip>

            <Copy v-if="item.role === 'user'" class="delete-icon" :id="'message-copy-' + item.id" :size="18"
                @click.stop="copyText(item.content)" />
            <ToolTip v-if="item.role === 'user'" :targetId="'message-copy-' + item.id">Copy</ToolTip>

            <Trash v-if="item.role === 'user'" class="delete-icon" :id="'message-trash-' + item.id" :size="18"
                @click.stop="deleteMessage(item.content), startLoading(item.id)" />
            <ToolTip v-if="item.role === 'user'" :targetId="'message-trash-' + item.id">Remove</ToolTip>
            <div class="label" @click="copyText(item.content)" :id="'message-label-' + item.id">
                {{ item.role === 'user' ? '' : modelDisplayName }}
            </div>
            <ToolTip :targetId="'message-label-' + item.id">Copy message</ToolTip>
        </div>
        <div class="message-contents" :id="'message-' + item.id" :contenteditable="item.isEditing"
            @dblclick="editMessage(item)" @blur="saveEditedMessage(item, $event)" v-html="formatMessage(item.content)">
        </div>
        <ToolTip v-if="item.role === 'user'" :targetId="'message-' + item.id">Double click to edit message </ToolTip>
    </div>
</template>

<!-- MessageItem.vue -->
<style lang="scss" scoped>
.message {
    position: relative;
    min-width: 10%;
    width: fit-content;
    padding: 8px 0;
    clear: both;
    font-size: 1em;
    line-height: 1.5;
    max-width: 75vw;
    margin-top: 20px;
    margin-left: 19%;
    margin-right: 19%;

    @media (max-width: 600px) {
        max-width: 85vw;
        margin-left: 0;
        margin-right: 0;
    }

    &.user {
        margin-left: auto;
        background-color: #2d2d2d;
        border-radius: 16px;
        max-width: 50%;
        padding-left: 12px;
        padding-bottom: 4px;
        padding-top: 8px;
        padding-right: 4px;

        @media (max-width: 600px) {
            max-width: 90%;
        }

        &.high-constrast-mode {
            background-color: #2f2d44d9;
            border-radius: 12px;
            transition: background-color 0.3s ease;
            margin-bottom: 20px;
            margin-top: 20px;
            max-width: 90vw;
            top: -20px;
            padding: 0px;

            .message-header {
                justify-content: end;
            }
        }

        .message-header {
            justify-content: end;
            right: 1%;
            position: relative;
        }

        .label:hover {
            background-color: #583e72d9;
        }
    }

    &.gpt {
        margin-right: auto;
        transition: background-color 0.3s ease;
        max-width: 60%;

        @media (max-width: 600px) {
            max-width: 88%;
        }

        &.high-constrast-mode {
            background-color: #123638e3;
            border-radius: 12px;
            transition: background-color 0.3s ease;
            margin-bottom: 20px;
            margin-top: 20px;
            max-width: 90vw;
            display: inline-block;
            padding: 0px;

            .message-header {
                justify-content: start;
                border-bottom: 2px solid #0b6363e5;
            }
        }

        .message-header {
            justify-content: start;
            border-bottom: 2px solid #0b6363e5;
        }

        .label:hover {
            background-color: #0b6363e5;
        }
    }

    .message-header {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #dadbde;
        padding: 3px 6px;

        .label {
            color: #dadbde;
            font-weight: 500;
            font-size: 18px;
            line-height: 1;
            cursor: pointer;

            &:hover {
                border-radius: 3px;
                padding: 6px;
                margin: -6px;
            }
        }
    }

    .message-contents {
        padding: 8px;
        margin: 8px;
        display: block;
        overflow-wrap: break-word;

        &[contenteditable='true'] {
            outline: none;
            outline: 2px solid #157474;
            border-radius: 5px;
            text-align: left;
        }
    }
}

.icon {
    color: #b8b6b67d;
    transition: background-color 0.75s ease, transform 0.75s ease;

    &:hover {
        animation: spin 0.5s linear;
        transform: scale(1.2);
        cursor: pointer;
    }
}

.delete-icon {
    color: #b8b6b67d;
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
        transform: scale(1.2);
        cursor: pointer;
    }
}

.loading {
    animation: spin 1s infinite linear;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
