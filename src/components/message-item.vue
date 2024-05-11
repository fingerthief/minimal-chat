<!-- eslint-disable no-undef -->
<!-- eslint-disable no-empty -->
<script setup>
import hljs from 'highlight.js/lib/common';
import MarkdownIt from 'markdown-it';
import { RefreshCcw, Trash } from 'lucide-vue-next';
import { defineEmits, ref, nextTick, computed } from 'vue';
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
        highlight: (str) => {
            try {
                return hljs.highlightAuto(str).value;
            } catch (__) {
                return '';
            }
        },
    });

    let renderedMessage = md.render(content);

    // Replace newlines inside <ul> and <li> tags with spaces
    renderedMessage = renderedMessage.replace(/<(ul|li)>\s*\n/g, '<$1> ');
    renderedMessage = renderedMessage.replace(/\n\s*<\/(ul|li)>/g, ' </$1>');

    // Replace newlines with <br>
    renderedMessage = renderedMessage.replace(/\n/g, '<br>');

    // Remove first and last <br>
    renderedMessage = renderedMessage.replace(/^<br\s*\/?>|<br\s*\/?>\s*$/g, '');

    return renderedMessage;
};

const messageClass = (role) => {
    return role === 'user' ? 'user message' : 'gpt message';
};

const copyText = (message) => {
    const textarea = document.createElement('textarea');
    textarea.value = message.content;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        console.log('Content copied to clipboard');
    } catch (error) {
        console.error('Failed to copy content: ', error);
    }
    document.body.removeChild(textarea);

    showToast("Copied text!")
};

const startLoading = (index) => {
    loadingIcon.value = index;
};


let initalMessage = "";

const editMessage = (message) => {
    if (message.role !== 'user') {
        return;
    }

    if (message.isEditing) {
        return;
    }

    message.isEditing = !message.isEditing;

    if (message.isEditing) {
        initalMessage = message;

        nextTick(() => {
            const messageContent = document.getElementById(`message-${props.messages.indexOf(message)}`);
            if (messageContent) {
                messageContent.focus();
            }
        });
    }
};

const saveEditedMessage = (message, event) => {
    message.isEditing = false;
    const updatedContent = event.target.innerText.trim();

    if (updatedContent !== initalMessage.content.trim()) {
        emit('edit-message', initalMessage, updatedContent);
    }
};

const filteredMessages = computed(() => {
    return props.messages.filter(message => message.role !== 'system');
});

</script>

<template>
    <DynamicScroller class="scroller" :items="filteredMessages" :min-item-size="75" key-field="id"
        v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.content]" :data-index="index">
            <div v-if="active" :class="messageClass(item.role)">
                <ToolTip :targetId="'message-label-' + index">
                    Copy Text</ToolTip>
                <div class="label" @click="copyText(item)" :id="'message-label-' + index">
                    <RefreshCcw v-if="item.role === 'user'" class="icon" :size="18"
                        :class="{ 'loading': isLoading && loadingIcon === index }"
                        @click="$emit('regenerate-response', item.content), startLoading(index)" />
                    <Trash v-if="item.role === 'user'" class="delete-icon" :size="18"
                        :class="{ 'loading': isLoading && loadingIcon === index }"
                        @click="$emit('delete-response', item.content), startLoading(index)" />
                    {{ item.role === 'user' ? 'User' : modelDisplayName }}
                </div>

                <div class="message-contents" :id="'message-' + index" :contenteditable="item.isEditing"
                    @dblclick="editMessage(item)" @blur="saveEditedMessage(item, $event)"
                    v-html="formatMessage(item.content)"></div>
                <ToolTip v-if="item.role === 'user'" :targetId="'message-' + index">
                    Double click to
                    edit message</ToolTip>
            </div>
        </DynamicScrollerItem>
    </DynamicScroller>
    <div v-if="isLoading || isGeneratingImage || isAnalyzingImage" class="gpt message">
        <div class="label padded">{{ modelDisplayName }}</div>
        <span class="message-contents" v-html="formatMessage(streamedMessageText || '')"></span>
        <span v-if="!streamedMessageText.trim().length">
            {{ isAnalyzingImage || isGeneratingImage ? 'Generating...' : 'Waiting For Stream Response...' }}
        </span>
        <span v-if="!streamedMessageText.trim().length" class="loading spinner"></span>
    </div>
</template>

<style lang="scss" scoped>
.scroller {
    height: 100%;
    scrollbar-width: none;
}

.message {
    position: relative;
    padding: 12px;
    min-width: 10%;
    width: fit-content;
    margin-bottom: 8px;
    clear: both;
    margin-top: 18px;
    font-size: 1em;
    line-height: 1.5;

    max-width: 98vw;
}

.label {

    @media (max-width: 600px) {
        top: -27px;
        font-size: 16px;
    }

    position: absolute;
    top: -33px;
    color: #dadbde;
    min-width: 62px;
    font-weight: 500;
    font-size: 18px;
    min-width: fit-content;
}

.icon {
    position: absolute;
    left: -10px;
    color: #9d81a0;
    transition: background-color 0.3s ease, transform 0.2s ease;
    background-color: transparent;
    bottom: 5px;

    &.loading {
        animation: spin 1s infinite linear;
        background-color: transparent;
    }

    &:hover {
        transform: scale(1.15) rotate(-45deg);
    }
}


.delete-icon {
    position: absolute;
    left: -32px;
    color: #827b83;
    transition: background-color 0.3s ease, transform 0.2s ease;
    background-color: transparent;
    bottom: 5px;

    &:hover {
        transform: scale(1.15);
    }
}


.edit-icon {
    position: absolute;
    top: 3px;
    left: -95px;
    color: #9d81a0;
    transition: background-color 0.3s ease, transform 0.2s ease;
    background-color: transparent;

    &:hover {
        transform: scale(1.15);
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.message-contents {
    display: block;

    &[contenteditable="true"] {
        outline: none;
        border: 2px solid #423d42;
        padding: 15px;
        border-radius: 5px;
        text-align: center;
    }
}

.message {
    position: relative;
    padding: 12px;
    min-width: 10%;
    width: fit-content;
    margin-bottom: 8px;
    clear: both;
    margin-top: 18px;
    font-size: 1em;
    line-height: 1.5;

    max-width: 98vw;

    // Ensure that the user message is aligned to the right
    &.user {
        margin-left: auto; // Align to the right by using auto margin on the left
        color: #dadbde;
        margin-top: 40px;
        border-top: 2px solid #583e72d9;
        min-width: 10%;
        max-width: 95%; // Optionally set a max-width for better responsiveness
        padding-bottom: 50px;

        .label {
            position: absolute;
            right: 0; // Position label to the right
            padding-left: 13px;
            color: #ece9ef;
            font-size: 18px;

            @media (max-width: 600px) {
                font-size: 16px;
            }

            &:hover {
                background-color: #583e72d9;
                cursor: pointer;
            }
        }
    }

    // Align the GPT (assistant) message to the left
    &.gpt {
        margin-right: auto; // Align to the left by using auto margin on the right
        color: #dadbde;
        margin-top: 40px;
        border-top: 2px solid #0b6363e5;
        width: fit-content;
        min-width: 20%;
        max-width: 95%; // Optionally set a max-width for better responsiveness
        padding-bottom: 50px;

        .label {
            position: absolute;
            left: 0; // Position label to the left
            color: #ece9ef;

            &:hover {
                background-color: #0b6363e5;
                cursor: pointer;
            }
        }
    }

    // Shared styles for the message content
    .message-contents {
        display: block;

        &[contenteditable="true"] {
            outline: none;
            border: 2px solid #423d42;
            padding: 15px;
            border-radius: 5px;
            text-align: left; // Align text to the left for both user and GPT messages
        }
    }
}

.icon {
    color: #827b83;
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

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>