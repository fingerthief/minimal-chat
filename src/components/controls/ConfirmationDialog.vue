<template>
  <Transition name="fade-in">
    <div v-if="visible" class="confirmation-dialog-overlay" @click="cancelAction">
      <div class="confirmation-dialog" @click.stop>
        <div class="dialog-icon" :class="{ warning: isWarning }">
          <AlertTriangle v-if="isWarning" :size="40" />
          <HelpCircle v-else :size="40" />
        </div>
        
        <div class="dialog-content">
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
          
          <div class="dialog-actions">
            <button class="cancel-btn" @click="cancelAction">
              <X :size="18" />
              <span>{{ cancelLabel }}</span>
            </button>
            <button class="confirm-btn" :class="{ 'warning-btn': isWarning }" @click="confirmAction">
              <AlertTriangle v-if="isWarning" :size="18" />
              <Check v-else :size="18" />
              <span>{{ confirmLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { AlertTriangle, HelpCircle, X, Check } from 'lucide-vue-next';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmation'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmLabel: {
    type: String,
    default: 'Confirm'
  },
  cancelLabel: {
    type: String,
    default: 'Cancel'
  },
  isWarning: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel', 'update:visible']);

function confirmAction() {
  emit('confirm');
  emit('update:visible', false);
}

function cancelAction() {
  emit('cancel');
  emit('update:visible', false);
}

// Add event listener for Escape key
watch(() => props.visible, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
});

function handleKeydown(event) {
  if (event.key === 'Escape') {
    cancelAction();
  } else if (event.key === 'Enter') {
    confirmAction();
  }
}
</script>

<style lang="scss" scoped>
// Variables
$primary-color: #157474;
$primary-dark: #0f5454;
$primary-light: #1a8f8f;
$warning-color: #e74c3c;
$warning-dark: #c0392b;
$background-color: #1d1e1e;
$overlay-color: rgba(0, 0, 0, 0.75);
$text-color: #ffffff;
$border-radius: 12px;
$transition-speed: 0.2s;

.confirmation-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $overlay-color;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.confirmation-dialog {
  background-color: $background-color;
  border-radius: $border-radius;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  border: 1px solid rgba($primary-color, 0.3);
  
  @media (max-width: 480px) {
    max-width: 90%;
    padding: 25px 20px;
  }
  
  .dialog-icon {
    color: $primary-color;
    background-color: rgba($primary-color, 0.1);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    
    &.warning {
      color: $warning-color;
      background-color: rgba($warning-color, 0.1);
    }
  }
  
  .dialog-content {
    text-align: center;
    width: 100%;
    
    h3 {
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 15px 0;
      color: $text-color;
    }
    
    p {
      font-size: 16px;
      line-height: 1.5;
      margin: 0 0 25px 0;
      color: rgba($text-color, 0.8);
    }
  }
  
  .dialog-actions {
    display: flex;
    gap: 15px;
    justify-content: space-between;
    width: 100%;
    margin-top: 10px;
    
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      border: none;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all $transition-speed ease;
      flex-grow: 1;
      flex-basis: 0;
      min-width: max-content;
      white-space: nowrap;
      
      &:active {
        transform: translateY(2px);
      }
    }
    
    .cancel-btn {
      background-color: rgba(255, 255, 255, 0.1);
      color: $text-color;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
    
    .confirm-btn {
      background-color: $primary-color;
      color: white;
      
      &:hover {
        background-color: $primary-light;
      }
      
      &.warning-btn {
        background-color: $warning-color;
        
        &:hover {
          background-color: $warning-dark;
        }
      }
    }
  }
}

// Animation
.fade-in-enter-active,
.fade-in-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>