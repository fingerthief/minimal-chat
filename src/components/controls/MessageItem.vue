<!-- MessageItem.vue -->
<script setup>
import { computed, onMounted, ref, toRef } from 'vue';
import { RefreshCcw, Trash, Copy, Pencil, Link } from 'lucide-vue-next';
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
    isAvatarEnabled,
    avatarUrl,
    userAvatarUrl,
    avatarShape,
    browserModelSelection,
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
import { FileCheck2 } from 'lucide-vue-next';

import 'highlight.js/styles/github-dark.css';
import MarkdownIt from 'markdown-it';
import Avatar from 'primevue/avatar';

import c from 'highlight.js/lib/languages/c';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import swift from 'highlight.js/lib/languages/swift';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import typescript from 'highlight.js/lib/languages/typescript';
import kotlin from 'highlight.js/lib/languages/kotlin';
import scala from 'highlight.js/lib/languages/scala';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import powershell from 'highlight.js/lib/languages/powershell';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('scala', scala);
hljs.registerLanguage('html', html);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('powershell', powershell);

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
const imageTextRef = ref('');

// Memoization function to avoid redundant calculations
const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

// Optimized content checking functions
const checkForTextFile = memoize((content) => {
    if (!content || !Array.isArray(content)) return false;
    return content[0]?.text?.indexOf('#contextAdded:') !== -1;
});

const checkForImagePart = memoize((content) => {
    if (!content || !Array.isArray(content)) return false;
    for (let i = 0; i < content.length; i++) {
        if (content[i].type === 'image_url' && content[i].image_url) {
            return true;
        }
    }
    return false;
});

const checkForImageUrl = memoize((content) => {
    if (!content || !Array.isArray(content)) return false;
    for (let i = 0; i < content.length; i++) {
        if (content[i].type === 'image_url' && content[i].image_url && content[i].image_url.url) {
            return true;
        }
    }
    return false;
});

// Computed properties for file detection - now using memoized helper functions
const hasFile = computed(() => {
    // Only true if it's a non-image file (has #contextAdded and doesn't have image_url)
    if (!props.item?.content) return false;
    return checkForTextFile(props.item.content) && !checkForImagePart(props.item.content);
});

const hasImage = computed(() => {
    if (!props.item?.content) return false;
    return checkForImageUrl(props.item.content);
});

const hasImageName = computed(() => {
    if (!props.item?.content || !Array.isArray(props.item.content)) return false;
    const textContent = getTextContent(props.item.content);
    return textContent && textContent.match(/Image:\s*([^\n]+)/);
});

// Helper function to get text content from message
function getTextContent(content) {
    if (!Array.isArray(content)) return '';
    const textPart = content.find(part => part.type === 'text' && part.text);
    return textPart ? textPart.text : '';
}

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
        textToCopy = message || '';
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
const isEditing = ref(false);
const emit = defineEmits(['update:isEditing']);

function editMessage(message) {
    if (message.role !== 'user' || isEditing.value) return;
    isEditing.value = true;
    initialMessage = message;
}

async function saveEditedMessage(message, event) {
    isEditing.value = false;
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
    let imageUrl = null;

    if (Array.isArray(content)) {
        // First extract image URL and name if present
        for (const item of content) {
            if (item.type === 'image_url' && item.image_url && item.image_url.url) {
                imageUrl = item.image_url.url;
                
                // Extract image name if present in text part
                const textItem = content.find(i => i.type === 'text' && i.text);
                if (textItem && textItem.text) {
                    const imgMatch = textItem.text.match(/Image:\s*([^\n]+)/);
                    if (imgMatch && imgMatch[1]) {
                        // Store image file name for later reference
                        imageTextRef.value = imgMatch[1].trim();
                    }
                }
            }
        }
        
        // Then process text content, removing image filename references
        const textParts = content
            .filter(item => item.type === 'text' && item.text)
            .map(item => item.text.replace(/\n\nImage:\s*[^\n]+/g, ''))
            .join(' ').trim();
            
        // Then combine text with image markdown
        if (imageUrl) {
            combinedContent = textParts + `\n\n![image](${imageUrl})`;
        } else {
            combinedContent = textParts;
        }
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

const menu = ref(null);

// Extract file name from the message content
function extractFileName(text) {
    if (!text || typeof text !== 'string') return 'Unknown File';
    
    // Check if the message contains the contextAdded marker (for non-image files)
    if (text.indexOf('#contextAdded:') !== -1) {
        // Extract the filename between the marker and the pipe symbol
        const match = text.match(/#contextAdded:\s*(.*?)\s*\|/);
        return match && match[1] ? match[1].trim() : 'File';
    }
    
    // For image files, look for the Image: pattern
    const imgMatch = text.match(/Image:\s*([^\n]+)/);
    if (imgMatch && imgMatch[1]) {
        return imgMatch[1].trim();
    }
    
    return 'File';
}

const menuItems = computed(() => {
    if (!props.item) return [];

    return [
        {
            label: 'Regenerate',
            icon: 'pi pi-refresh',
            command: () => {
                regenerateMessage(props.item.content);
                startLoading(props.item.id);
            },
            visible: props.item.role === 'user'
        },
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => editMessage(props.item),
            visible: props.item.role === 'user'
        },
        {
            label: 'Copy',
            icon: 'pi pi-copy',
            command: () => copyText(props.item.content),
            visible: true
        },
        {
            label: 'Remove',
            icon: 'pi pi-trash',
            command: () => {
                deleteMessage(props.item.content);
                startLoading(props.item.id);
            },
            visible: props.item.role === 'user'
        }
    ];
});

</script>

<template>
    <transition 
        name="message-fade"
        appear
        v-bind="item.role === 'user' ? { 'enter-from-class': 'message-slide-right' } : { 'enter-from-class': 'message-slide-left' }"
    >
        <div v-ripple="{
            pt: {
                root: { style: 'background: #1574742d;' }
            }
        }" class="p-ripple box message-container" v-if="active" :class="messageClass(item.role)">
            <div class="message-header">
                <div class="message-header-content">
                    <Avatar v-if="isAvatarEnabled === true" 
                        :image="item.role === 'user' ? userAvatarUrl : avatarUrl" 
                        :shape="avatarShape"
                        size="large" 
                        class="avatar-animate" />
                    
                    <div class="label" @click="copyText(item.content)" :id="'message-label-' + item.id">
                        {{ item.role === 'user' ? '' : selectedModel === 'web-llm' ? browserModelSelection.replaceAll('"', '') :
                        localModelName }}
                    </div>
                </div>
                
                <div class="action-buttons-row" v-if="item.role === 'user'">
                    <button class="action-button" @click="editMessage(item)" title="Edit">
                        <Pencil size="16" />
                    </button>
                    <button class="action-button" @click="copyText(item.content)" title="Copy">
                        <Copy size="16" />
                    </button>
                    <button class="action-button" @click="regenerateMessage(item.content)" title="Regenerate">
                        <RefreshCcw size="16" />
                    </button>
                    <button class="action-button" @click="deleteMessage(item.content)" title="Delete">
                        <Trash size="16" />
                    </button>
                </div>
                <ContextMenu v-if="item" ref="menu" :model="menuItems" :id="'message-menu-' + item.id" />
                <ToolTip :targetId="'message-label-' + item.id">Copy message</ToolTip>
            </div>
            
            <!-- Regular text messages -->
            <div class="message-contents" :id="'message-' + item.id"
                v-show="!hasFile && !hasImage"
                :contenteditable="isEditing" @dblclick="editMessage(item)" @blur="saveEditedMessage(item, $event)"
                v-html="formatMessage(item.content)">
            </div>
            
            <!-- Non-image file messages -->
            <div class="message-contents file-content" :id="'message-' + item.id"
                v-show="hasFile" :contenteditable="isEditing"
                @dblclick="editMessage(item)" @blur="saveEditedMessage(item, $event)">
                <div class="file-info-display">
                    <Link class="file-icon" size="18" />
                    <span class="file-name">{{ extractFileName(item?.content[0]?.text) }}</span>
                </div>
            </div>
            
            <!-- Image messages -->
            <div class="message-contents" :id="'message-' + item.id"
                v-show="hasImage" :contenteditable="isEditing"
                @dblclick="editMessage(item)" @blur="saveEditedMessage(item, $event)">
                <div class="file-info-display image-info" v-if="hasImageName">
                    <FileCheck2 class="file-icon" size="18" />
                    <span class="file-name">{{ extractFileName(getTextContent(item?.content)) }}</span>
                </div>
                <div class="image-container" v-html="formatMessage(item.content)"></div>
            </div>
        </div>
    </transition>
</template>
<!-- MessageItem.vue -->
<style lang="scss">
.message-container {
    margin-top: 16px;
    margin-bottom: 16px;
}

/* Message entrance animations */
.message-fade-enter-active {
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.message-fade-leave-active {
    transition: all 0.2s ease-in;
}

.message-fade-enter-from {
    opacity: 0;
    transform: translateY(16px);
}

.message-slide-right {
    opacity: 0;
    transform: translateX(32px);
}

.message-slide-left {
    opacity: 0;
    transform: translateX(-32px);
}

.message-fade-leave-to {
    opacity: 0;
    transform: translateY(8px);
}

.avatar-animate {
    animation: avatarAppear 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes avatarAppear {
    0% {
        opacity: 0;
        transform: scale(0.7);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.scale-enter-from,
.scale-leave-to {
    transition: all 0.15s ease-out;
    transform: scale(0);
}

.scale-enter-to,
.scale-leave-from {
    transform: scale(1);
}

.p-menuitem {
    padding: 4px;

    span {
        gap: 3px;
    }

    .p-menuitem-text {
        margin-left: 6px;
    }
}

.message {
    position: relative;
    min-width: 10%;
    width: fit-content;
    clear: both;
    font-size: 1em;
    line-height: 1.5;
    max-width: 75vw;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    @media (max-width: 600px) {
        max-width: 85vw;
        margin: 16px 0;
    }

    &.user {
        margin-left: auto;
        margin-right: 32px;
        background-color: #2a2a2a;
        background-image: linear-gradient(to bottom right, #2d2d35, #2a2a2a);
        border-radius: 18px 18px 4px 18px;
        max-width: 50%;
        padding: 6px 8px;
        margin-top: 24px;
        border: 1px solid rgba(255, 255, 255, 0.03);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;

        @media (max-width: 600px) {
            max-width: 75%;
            margin-right: 16px;
            margin-top: 20px;
            padding: 4px 6px;
        }

        &:hover {
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
            transform: translateY(-1px);
        }

        &.high-constrast-mode {
            background-color: rgba(47, 45, 68, 0.95);
            background-image: linear-gradient(to bottom right, rgba(57, 53, 82, 0.95), rgba(47, 45, 68, 0.95));
            border-radius: 14px;
            max-width: 50%;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .message-header {
            padding: 6px 8px 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            margin-bottom: 2px;

            .message-header-content {
                display: flex;
                align-items: center;
                
                .p-avatar {
                    margin-right: 8px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                }
            }

            .action-buttons-row {
                display: flex;
                gap: 4px;
                align-items: center;
                margin-left: 12px;
            }
        }

        .label:hover {
            background-color: rgba(88, 62, 114, 0.5);
        }
    }

    &.gpt {
        margin-right: auto;
        margin-left: 32px;
        background-color: #1f1f1f;
        border-radius: 16px 16px 16px 4px;
        max-width: 55%;
        margin-top: 24px;
        padding: 4px;

        @media (max-width: 600px) {
            max-width: 75%;
            margin-left: 16px;
            margin-top: 20px;
        }

        &.high-constrast-mode {
            background-color: rgba(18, 54, 56, 0.9);
            border-radius: 12px;
            max-width: 55%;
        }

        .message-header {
            padding: 6px 8px 2px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(11, 99, 99, 0.3);

            .message-header-content {
                display: flex;
                align-items: center;
                
                .p-avatar {
                    margin-right: 8px;
                }
            }
        }

        .label:hover {
            background-color: rgba(11, 99, 99, 0.3);
        }
    }

    .message-header {
        color: #dadbde;

        .label {
            color: #dadbde;
            font-weight: 500;
            font-size: 0.9rem;
            line-height: 1;
            opacity: 0.8;
            cursor: pointer;
            border-radius: 4px;
            padding: 4px 8px;
            transition: background-color 0.2s ease, opacity 0.2s ease;

            &:hover {
                opacity: 1;
            }
        }
    }

    .message-contents {
        padding: 12px 16px;
        display: block;
        overflow-wrap: break-word;
        font-size: 0.95rem;
        line-height: 1.6;
        letter-spacing: 0.01em;
        
        @media (max-width: 600px) {
            padding: 10px 12px;
        }

        pre {
            margin: 12px 0;
            border-radius: 8px;
            background-color: #252525;
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 12px;
            font-size: 0.9rem;
            overflow-x: auto;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        code:not(pre code) {
            background-color: rgba(255, 255, 255, 0.06);
            border-radius: 4px;
            padding: 2px 4px;
            font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
            font-size: 0.85rem;
        }

        p {
            margin: 0.5em 0;
        }

        &[contenteditable='true'] {
            outline: none;
            outline: 2px solid #157474;
            border-radius: 6px;
            text-align: left;
            box-shadow: 0 0 0 1px rgba(21, 116, 116, 0.2), 
                        0 0 8px rgba(21, 116, 116, 0.1);
            padding: 14px 18px;
        }
    }
}

.action-button {
    background-color: rgba(255, 255, 255, 0.04);
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    padding: 0;
    position: relative;
    flex-shrink: 0;
    
    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.95);
        transform: translateY(-1px);
    }
    
    &:active {
        transform: translateY(0);
        color: #157474;
        background-color: rgba(21, 116, 116, 0.15);
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

.file-content {
    .file-info-display {
        display: flex;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 10px 15px;
        margin: 8px 0;
        
        .file-icon {
            color: #4caf50;
            margin-right: 10px;
        }
        
        .file-name {
            font-weight: 500;
            word-break: break-word;
        }
    }
}

.file-info-display {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 10px 15px;
    margin: 8px 0;
    transition: background-color 0.2s ease;
    
    &:hover {
        background-color: rgba(255, 255, 255, 0.08);
    }
    
    .file-icon {
        color: #4caf50;
        margin-right: 10px;
    }
    
    .file-name {
        font-weight: 500;
        word-break: break-word;
        font-size: 0.9rem;
    }
    
    &.image-info {
        margin-bottom: 12px;
        
        .file-icon {
            color: #2196f3;
        }
    }
}

.image-container {
    img {
        max-width: 100%;
        border-radius: 8px;
        margin: 8px 0;
        display: block;
        transition: transform 0.2s ease;
        
        &:hover {
            transform: scale(1.01);
        }
    }
}
</style>
