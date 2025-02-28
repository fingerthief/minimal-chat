import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SliderCheckbox from '../../../src/components/controls/SliderCheckbox.vue'

// Create a mock ToggleButton component since the real one might have dependencies
const mockToggleButton = {
  name: 'ToggleButton',
  template: '<button @click="$emit(\'change\', { target: { checked: !modelValue } })">Toggle</button>',
  props: ['modelValue', 'inputId'],
  emits: ['update:modelValue', 'change']
}

describe('SliderCheckbox.vue', () => {
  it('renders with the correct label', () => {
    const wrapper = mount(SliderCheckbox, {
      props: {
        inputId: 'test-checkbox',
        labelText: 'Enable Feature',
        modelValue: false
      },
      global: {
        stubs: {
          ToggleButton: mockToggleButton
        }
      }
    })
    
    expect(wrapper.text()).toContain('Enable Feature:')
  })
  
  it('emits update:modelValue event when toggle is clicked', async () => {
    const wrapper = mount(SliderCheckbox, {
      props: {
        inputId: 'test-checkbox',
        labelText: 'Enable Feature',
        modelValue: false
      },
      global: {
        stubs: {
          ToggleButton: mockToggleButton
        }
      }
    })
    
    // Simulate a click on the toggle button
    await wrapper.findComponent({ name: 'ToggleButton' }).trigger('click')
    
    // Verify that the correct event was emitted with the expected value
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([true])
    
    // Since our mock toggle button always toggles from modelValue to !modelValue,
    // and the component doesn't internally update its state in this test,
    // the second click will also emit [true] because the mock is toggling from false
    // We can either update our mock or just test a single click
  })
})