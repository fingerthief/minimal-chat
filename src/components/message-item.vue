<!-- eslint-disable no-undef -->
<!-- eslint-disable no-empty -->
<script setup>
import hljs from 'highlight.js/lib/common';
import MarkdownIt from 'markdown-it';
import { RefreshCcw, Trash } from 'lucide-vue-next';
import { defineEmits, ref, nextTick, computed, watch } from 'vue';
import "/node_modules/highlight.js/scss/github-dark-dimmed.scss";
import ToolTip from './ToolTip.vue';
import { showToast } from '@/libs/utils';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const props = defineProps({
    messages: Array,
    isLoading: Boolean,
    isAnalyzingImage: Boolean,
    isGeneratingImage: Boolean,
    streamedMessageText: String,
    modelDisplayName: String
});

const emit = defineEmits(['regenerate-response', 'delete-response', 'edit-message']);
const loadingIcon = ref(-1);

const formatMessage = (content) => {
    const md = new MarkdownIt({
        highlight: (str, lang) => {
            try {
                return hljs.highlightAuto(str, lang ? [lang] : undefined).value;
            } catch (__) {
                return '';
            }
        },
    });
    return md.render(content)
        .replace(/<(ul|li)>\s*\n/g, '<$1> ')
        .replace(/\n\s*<\/(ul|li)>/g, ' </$1>')
        .replace(/\n/g, '<br>')
        .replace(/^<br\s*\/?>|<br\s*\/?>\s*$/g, '');
};

const messageClass = (role) => role === 'user' ? 'user message' : 'gpt message';

const copyText = (message) => {
    navigator.clipboard.writeText(message.content).then(() => {
        showToast("Copied text!");
        console.log('Content copied to clipboard');
    }).catch(error => {
        console.error('Failed to copy content: ', error);
    });
};

const startLoading = (index) => loadingIcon.value = index;

let initialMessage = "";
const editMessage = (message) => {
    if (message.role !== 'user' || message.isEditing) return;
    message.isEditing = true;
    initialMessage = message;
    nextTick(() => {
        const messageContent = document.getElementById(`message-${props.messages.indexOf(message)}`);
        if (messageContent) messageContent.focus();
    });
};

const saveEditedMessage = (message, event) => {
    message.isEditing = false;
    const updatedContent = event.target.innerText.trim();
    if (updatedContent !== initialMessage.content.trim()) {
        emit('edit-message', initialMessage, updatedContent);
    }
};

const filteredMessages = computed(() => props.messages.filter(message => message.role !== 'system'));

const messageList = ref(null);
const scroller = ref(null);
const scrollToBottom = async () => {
    if (scroller.value && messageList.value) {
        await nextTick();
        scroller.value.scrollToItem(filteredMessages.value.length - 1);
        messageList.value.scrollTop = messageList.value.scrollHeight;
    }
};

watch(() => [filteredMessages, props.streamedMessageText, props.messages],
    async () => {
        await scrollToBottom();
    }, { deep: true }
);
</script>

<template>
    <div ref="messageList" class="message-list">
        <DynamicScroller :min-item-size="600" ref="scroller" class="scroller" @emitUpdates="true"
            :items="filteredMessages" key-field="id" v-slot="{ item, index, active }">
            <DynamicScrollerItem :item="item" :active="active" :data-index="index">
                <div v-if="active" :class="messageClass(item.role)">
                    <div class="message-header">
                        <RefreshCcw v-if="item.role === 'user'" class="icon" :id="'message-refresh-' + index" :size="18"
                            :class="{ 'loading': isLoading && loadingIcon === index }"
                            @click.stop="$emit('regenerate-response', item.content), startLoading(index)" />
                        <ToolTip v-if="item.role === 'user'" :targetId="'message-refresh-' + index">Regenerate</ToolTip>
                        <Trash v-if="item.role === 'user'" class="icon delete-icon" :id="'message-trash-' + index" :size="18"
                            :class="{ 'loading': isLoading && loadingIcon === index }"
                            @click.stop="$emit('delete-response', item.content), startLoading(index)" />
                        <ToolTip v-if="item.role === 'user'" :targetId="'message-trash-' + index">Remove</ToolTip>
                        <div class="label" @click="copyText(item)" :id="'message-label-' + index">
                            {{ item.role === 'user' ? 'User' : modelDisplayName }}
                        </div>
                        <ToolTip :targetId="'message-label-' + index">Copy message</ToolTip>
                    </div>
                    <div class="message-contents" :id="'message-' + index" :contenteditable="item.isEditing"
                        @dblclick="editMessage(item)" @blur="saveEditedMessage(item, $event)"
                        v-html="formatMessage(item.content)"></div>
                    <ToolTip v-if="item.role === 'user'" :targetId="'message-' + index">Double click to edit message</ToolTip>
                </div>
                <div v-if="(streamedMessageText.length || isLoading || isGeneratingImage || isAnalyzingImage) && index === (filteredMessages.length - 1)"
                    class="gpt message">
                    <div class="message-header">
                        <div class="label padded">{{ modelDisplayName }}</div>
                    </div>
                    <span class="message-contents" v-html="formatMessage(streamedMessageText || '')"></span>
                    <span v-if="!streamedMessageText.trim().length">Awaiting response...</span>
                    <span v-if="!streamedMessageText.trim().length" class="loading spinner"></span>
                </div>
            </DynamicScrollerItem>
        </DynamicScroller>
    </div>
</template>

<style lang="scss" scoped>
.scroller, .message-list {
    height: 88vh;
    overflow-y: auto;
    scrollbar-width: none;
}

.icon, .delete-icon {
    color: #9d81a0;
    transition: background-color 0.3s ease, transform 0.2s ease;
    &:hover {
        transform: scale(1.1);
        cursor: pointer;
    }
}

.icon.loading {
    animation: spin 1s infinite linear;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.message {
    position: relative;
    min-width: 10%;
    width: fit-content;
    padding: 8px 0;
    clear: both;
    font-size: 1em;
    line-height: 1.5;
    max-width: calc(100% - 1rem);

    .message-header {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #dadbde;
        padding: 8px 6px;

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

    &.user {
        margin-left: auto;

        .label:hover {
            background-color: #583e72d9;
        }
    }
    &.gpt {
        margin-right: auto;

        .label:hover {
            background-color: #0b6363e5;
        }
    }

    &.user .message-header {
        justify-content: end;
        border-bottom: 2px solid #583e72d9;
    }
    &.gpt .message-header {
        justify-content: start;
        border-bottom: 2px solid #0b6363e5;
    }

    .message-contents {
        padding: 8px;
        margin: 8px;
        display: block;
        overflow-wrap: break-word;
        &[contenteditable="true"] {
            outline: none;
            outline: 2px solid #423d42;
            border-radius: 5px;
            text-align: left;
        }
    }
}

.loading.spinner {
    display: inline-block;
    margin-left: 5px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #0077ff;
    width: 10px;
    height: 10px;
    animation: spin 1s infinite linear;
}
</style>
