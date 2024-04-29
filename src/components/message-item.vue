<!-- eslint-disable no-undef -->
<!-- eslint-disable no-empty -->
<script setup>
import hljs from 'highlight.js/lib/common';
import MarkdownIt from 'markdown-it';
import { RefreshCcw } from 'lucide-vue-next';
import { defineEmits, ref } from 'vue';
import "/node_modules/highlight.js/scss/github-dark-dimmed.scss";

defineProps({
    messages: Array,
    isLoading: Boolean,
    isAnalyzingImage: Boolean,
    isGeneratingImage: Boolean,
    streamedMessageText: String,
    modelDisplayName: String
});

defineEmits(['regenerate-response']);

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

</script>

<template>
    <div>
        <div v-for="(message, index) in messages" :key="index" :class="messageClass(message.role)">
            <div class="label" @click="copyText(message)">
                <RefreshCcw v-if="message.role === 'user'" class="icon"
                    :class="{ 'loading': isLoading && loadingIcon === index }"
                    @click="$emit('regenerate-response', message.content), startLoading(index)" />
                {{ message.role === 'user' ? 'User' : modelDisplayName }}
            </div>
            <span class="message-contents" v-html="formatMessage(message.content)"></span>
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
    border-radius: 2px;
    max-width: 85%;
    min-width: 8%;
    margin-bottom: 8px;
    clear: both;
    margin-top: 18px;
    font-size: 1em;
    line-height: 1.5;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.label {
    position: absolute;
    top: -33px;
    color: #dadbde;
    min-width: 62px;
    font-size: 1.05em;
    font-weight: bold;
    padding: 2px 5px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.icon {
    position: absolute;
    top: 3px;
    left: -34px;
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
}

.message {

    &.user {
        float: right;
        background-color: #2d253d;
        color: #dadbde;
        margin-top: 40px;
        border-radius: 15px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);

        .label {
            background-color: #2d253d;
            border-right: 6px solid #614a63;
            border-left: 6px solid #614a63;
            right: 2px;
            padding-left: 13px;
            color: #ece9ef;
        }
    }

    &.gpt {
        float: left;
        background-color: #1c302e;
        color: #dadbde;
        border-radius: 15px;
        margin-top: 40px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);

        .label {
            background-color: #1c302e;
            border-left: 6px solid #6a576c;
            border-right: 6px solid #6a576c;
            left: 2px;
            color: #ece9ef;
        }
    }
}

.icon {
    color: #9d81a0;
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