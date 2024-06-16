<template>
    <div>
        <div class="system-prompt-container">
            <InputField labelText="System Prompt:" inputId="system-prompt" :value="systemPrompt"
                @update:value="handleUpdate('systemPrompt', $event)" :isSecret="false" :isMultiline="true"
                :placeholderText="'Enter the system prompt if applicable.'" />
        </div>
        <div v-if="systemPrompts.length" class="saved-system-prompts">
            <h4>Saved System Prompts:</h4>
            <ul>
                <li v-for="(prompt, index) in systemPrompts" :key="index"
                    :class="{ selected: index === selectedSystemPromptIndex }" @click="handleSelectSystemPrompt(index)">
                    <Trash2 :size="18" :stroke-width="1.5" @click.stop="handleDeleteSystemPrompt(index)" />
                    &nbsp;&nbsp;{{ prompt }}
                </li>
            </ul>
        </div>
        <br>
        <br>
        <div class="control-checkbox">
            <SliderCheckbox inputId="higher-contrast-messages" labelText="Higher Contrast Messages:"
                v-model="higherContrastMessages" @update:modelValue="handleUpdate('higherContrastMessages', $event)" />
        </div>
        <br>
        <br>
    </div>
</template>

<script setup>
import InputField from '@/components/controls/InputField.vue';
import { Trash2 } from 'lucide-vue-next';
import { systemPrompt, selectedAutoSaveOption, higherContrastMessages } from '@/libs/state-management/state';
import { handleUpdate, handleDeleteSystemPrompt, handleSelectSystemPrompt, selectedSystemPromptIndex, systemPrompts } from '@/libs/utils/settings-utils';
import SliderCheckbox from '../controls/SliderCheckbox.vue';
</script>

<style scoped lang="scss">
.p-dropdown {
    background-color: transparent;
    border-bottom: 2px solid #157474;
    border-top: none;
    border-left: none;
    border-right: none;
    width: auto;
    max-width: 80%;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background-color: #262627;
    }

    &:focus {
        outline: none;
    }
}


.system-prompt-container,
.saved-system-prompts {
    h4 {
        margin-bottom: 10px;
    }

    ul {
        list-style-type: none;
        padding: 0;
        max-height: 15vh;
        overflow-y: auto;
        text-overflow: ellipsis;
        scrollbar-width: none;
        text-wrap: nowrap;

        li {
            display: flex;
            align-items: center;
            padding: 8px;
            background-color: darken(#165951, 8%);
            border-radius: 4px;
            margin-bottom: 8px;
            max-height: 6vh;
            overflow: hidden;
            text-align: left;
            cursor: pointer;

            &.selected {
                background-color: #1a5951;
            }

            .delete-system-prompt-btn {
                background-color: transparent;
                border: none;
                color: #ff5555;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;

                &:hover {
                    color: #ff3333;
                }
            }
        }
    }
}

.control-checkbox {
    display: flex;
    align-items: center;
    width: 100%;

    label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 16px;
        color: #fff;
        position: relative;
        width: 100%;
        user-select: none;

        input[type="checkbox"] {
            opacity: 0;
            width: 0;
            height: 0;

            &:checked+.slider:before {
                transform: translateX(26px);
            }

            &:checked+.slider {
                background-color: #1a5951;
            }
        }

        .slider {
            width: 40px;
            height: 20px;
            background-color: #494747;
            border-radius: 34px;
            transition: background-color 0.3s;
            position: relative;
            margin-left: 10px;

            &:before {
                position: absolute;
                content: "";
                height: 12px;
                width: 12px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                border-radius: 50%;
                transition: transform 0.3s;
            }
        }
    }
}

.select-dropdown select {
    appearance: none;
    background-color: #333;
    color: #fff;
    max-width: 65vw;
    height: 40px;
    width: 100%;
    padding-left: 6px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background-color: #444;
    }

    &:focus {
        outline: none;
    }
}

.select-dropdown option {
    background-color: #222;
    color: #fff;
}
</style>