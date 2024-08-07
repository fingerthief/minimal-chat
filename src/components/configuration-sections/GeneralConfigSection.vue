<template>
    <div>
        <div class="system-prompt-container">
            <InputField labelText="System Prompt:" inputId="system-prompt" :value="systemPrompt"
                @update:value="handleUpdate('systemPrompt', $event)" :isSecret="false" :isMultiline="true"
                :placeholderText="'Enter the system prompt if applicable.'" />
        </div>
        <div class="saved-system-prompts-section">
            <h4 @click="isSavedPromptsOpen = !isSavedPromptsOpen">
                Saved System Prompts
                <ChevronDown v-if="isSavedPromptsOpen" class="indicator" size="20" />
                <ChevronRight v-else class="indicator" size="20" />
            </h4>
            <transition name="slide-fade">
                <div v-show="isSavedPromptsOpen && systemPrompts.length" class="saved-system-prompts">
                    <ul>
                        <li v-for="(prompt, index) in systemPrompts" :key="index"
                            :class="{ selected: index === selectedSystemPromptIndex }"
                            @click="handleSelectSystemPrompt(index)">
                            <Trash2 :size="18" :stroke-width="1.5" @click.stop="handleDeleteSystemPrompt(index)" />
                            &nbsp;&nbsp;{{ prompt }}
                        </li>
                    </ul>
                </div>
            </transition>
        </div>
        <br>
        <br>
        <div class="control-checkbox">
            <SliderCheckbox inputId="higher-contrast-messages" labelText="Higher Contrast Messages"
                v-model="higherContrastMessages" @update:modelValue="handleUpdate('higherContrastMessages', $event)" />
        </div>
        <br>
        <br>
        <div class="config-section" :class="{ show: isAvatarSectionOpen }">
            <h3 @click="isAvatarSectionOpen = !isAvatarSectionOpen">
                Avatar Configuration
                <ChevronDown v-if="isAvatarSectionOpen" class="indicator" size="20" />
                <ChevronRight v-else class="indicator" size="20" />
            </h3>
            <transition name="slide-fade">
                <div v-show="isAvatarSectionOpen" class="control-grid">
                    <div class="control-checkbox">
                        <SliderCheckbox inputId="enable-ai-avatar" labelText="Enable Message Avatars"
                            v-model="isAvatarEnabled" />
                    </div>
                    <div class="avatar-url-container">
                        <div class="avatar-settings">
                            <h4>Avatar Settings:</h4>
                            <SelectButton v-model="avatarType" :options="avatarOptions" optionLabel="name"
                                @change="handleAvatarTypeChange" />
                            <br>
                            <SelectButton v-model="avatarShape" :options="avatarShapes" optionLabel="name"
                                optionValue="value" @change="handleAvatarShapeChange" />

                            <br>
                            <InputField :labelText="`${avatarType.name} Image URL:`" inputId="avatar-url"
                                :value="avatarType.value === 'ai' ? avatarUrl : userAvatarUrl"
                                @update:value="handleAvatarUrlUpdate" :isSecret="false" :isMultiline="false"
                                :placeholderText="`Enter the URL for the ${avatarType.name} avatar image`" />
                            <br>
                            <h4>Select an image from stored files or upload a new one:</h4>
                            <Listbox v-model="selectedFile" :options="storedFiles" optionLabel="fileName"
                                @change="updateAvatarUrl" class="w-full md:w-14rem select-listbox" :filter="true">
                                <template #header>
                                    <Button :label="`Upload ${avatarType.name} Avatar`" icon="pi pi-upload"
                                        class="custom-upload-button" @click="triggerFileInput" />
                                </template>
                                <template #option="slotProps">
                                    <div class="flex align-items-center">
                                        <Avatar :image="slotProps.option.fileData" :alt="slotProps.option.fileName"
                                            shape="circle" size="large" />
                                        <div class="ml-2">{{ slotProps.option.fileName }}</div>
                                    </div>
                                </template>
                            </Listbox>
                            <input type="file" ref="fileInput" style="display: none" @change="uploadFile"
                                accept="image/*" />
                        </div>
                    </div>
                </div>
            </transition>
        </div>
        <br>
    </div>
</template>


<script setup>
import InputField from '@/components/controls/InputField.vue';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-vue-next';
import { avatarShape, userAvatarUrl, isAvatarEnabled, avatarUrl, systemPrompt, selectedAutoSaveOption, higherContrastMessages } from '@/libs/state-management/state';
import { handleUpdate, handleDeleteSystemPrompt, handleSelectSystemPrompt, selectedSystemPromptIndex, systemPrompts } from '@/libs/utils/settings-utils';
import SliderCheckbox from '../controls/SliderCheckbox.vue';
import { ref, onBeforeMount } from 'vue';
import { storeFileData } from '@/libs/file-processing/image-analysis';
import { showToast } from '@/libs/utils/general-utils';
import { fetchStoredImageFiles } from '@/libs/utils/indexed-db-utils';

const storedFiles = ref([]);
const selectedFile = ref(null);
const fileInput = ref(null);

const isAvatarSectionOpen = ref(true);
const isSavedPromptsOpen = ref(true);

const avatarType = ref({ name: 'AI', value: 'ai' });
const avatarOptions = [
    { name: 'AI', value: 'ai' },
    { name: 'User', value: 'user' }
];

const avatarShapes = [
    { name: 'Circle', value: 'circle' },
    { name: 'Square', value: 'square' }
];

const handleFetchStoredFiles = async () => {
    storedFiles.value = await fetchStoredImageFiles();
};

const uploadFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const contents = e.target.result;
        await storeFileData(file.name, contents, file.size, file.type);
        showToast('Image uploaded and stored successfully');
        await handleFetchStoredFiles();
    };
    reader.readAsDataURL(file);
};

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleAvatarShapeChange = () => {
    localStorage.setItem("avatarShape", JSON.stringify({ name: avatarShape.value === 'circle' ? 'Circle' : 'Square', value: avatarShape.value }));
};

const handleAvatarTypeChange = () => {
    selectedFile.value = null;
};

const handleAvatarUrlUpdate = (newValue) => {
    handleUpdate(avatarType.value.value === 'ai' ? 'avatarUrl' : 'userAvatarUrl', newValue);
};

const updateAvatarUrl = () => {
    if (selectedFile.value) {
        handleUpdate(avatarType.value.value === 'ai' ? 'avatarUrl' : 'userAvatarUrl', selectedFile.value.fileData);
    }
};

onBeforeMount(handleFetchStoredFiles);
</script>

<style lang="scss">
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.15s linear;
    max-height: 90vh;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-20px);
}

.p-header {
    padding: 6px;
}

.avatar-settings {
    margin-bottom: 1rem;

    h4 {
        margin-bottom: 0.5rem;
    }

    .p-selectbutton {
        margin-bottom: 0.5rem;

        .p-button {
            background-color: #333;
            border: 1px solid #157474;
            color: #fff;

            &.p-highlight {
                background-color: #157474;
                border-color: #157474;
            }

            &:not(.p-highlight):hover {
                background-color: #444;
            }
        }
    }
}

.p-selectbutton {
    margin-bottom: 1rem;

    .p-button {
        background-color: #333;
        border: 1px solid #157474;
        color: #fff;

        &.p-highlight {
            background-color: #157474;
            border-color: #157474;
        }

        &:not(.p-highlight):hover {
            background-color: #444;
        }
    }
}

.custom-upload-button {
    border: 1px solid #157474;
    color: #157474;
    background-color: transparent;
    transition: all 0.15s ease;
    min-width: 100%;

    &:hover {
        background-color: rgba(21, 116, 116, 0.1);
        border-color: #1a8f8f;
    }

    .p-button {
        display: flex;
        color: #157474;
        min-width: 99vw;
    }
}

.config-section {
    margin-bottom: 15px;

    h3 {
        margin-bottom: 15px;
        background-color: transparent;
        border-bottom: 4px solid #1a4c47e6;
        text-align: left;
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 8px;
    }

    .control-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 20px;
    }
}

.flex {
    display: flex;
}

.align-items-center {
    align-items: center;
}

.ml-2 {
    margin-left: 0.5rem;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.15s linear;
    max-height: 90vh;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-20px);
}


.avatar-url-container {
    margin-top: 10px;
}

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

.p-listbox {

    .p-icon {
        color: #157474;
        right: 14px;
        top: 11px;
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
            transition: background-color 0.15s;
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
                transition: transform 0.15s;
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