<!-- eslint-disable no-undef -->
<!-- eslint-disable no-empty -->
<script setup>
import hljs from 'highlight.js/lib/common';
import MarkdownIt from 'markdown-it';
import { RefreshCcw, Trash } from 'lucide-vue-next';
import { defineEmits, ref, nextTick } from 'vue';
import "/node_modules/highlight.js/scss/github-dark-dimmed.scss";
import ToolTip from './ToolTip.vue';


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

</script>

<template>
    <div>
        <div v-for="(message, index) in messages" :key="index" :class="messageClass(message.role)">
            <ToolTip :targetId="'message-label-' + index">
                Copy Text</ToolTip>
            <div class="label" @click="copyText(message)" :id="'message-label-' + index">
                <RefreshCcw v-if="message.role === 'user'" class="icon"
                    :class="{ 'loading': isLoading && loadingIcon === index }"
                    @click="$emit('regenerate-response', message.content), startLoading(index)" />
                <Trash v-if="message.role === 'user'" class="delete-icon"
                    :class="{ 'loading': isLoading && loadingIcon === index }"
                    @click="$emit('delete-response', message.content), startLoading(index)" />
                {{ message.role === 'user' ? 'User' : modelDisplayName }}
            </div>

            <div class="message-contents" :id="'message-' + index" :contenteditable="message.isEditing"
                @dblclick="editMessage(message)" @blur="saveEditedMessage(message, $event)"
                v-html="formatMessage(message.content)"></div>
            <ToolTip v-if="message.role === 'user'" :targetId="'message-' + index">
                Double click to
                edit message</ToolTip>
        </div>
        <div v-if="isLoading || isGeneratingImage || isAnalyzingImage" class="gpt message">
            <div class="label padded">{{ modelDisplayName }}</div>
            <span class="message-contents" v-html="formatMessage(streamedMessageText || '')"></span>
            <span v-if="!streamedMessageText.trim().length">
                {{ isAnalyzingImage || isGeneratingImage ? 'Generating...' : 'Waiting For Stream Response...' }}
            </span>
            <span v-if="!streamedMessageText.trim().length" class="loading spinner"></span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.message {
    position: relative;
    padding: 12px;
    min-width: 10%;
    width: 100%;
    margin-bottom: 8px;
    clear: both;
    margin-top: 18px;
    font-size: 1em;
    line-height: 1.5;
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
}

.icon {
    position: absolute;
    left: -7px;
    color: #9d81a0;
    transition: background-color 0.3s ease, transform 0.2s ease;
    background-color: transparent;

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
    left: -40px;
    color: #827b83;
    transition: background-color 0.3s ease, transform 0.2s ease;
    background-color: transparent;

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
    overflow: clip;

    &[contenteditable="true"] {
        outline: none;
        border: 2px solid #423d42;
        padding: 15px;
        border-radius: 5px;
        text-align: center;
    }
}

.message {

    &.user {
        float: right;
        color: #dadbde;
        margin-top: 40px;
        text-align: end;
        width: fit-content;
        padding-bottom: 0px;

        .label {
            right: 0;
            padding-left: 13px;
            color: #ece9ef;
            font-size: 18px;

            @media (max-width: 600px) {
                font-size: 16px;
            }
        }
    }

    &.gpt {
        float: left;
        background-color: #252326;
        color: #dadbde;
        margin-top: 40px;

        .label {
            color: #ece9ef;
            left: 0;
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