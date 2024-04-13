<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
    role: String,
    content: String,
    hasFilterText: Boolean,
    messages: Array,
    index: Number
});

// Computed properties
const messageClass = computed(() => {
    return props.role === 'user' ? 'user message' : 'gpt message';
});

const label = computed(() => {
    if (props.role === 'user') {
        return 'User';
    } else if (props.role !== 'user' && props.index > 0 && props.messages[props.index - 1].content.toLowerCase().startsWith('image::')) {
        return 'DALL-E';
    } else {
        return 'GPT';
    }
});

const formattedMessage = computed(() => {
    // Assuming formatMessage is a method that formats the message content
    return formatMessage(props.content, false);
});

// Methods
function formatMessage(content, isImage) {
    if (isImage) {
        return `<img src="${content}" alt="Image content" />`;
    }
    return content.replace(/(?:\r\n|\r|\n)/g, '<br>');
}
</script>

<template>
    <div v-if="!hasFilterText">
        <div :class="messageClass" :data-role="role">
            <div class="label">
                <span v-if="role !== 'user'" class="fa-solid fa-robot fa-lg icon"></span>
                <span v-if="role === 'user'" class="fa-solid fa-circle-user fa-lg icon"></span>
                <span>{{ label }}</span>
            </div>
            <span class="message-contents" v-html="formattedMessage"></span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.message {
    position: relative;
    padding-left: 8px;
    padding-right: 8px;
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
        font-size: 13px;
        min-width: 62px;
        font-weight: bold;
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
            color: #dadbde;
            border-radius: 8px;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            margin-top: -23px;
            left: -6px;
            padding: 6px;
            min-width: 54px;
            cursor: pointer;
            transition: opacity 0.2s ease-in-out;

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
        font-size: 0.7em;
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

</style>