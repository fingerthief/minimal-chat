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
        // Replace double newlines with paragraph tags
        renderedMessage = renderedMessage.replace(/\n\n/g, '<p></p>');

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
.padded {
    padding: 10px;
}

.message {
    position: relative;
    padding: 12px;
    border-radius: 3px;
    max-width: 85%;
    min-width: 8%;
    margin-bottom: 8px;
    clear: both;
    margin-top: 18px;
    font-size: 1em;
    line-height: 1.5;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    /* Enhanced shadow for 3D effect */

    span {
        overflow: hidden !important;
        text-overflow: clip;
    }

    .label {
        position: absolute;
        top: -15px;
        color: #dadbde;
        min-width: 62px;
        font-size: 1.05em;
        font-weight: bold;
        padding: 2px 5px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        /* Subtle shadow for label */
    }

    .message-contents {
        display: block;
    }

    .copy-text {
        position: relative;
        /* Add this */
        display: inline-block;

        button {
            display: block;
            position: absolute;
            bottom: 10px;
            right: 10px;
        }

        &:hover {
            button {
                display: block;
                z-index: 9999;
            }
        }
    }

    &.user {
        float: right;
        background-color: #29293a;
        color: #dadbde;

        border-right: 6px solid #614a63;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        margin-top: 40px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        /* Enhanced shadow for 3D effect */

        .label {
            border-radius: 8px;
            border-right: 6px solid #614a63;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            background-color: #301c3e;
            margin-top: -23px;
            right: -6px;
            min-width: 50px;
            padding: 6px;
            font-size: 1.05em;
            font-weight: bold;
            cursor: pointer;
            max-height: 35px;
            padding-left: 13px;
            color: #ece9ef;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            /* Enhanced shadow for label */
        }
    }

    &.gpt {
        float: left;
        background-color: #282a2e;
        color: #dadbde;

        border-left: 6px solid #6a576c;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        margin-top: 40px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        /* Enhanced shadow for 3D effect */

        p {
            overflow: auto;
            text-overflow: clip;
        }

        .label {
            border-left: 6px solid #6a576c;
            background-color: #0f3b39;
            left: 0px;
            color: #ece9ef;
            border-radius: 8px;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            margin-top: -23px;
            left: -6px;
            font-size: 1.05em;
            font-weight: bold;
            padding: 6px;
            min-width: 54px;
            cursor: pointer;
            transition: opacity 0.2s ease-in-out;
            max-height: 35px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            /* Enhanced shadow for label */
        }
    }
}

.icon {
    color: #9d81a0;
}

$shadow-color: #252629;
$shadow-offset-x: 0px;
$shadow-offset-y: 1px;
$shadow-blur-radius: 2px;
$shadow-spread-radius: 0px;

.message-tag {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-right: 5px;
    margin-left: 5px;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 1em;
    font-weight: 900;
}

.message-container {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;

    @media (max-width: 600px) {
        justify-content: flex-start;
        /* Align to the left side on smaller screens */
    }
}

.message-container.user .message-tag {
    background-color: #0077ff;
    color: #fff;
}

.message-container.gpt .message-tag {
    background-color: #234b4a;
    color: #f0f0f0;
}
</style>