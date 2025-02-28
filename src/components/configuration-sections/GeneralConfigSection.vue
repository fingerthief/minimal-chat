<template>
    <div>
        <div class="system-prompt-card">
            <div class="prompt-header">
                <MessageSquare size="18" class="section-icon" />
                <h3>System Prompt</h3>
            </div>
            <div class="prompt-content">
                <p class="prompt-description">
                    Guide the AI's behavior and knowledge with a system prompt. This acts as context or instructions for the AI to follow during the conversation.
                </p>
                <InputField labelText="" inputId="system-prompt" :value="systemPrompt"
                    @update:value="handleUpdate('systemPrompt', $event)" :isSecret="false" :isMultiline="true"
                    :placeholderText="'You are a helpful AI assistant. You are friendly, kind, and accurate. You provide concise answers unless asked for more detail.'" />
                <div class="prompt-actions">
                    <button 
                        v-if="systemPrompt && systemPrompt.trim().length > 0" 
                        class="save-prompt-button" 
                        @click="handleSaveSystemPrompt(systemPrompt)"
                        title="Save current prompt to your collection">
                        <Save size="16" />
                        <span>Save Prompt</span>
                    </button>
                    <button 
                        v-if="systemPrompt && systemPrompt.trim().length > 0" 
                        class="clear-prompt-button" 
                        @click="handleUpdate('systemPrompt', '')"
                        title="Clear the current prompt">
                        <X size="16" />
                        <span>Clear</span>
                    </button>
                </div>
            </div>
        </div>
        <div class="saved-system-prompts-section">
            <div class="section-header" @click="isSavedPromptsOpen = !isSavedPromptsOpen">
                <h4>
                    <Save size="16" class="section-icon" />
                    Saved System Prompts
                </h4>
                <ChevronDown v-if="isSavedPromptsOpen" class="indicator" size="20" />
                <ChevronRight v-else class="indicator" size="20" />
            </div>
            <transition name="slide-fade">
                <div v-show="isSavedPromptsOpen" class="saved-system-prompts">
                    <div v-if="systemPrompts.length" class="prompts-container">
                        <ul>
                            <li v-for="(prompt, index) in systemPrompts" :key="index"
                                :class="{ selected: index === selectedSystemPromptIndex }"
                                @click="handleSelectSystemPrompt(index)">
                                <div class="prompt-item-content">
                                    <div class="prompt-text">{{ prompt }}</div>
                                    <button class="delete-prompt-btn" @click.stop="handleDeleteSystemPrompt(index)">
                                        <Trash2 size="18" />
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div v-else class="no-prompts">
                        <MessageSquare size="24" />
                        <p>No saved prompts yet. Enter a system prompt and it will appear here.</p>
                    </div>
                </div>
            </transition>
        </div>
        <div class="config-section" :class="{ show: isAccessibilityOpen }">
            <div class="section-header" @click="isAccessibilityOpen = !isAccessibilityOpen">
                <h3>
                    <Eye size="20" class="section-icon" />
                    Accessibility
                </h3>
                <ChevronDown v-if="isAccessibilityOpen" class="indicator" size="20" />
                <ChevronRight v-else class="indicator" size="20" />
            </div>
            <transition name="slide-fade">
                <div v-show="isAccessibilityOpen" class="accessibility-content">
                    <div class="control-checkbox">
                        <SliderCheckbox inputId="higher-contrast-messages" labelText="Higher Contrast Messages"
                            v-model="higherContrastMessages" @update:modelValue="handleUpdate('higherContrastMessages', $event)" />
                    </div>
                </div>
            </transition>
        </div>
        <div class="config-section" :class="{ show: isAvatarSectionOpen }">
            <div class="section-header" @click="isAvatarSectionOpen = !isAvatarSectionOpen">
                <h3>
                    <User size="20" class="section-icon" />
                    Avatar Configuration
                </h3>
                <ChevronDown v-if="isAvatarSectionOpen" class="indicator" size="20" />
                <ChevronRight v-else class="indicator" size="20" />
            </div>
            <transition name="slide-fade">
                <div v-show="isAvatarSectionOpen" class="avatar-content">
                    <div class="enable-avatars">
                        <SliderCheckbox inputId="enable-ai-avatar" labelText="Enable Message Avatars"
                            v-model="isAvatarEnabled" />
                    </div>
                    
                    <div class="avatar-settings">
                        <div class="settings-selector">
                            <h4>Avatar Type</h4>
                            <SelectButton v-model="avatarType" :options="avatarOptions" optionLabel="name"
                                @change="handleAvatarTypeChange" class="avatar-selector" />
                        </div>
                        
                        <div class="settings-selector">
                            <h4>Avatar Shape</h4>
                            <SelectButton v-model="avatarShape" :options="avatarShapes" optionLabel="name"
                                optionValue="value" @change="handleAvatarShapeChange" class="avatar-selector" />
                        </div>

                        <div class="avatar-url-field">
                            <InputField :labelText="`${avatarType.name} Image URL:`" inputId="avatar-url"
                                :value="avatarType.value === 'ai' ? avatarUrl : userAvatarUrl"
                                @update:value="handleAvatarUrlUpdate" :isSecret="false" :isMultiline="false"
                                :placeholderText="`Enter the URL for the ${avatarType.name} avatar image`" />
                        </div>
                        
                        <div class="avatar-upload-section">
                            <h4>Select an image or upload a new one</h4>
                            <Button :label="`Upload ${avatarType.name} Avatar`" icon="pi pi-upload"
                                class="custom-upload-button" @click="triggerFileInput" />
                                
                            <div class="avatar-list-container">
                                <Listbox v-model="selectedFile" :options="storedFiles" optionLabel="fileName"
                                    @change="updateAvatarUrl" class="avatar-listbox" :filter="true">
                                    <template #option="slotProps">
                                        <div class="avatar-option">
                                            <Avatar :image="slotProps.option.fileData" :alt="slotProps.option.fileName"
                                                shape="circle" size="large" />
                                            <span class="avatar-filename">{{ slotProps.option.fileName }}</span>
                                        </div>
                                    </template>
                                    <template #empty>
                                        <div class="empty-list">
                                            <Image size="24" />
                                            <p>No images uploaded yet</p>
                                        </div>
                                    </template>
                                </Listbox>
                            </div>
                            <input type="file" ref="fileInput" style="display: none" @change="uploadFile"
                                accept="image/*" />
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>


<script setup>
import InputField from '@/components/controls/InputField.vue';
import { ChevronDown, ChevronRight, Trash2, Save, User, MessageSquare, Image, Eye, X } from 'lucide-vue-next';
import { avatarShape, userAvatarUrl, isAvatarEnabled, avatarUrl, systemPrompt, selectedAutoSaveOption, higherContrastMessages } from '@/libs/state-management/state';
import { handleUpdate, handleDeleteSystemPrompt, handleSelectSystemPrompt, selectedSystemPromptIndex, systemPrompts, handleSaveSystemPrompt } from '@/libs/utils/settings-utils';
import SliderCheckbox from '../controls/SliderCheckbox.vue';
import { ref, onBeforeMount } from 'vue';
import { storeFileData } from '@/libs/file-processing/image-analysis';
import { showToast } from '@/libs/utils/general-utils';
import { fetchStoredImageFiles } from '@/libs/utils/indexed-db-utils';

const storedFiles = ref([]);
const selectedFile = ref(null);
const fileInput = ref(null);

const isAvatarSectionOpen = ref(false);
const isSavedPromptsOpen = ref(false);
const isAccessibilityOpen = ref(false);

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

.config-section {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
    background-color: rgba(16, 56, 51, 0.1);
    
    @media (max-width: 600px) {
        margin-bottom: 15px;
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        cursor: pointer;
        background-color: rgba(21, 116, 116, 0.15);
        transition: background-color 0.2s ease;
        
        @media (max-width: 600px) {
            padding: 10px 12px;
        }
        
        &:hover {
            background-color: rgba(21, 116, 116, 0.25);
        }
        
        h3 {
            margin: 0;
            display: flex;
            align-items: center;
            font-size: 17px;
            font-weight: 600;
            
            .section-icon {
                margin-right: 8px;
                color: #157474;
            }
            
            @media (max-width: 600px) {
                font-size: 18px;
            }
        }
        
        .indicator {
            color: #157474;
        }
    }
    
    .avatar-content,
    .accessibility-content {
        padding: 16px;
        
        .enable-avatars {
            margin-bottom: 20px;
            
            @media (max-width: 600px) {
                margin-bottom: 24px;
            }
        }
    }
}

.avatar-settings {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    @media (max-width: 600px) {
        gap: 24px;
    }
    
    .settings-selector {
        h4 {
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 500;
            color: #e0e0e0;
            
            @media (max-width: 600px) {
                margin-bottom: 12px;
            }
        }
    }
    
    .avatar-selector {
        width: 100%;
        
        @media (max-width: 600px) {
            display: flex;
            
            .p-button {
                flex: 1;
            }
        }
    }
    
    .avatar-url-field {
        margin-bottom: 10px;
    }
    
    .avatar-upload-section {
        background-color: rgba(16, 56, 51, 0.15);
        border-radius: 8px;
        padding: 16px;
        margin-top: 10px;
        
        h4 {
            margin: 0 0 14px 0;
            font-size: 16px;
            font-weight: 500;
            color: #e0e0e0;
        }
        
        .avatar-list-container {
            margin-top: 14px;
            max-height: 300px;
            
            @media (max-width: 600px) {
                max-height: 200px;
            }
        }
    }
}

.avatar-option {
    display: flex;
    align-items: center;
    padding: 8px 0;
    
    .avatar-filename {
        margin-left: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.empty-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    text-align: center;
    color: #9fa6ac;
    
    p {
        margin-top: 12px;
        font-size: 14px;
    }
}

.p-selectbutton {
    .p-button {
        background-color: #333;
        border: 1px solid #157474;
        color: #fff;
        transition: all 0.2s ease;

        &.p-highlight {
            background-color: #157474;
            border-color: #157474;
        }

        &:not(.p-highlight):hover {
            background-color: #444;
        }
        
        @media (max-width: 600px) {
            padding: 12px;
        }
    }
}

.custom-upload-button {
    border: 1px solid #157474;
    color: #157474;
    background-color: transparent;
    transition: all 0.2s ease;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    
    @media (max-width: 600px) {
        padding: 12px;
    }

    &:hover {
        background-color: rgba(21, 116, 116, 0.1);
        border-color: #1a8f8f;
    }
    
    &:active {
        transform: translateY(1px);
    }
}

.avatar-listbox {
    border: 1px solid rgba(21, 116, 116, 0.3);
    border-radius: 6px;
    
    &:deep(.p-listbox-header) {
        background-color: rgba(21, 116, 116, 0.1);
        border-bottom: 1px solid rgba(21, 116, 116, 0.3);
    }
    
    &:deep(.p-listbox-filter-container) {
        padding: 12px;
        
        .p-inputtext {
            background-color: #1d1e1e;
            border: 1px solid rgba(21, 116, 116, 0.3);
            color: #e0e0e0;
            border-radius: 4px;
            padding: 8px 12px;
            width: 100%;
            
            &:focus {
                border-color: #157474;
                box-shadow: 0 0 0 2px rgba(21, 116, 116, 0.2);
            }
        }
    }
    
    &:deep(.p-listbox-list) {
        padding: 8px;
    }
    
    &:deep(.p-listbox-item) {
        border-radius: 4px;
        margin-bottom: 4px;
        transition: background-color 0.2s ease;
        
        &:hover {
            background-color: rgba(21, 116, 116, 0.15);
        }
        
        &.p-highlight {
            background-color: rgba(21, 116, 116, 0.25);
        }
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

.system-prompt-card {
    margin-bottom: 20px;
    background-color: rgba(16, 56, 51, 0.1);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    @media (max-width: 600px) {
        margin-bottom: 15px;
    }
    
    .prompt-header {
        display: flex;
        align-items: center;
        padding: 14px 16px;
        background-color: rgba(21, 116, 116, 0.15);
        
        h3 {
            margin: 0;
            font-size: 17px;
            font-weight: 600;
            margin-left: 8px;
        }
        
        .section-icon {
            color: #157474;
        }
    }
    
    .prompt-content {
        padding: 16px;
        
        .prompt-description {
            margin: 0 0 16px 0;
            font-size: 14px;
            line-height: 1.5;
            color: #9fa6ac;
        }
        
        .prompt-actions {
            display: flex;
            gap: 10px;
            margin-top: 12px;
            
            button {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                border: 1px solid transparent;
                transition: all 0.2s ease;
                
                svg {
                    transition: transform 0.2s ease;
                }
                
                &:hover svg {
                    transform: translateY(-1px);
                }
                
                &:active {
                    transform: translateY(1px);
                }
            }
            
            .save-prompt-button {
                background-color: rgba(21, 116, 116, 0.2);
                border-color: rgba(21, 116, 116, 0.4);
                color: #e0e0e0;
                
                svg {
                    color: #157474;
                }
                
                &:hover {
                    background-color: rgba(21, 116, 116, 0.3);
                    border-color: #157474;
                }
            }
            
            .clear-prompt-button {
                background-color: rgba(255, 70, 70, 0.1);
                border-color: rgba(255, 70, 70, 0.3);
                color: #e0e0e0;
                
                svg {
                    color: #ff7070;
                }
                
                &:hover {
                    background-color: rgba(255, 70, 70, 0.2);
                    border-color: rgba(255, 70, 70, 0.5);
                }
            }
        }
    }
}

.saved-system-prompts-section {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
    background-color: rgba(16, 56, 51, 0.1);
    
    @media (max-width: 600px) {
        margin-bottom: 15px;
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        cursor: pointer;
        background-color: rgba(21, 116, 116, 0.15);
        transition: background-color 0.2s ease;
        
        @media (max-width: 600px) {
            padding: 10px 12px;
        }
        
        &:hover {
            background-color: rgba(21, 116, 116, 0.25);
        }
        
        h4 {
            margin: 0;
            display: flex;
            align-items: center;
            font-size: 16px;
            font-weight: 600;
            
            .section-icon {
                margin-right: 8px;
                color: #157474;
            }
            
            @media (max-width: 600px) {
                font-size: 17px;
            }
        }
        
        .indicator {
            color: #157474;
        }
    }
}

.saved-system-prompts {
    padding: 12px 16px;
    
    @media (max-width: 600px) {
        padding: 8px 12px;
    }
    
    .no-prompts {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background-color: rgba(16, 56, 51, 0.05);
        border-radius: 6px;
        text-align: center;
        color: #9fa6ac;
        
        @media (max-width: 600px) {
            padding: 12px;
        }
        
        p {
            margin-top: 12px;
            font-size: 14px;
        }
    }
    
    .prompts-container {
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
            max-height: 20vh;
            overflow-y: auto;
            scrollbar-width: thin;
            
            @media (max-width: 600px) {
                max-height: 25vh;
            }
            
            li {
                padding: 0;
                background-color: rgba(16, 56, 51, 0.3);
                border-radius: 6px;
                margin-bottom: 8px;
                overflow: hidden;
                text-align: left;
                cursor: pointer;
                transition: background-color 0.2s ease;
                
                &:hover {
                    background-color: rgba(16, 56, 51, 0.4);
                }
                
                &.selected {
                    background-color: rgba(21, 116, 116, 0.4);
                    border-left: 3px solid #157474;
                }
                
                .prompt-item-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px;
                    
                    @media (max-width: 600px) {
                        padding: 8px 10px;
                    }
                    
                    .prompt-text {
                        flex: 1;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        padding-right: 8px;
                    }
                    
                    .delete-prompt-btn {
                        background-color: transparent;
                        border: none;
                        color: #9fa6ac;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 6px;
                        border-radius: 4px;
                        transition: all 0.2s ease;
                        
                        &:hover {
                            background-color: rgba(255, 85, 85, 0.1);
                            color: #ff5555;
                        }
                    }
                }
            }
        }
    }
}

.control-checkbox {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px 15px;
    background-color: rgba(16, 56, 51, 0.1);
    border-radius: 8px;
    margin-bottom: 0;
    
    @media (max-width: 600px) {
        padding: 10px 12px;
        margin-bottom: 0;
    }

    label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        font-size: 16px;
        color: #fff;
        position: relative;
        width: 100%;
        user-select: none;
        
        @media (max-width: 600px) {
            font-size: 17px;
        }

        input[type="checkbox"] {
            opacity: 0;
            width: 0;
            height: 0;

            &:checked+.slider:before {
                transform: translateX(26px);
            }

            &:checked+.slider {
                background-color: #157474;
            }
        }

        .slider {
            width: 46px;
            height: 24px;
            background-color: #494747;
            border-radius: 34px;
            transition: all 0.2s ease;
            position: relative;
            margin-left: 10px;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
            
            @media (max-width: 600px) {
                width: 52px;
                height: 28px;
            }

            &:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                border-radius: 50%;
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                
                @media (max-width: 600px) {
                    height: 20px;
                    width: 20px;
                }
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