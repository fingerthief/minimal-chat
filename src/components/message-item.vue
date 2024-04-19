<!-- eslint-disable no-undef -->
<!-- eslint-disable no-empty -->
<script setup>
import { wrapCodeSnippets, showToast } from '@/libs/utils';
import { Atom } from 'lucide-vue-next';

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
                <div v-show="message.role === 'user'" @click="copyText(message)" class="label">
                    User
                </div>
                <div v-show="message.role !== 'user'" @click="copyText(message)" class="label">
                    <span>
                        <Atom />
                    </span>
                </div>
                <span class="message-contents" v-html="formatMessage(message.content)"></span>
            </div>
        </div>
    </div>
    <div v-if="props.isLoading">
        <div class="gpt message">
            <div class="label padded">
                <Atom />
            </div>
            <span v-html="formatMessage(props.streamedMessageText || '')"></span>
            <span v-if="!props.streamedMessageText.trim().length">Waiting For Stream Response...</span>
            <span v-if="!props.streamedMessageText.trim().length" class="loading spinner"></span>
        </div>
    </div>
    <div v-if="props.isAnalyzingImage || props.isGeneratingImage">
        <div class="gpt message">
            <div class="label padded">
                <Atom />
            </div>
            <span v-show="props.isAnalyzingImage">Generating Vision Response...</span>
            <span v-show="props.isGeneratingImage">Generating Image...</span>
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
    border-radius: 12px;
    max-width: 85%;
    min-width: 8%;
    margin-bottom: 8px;
    clear: both;
    margin-top: 18px;
    font-size: 1em;
    line-height: 1.5;

    .copy-text {
        position: relative;
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

    pre {
        overflow: hidden;
        text-overflow: clip;
    }

    .label {
        position: absolute;
        top: -15px;
        color: #dadbde;
        min-width: 62px;
        font-size: 0.9em;
        font-weight: bolder;
        padding: 2px 5px;
        border-radius: 5px;
    }

    &.user {
        float: right;
        background-color: #3d3144;
        color: #dadbde;

        border-right: 6px solid #614a63;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        margin-top: 40px;

        .label {
            border-radius: 8px;
            border-right: 6px solid #614a63;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            background-color: #3d3144;
            margin-top: -23px;
            overflow: hidden;
            right: -6px;
            min-width: 50px;
            padding: 6px;
            font-size: 0.9em;
            font-weight: bolder;
            max-height: 35px;
            padding-left: 13px;
            color: #bdbec1;
        }
    }

    &.gpt {
        float: left;
        background-color: #4a424a;
        color: #dadbde;

        border-left: 6px solid #6a576c;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        margin-top: 40px;

        p {
            overflow: auto;
            text-overflow: clip;
        }

        .label {
            border-left: 6px solid #6a576c;
            background-color: #4a424a;
            left: 0px;
            color: #bdbec1;
            border-radius: 8px;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            margin-top: -23px;
            left: -6px;
            font-size: 0.9em;
            font-weight: bolder;
            padding: 6px;
            min-width: 54px;
            cursor: pointer;
            transition: opacity 0.2s ease-in-out;
            max-height: 35px;

            &:hover::before {
                content: 'Click to copy';
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #000;
                color: #fff;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.2s ease-in-out;
            }

            &:hover::after {
                content: "";
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 5px;
                border-style: solid;
                border-color: #000 transparent transparent transparent;
                opacity: 0;
                transition: opacity 0.2s ease-in-out;
            }

            &:hover::before,
            &:hover::after {
                opacity: 1;
            }
        }
    }
}

.user,
.gpt {
    color: #00ccff;

    &.label {
        font-size: 1em;
        font-weight: bolder;
        display: block;
        min-width: 45px;
        margin-bottom: 2px;
        color: rgba(255, 255, 255, 0.7);
        text-align: right;
    }
}

.icon {
    color: #9d81a0;
}

.gpt {
    color: #ff9900;

    &.label {
        text-align: left;
        border-bottom: 2px solid slategray;
        font-size: 0.9em;
        font-weight: bolder;
        min-width: 45px;
    }
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