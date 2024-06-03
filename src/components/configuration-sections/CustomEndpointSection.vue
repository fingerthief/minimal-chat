<template>
  <div class="control-grid">
    <h3>{{ isNewEndpoint ? 'Add New Custom Endpoint' : 'Edit Custom Endpoint' }}</h3>
    <InputField
      :isSecret="false"
      labelText="Label:"
      :placeholderText="'Enter the label for the model'"
      inputId="endpoint-label"
      :value="endpointLabel"
      :disabled="!isEditing"
      @update:value="handleUpdate('label', $event)"
    />
    <InputField
      :isSecret="false"
      labelText="Model Name:"
      :placeholderText="'Enter the model name'"
      inputId="model-name"
      :value="modelName"
      :disabled="!isEditing"
      @update:value="handleUpdate('name', $event)"
    />
    <InputField
      :isSecret="false"
      labelText="Endpoint URL:"
      :placeholderText="'Enter the base API Endpoint URL'"
      inputId="endpoint-url"
      :value="endpointUrl"
      :disabled="!isEditing"
      @update:value="handleUpdate('url', $event)"
    />
    <div class="control select-dropdown">
      <label for="modality-selector">Modality:</label>
      <div id="modality-selector" class="checkbox-group" :class="{ disabled: !isEditing }">
        <label v-for="option in modalityOptions" :key="option">
          <input type="checkbox" :value="option" v-model="modality" :disabled="!isEditing" /> {{ option }}
        </label>
      </div>
    </div>
    <div class="control select-dropdown">
      <label for="type-selector">Type:</label>
      <select id="type-selector" v-model="type" required :disabled="!isEditing">
        <option value="GPT">GPT</option>
        <option value="Claude">Claude</option>
        <option value="OpenAI">Open AI API Standard Access</option>
      </select>
    </div>
    <InputField
      :isSecret="true"
      labelText="API Key:"
      :placeholderText="'Enter the API key if applicable'"
      inputId="api-key"
      :value="apiKey"
      :disabled="!isEditing"
      @update:value="handleUpdate('apiKey', $event)"
    />
    <div v-if="isEditing">
      <div v-for="(param, index) in additionalParams" :key="index" class="additional-param">
        <InputField
          :isSecret="false"
          :labelText="`Parameter ${index + 1} Label:`"
          :placeholderText="'Enter the parameter label'"
          :inputId="`param-label-${index}`"
          :value="param.label"
          :disabled="!isEditing"
          @update:value="updateParam(index, 'label', $event)"
        />
        <InputField
          :isSecret="false"
          :labelText="`Parameter ${index + 1} Key:`"
          :placeholderText="'Enter the parameter key'"
          :inputId="`param-key-${index}`"
          :value="param.key"
          :disabled="!isEditing"
          @update:value="updateParam(index, 'key', $event)"
        />
        <div class="control select-dropdown">
          <label :for="`param-type-${index}`">Type:</label>
          <select :id="`param-type-${index}`" v-model="param.type" :disabled="!isEditing">
            <option value="int">Integer</option>
            <option value="float">Float</option>
            <option value="string">String</option>
            <option value="boolean">Boolean</option>
          </select>
        </div>
        <InputField
          v-if="param.type !== 'boolean'"
          :isSecret="false"
          :labelText="`Parameter ${index + 1} Default Value:`"
          :placeholderText="'Enter the default value'"
          :inputId="`param-default-${index}`"
          :value="param.defaultValue"
          :disabled="!isEditing"
          @update:value="updateParam(index, 'defaultValue', $event)"
        />
        <div v-else class="control select-dropdown">
          <label :for="`param-default-${index}`">Default Value:</label>
          <select :id="`param-default-${index}`" v-model="param.defaultValue" :disabled="!isEditing">
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
        <button @click="removeParam(index)" :disabled="!isEditing">Remove</button>
      </div>
      <button @click="addParam" :disabled="!isEditing">Add Parameter</button>
    </div>
    <div v-else>
      <div v-for="(param, index) in additionalParams" :key="index" class="additional-param">
        <div>
          <strong>{{ param.label }}:</strong> {{ param.defaultValue }}
        </div>
      </div>
    </div>
    <div class="button-group" v-if="isEditing">
      <button @click.stop="saveEndpoint">Save</button>
      <button @click.stop="cancelEdit">Cancel</button>
    </div>
    <div class="button-group" v-else>
      <button @click.stop="enableEditing">Edit</button>
      <button @click.stop="deleteEndpoint">Delete</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import InputField from '../InputField.vue';
import { customEndpoints, selectedCustomEndpoint, isSidebarOpen } from '@/libs/state-management/state';
import { addCustomEndpoint, saveCustomEndpoints, removeCustomEndpoint } from '@/libs/utils/settings-utils';

const endpointLabel = ref('');
const modelName = ref('');
const endpointUrl = ref('');
const modality = ref([]);
const type = ref('GPT'); // Default type
const apiKey = ref('');
const additionalParams = ref([]);

const modalityOptions = ['Text', 'STT', 'TTS', 'Vision', 'Image'];

const isNewEndpoint = computed(() => selectedCustomEndpoint.value === 'new');
const isEditing = ref(isNewEndpoint.value);

const selectedEndpoint = computed(() => {
  return customEndpoints.value.find(endpoint => endpoint.name === selectedCustomEndpoint.value) || {};
});

watch(selectedEndpoint, (newEndpoint) => {
  if (newEndpoint) {
    endpointLabel.value = newEndpoint.label || '';
    modelName.value = newEndpoint.name || '';
    endpointUrl.value = newEndpoint.url || '';
    modality.value = newEndpoint.modality || [];
    type.value = newEndpoint.type || 'GPT';
    apiKey.value = newEndpoint.apiKey || '';
    additionalParams.value = newEndpoint.additionalParams || [];
    isEditing.value = false;
  }
}, { immediate: true });

function handleUpdate(key, value) {
  switch (key) {
    case 'label':
      endpointLabel.value = value;
      break;
    case 'name':
      modelName.value = value;
      break;
    case 'url':
      endpointUrl.value = value;
      break;
    case 'modality':
      modality.value = value;
      break;
    case 'type':
      type.value = value;
      break;
    case 'apiKey':
      apiKey.value = value;
      break;
  }
}

function updateParam(index, key, value) {
  additionalParams.value[index][key] = value;
}

function addParam() {
  additionalParams.value.push({ label: '', key: '', type: 'string', defaultValue: '' });
}

function removeParam(index) {
  additionalParams.value.splice(index, 1);
}

function saveEndpoint() {
  const newEndpoint = {
    label: endpointLabel.value,
    name: modelName.value,
    url: endpointUrl.value,
    modality: modality.value,
    type: type.value,
    apiKey: apiKey.value,
    additionalParams: additionalParams.value,
  };

  if (isNewEndpoint.value) {
    addCustomEndpoint(newEndpoint);
    customEndpoints.value.push(newEndpoint);
  } else {
    const index = customEndpoints.value.findIndex(endpoint => endpoint.name === selectedCustomEndpoint.value);
    if (index !== -1) {
      customEndpoints.value[index] = newEndpoint;
    }
  }

  saveCustomEndpoints(customEndpoints.value);

  resetForm();
  isEditing.value = false;
}

function cancelEdit() {
  resetForm();
  isEditing.value = false;
}

function enableEditing() {
  isEditing.value = true;
  isSidebarOpen.value = true; // Ensure the sidebar stays open
}

function deleteEndpoint() {
  customEndpoints.value = customEndpoints.value.filter(e => e.name !== selectedCustomEndpoint.value);
  removeCustomEndpoint(selectedCustomEndpoint.value);
  resetForm();
}

function resetForm() {
  endpointLabel.value = '';
  modelName.value = '';
  endpointUrl.value = '';
  modality.value = [];
  type.value = 'GPT';
  apiKey.value = '';
  additionalParams.value = [];
  selectedCustomEndpoint.value = null;
}
</script>

<style scoped>
.center-text {
    text-align: center;
    bottom: 10px;
    position: relative;
}

.saved-custom-endpoints {
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

            .delete-custom-config-btn {
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

.flex-container {
    align-items: center;
    gap: 10px;
    width: 100%;

    .slider-container {
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;

        input[type='range'] {
            -webkit-appearance: none;
            flex-grow: 1;
            height: 5px;
            background: #0c1928;
            outline: none;
            margin-left: 10px;
            margin-right: 10px;

            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                background: #1a5951;
                cursor: pointer;
            }

            background: #1a5951;
            cursor: pointer;
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

.checkbox-group {
  display: flex;
  flex-direction: column;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.button-group button {
  padding: 10px 15px;
  cursor: pointer;
}

.checkbox-group.disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>
