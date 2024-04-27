<!-- eslint-disable no-undef -->
<!-- eslint-disable no-empty -->
<script setup>
import { wrapCodeSnippets, showToast } from '@/libs/utils';

// Props
const props = defineProps({
    content: String,
    hasFilterText: Boolean,
    messages: Array,
    isLoading: Boolean,
    isAnalyzingImage: Boolean,
    isGeneratingImage: Boolean,
    isClaudeEnabled: Boolean,
    isUsingLocalModel: Boolean,
    streamedMessageText: String
});

const defaults = {
    html: true,
    xhtmlOut: false,
    breaks: false,
    langPrefix: 'language-js',
    linkify: true,
    typographer: true,
    _highlight: true,
    _strict: false,
    _view: 'src'
};

defaults.highlight = function (str, lang) {
    const md = window.markdownit(defaults);
    var esc = md.utils.escapeHtml;
    if (lang && hljs.getLanguage(lang)) {
        try {
            return '<pre class="hljs"><code>' +
                hljs.highlight(lang, str, true).value +
                '</code></pre>';
        } catch (__) { }
    } else {
        return '<pre class="hljs"><code>' + esc(str) + '</code></pre>';
    }
};


// Computed properties
function messageClass(role) {
    return role === 'user' ? 'user message' : 'gpt message';
};

// Methods
function formatMessage(content) {
    let md = window.markdownit(defaults);
    let renderedMessage = wrapCodeSnippets(md.render(content));

    // Check if the message content contains more than one line
    if (content.split('\n').length > 1) {
        // Replace single newlines with line breaks
        renderedMessage = renderedMessage.replace(/\n/g, '<br>');
    }

    return renderedMessage;
}


function copyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text.content;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        console.log('Content copied to clipboard');
    } catch (error) {
        console.error('Failed to copy content: ', error);
    }

    document.body.removeChild(textarea);

    showToast("Copied message text");
}

</script>

<template>
    <div>
        <div v-for="(message, index) in props.messages" :key="index">
            <div :class="messageClass(message.role, index)">
                <div v-if="message.role === 'user'" @click="copyText(message)" class="label">
                    User
                </div>
                <div v-if="message.role !== 'user'" @click="copyText(message)" class="label">
                    <span>
                        AI Model
                    </span>
                </div>
                <span class="message-contents" v-html="formatMessage(message.content)"></span>
            </div>
        </div>
    </div>
    <div v-if="props.isLoading">
        <div class="gpt message">
            <div class="label padded">
                AI Model
            </div>
            <span v-html="formatMessage(props.streamedMessageText || '')"></span>
            <span v-if="!props.streamedMessageText.trim().length">Waiting For Stream Response...</span>
            <span v-if="!props.streamedMessageText.trim().length" class="loading spinner"></span>
        </div>
    </div>
    <div v-if="props.isAnalyzingImage || props.isGeneratingImage">
        <div class="gpt message">
            <div class="label padded">
                AI Model
            </div>
            <span v-if="props.isAnalyzingImage">Generating Vision Response...</span>
            <span v-if="props.isGeneratingImage">Generating Image...</span>
            <span class="loading spinner"></span>
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

.message-contents {
    display: block;
}

.message {
    &.user {
        float: right;
        background-color: #29293a;
        color: #dadbde;
        margin-top: 40px;
        border-radius: 15px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);

        .label {
            background-color: #301c3e;
            border-right: 6px solid #614a63;
            border-left: 6px solid #614a63;
            right: 2px;
            padding-left: 13px;
            color: #ece9ef;
        }
    }

    &.gpt {
        float: left;
        background-color: #282a2e;
        color: #dadbde;
        border-radius: 15px;
        margin-top: 40px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);

        .label {
            background-color: #0f3b39;
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