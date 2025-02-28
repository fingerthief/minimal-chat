import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Slider from '../../../src/components/controls/Slider.vue'

describe('Slider.vue', () => {
  it('renders properly with default props', () => {
    const wrapper = mount(Slider, {
      props: {
        label: 'Test Slider',
        modelValue: 50
      }
    })
    
    // Check if the component renders
    expect(wrapper.exists()).toBe(true)
    
    // Check if the label is rendered correctly
    expect(wrapper.text()).toContain('Test Slider: (50)')
    
    // Check if the default min/max labels are rendered
    expect(wrapper.text()).toContain('Min')
    expect(wrapper.text()).toContain('Max')
    
    // Check if the slider has the correct attributes
    const slider = wrapper.find('input[type="range"]')
    expect(slider.exists()).toBe(true)
    expect(slider.attributes('min')).toBe('0')
    expect(slider.attributes('max')).toBe('100')
    expect(slider.attributes('step')).toBe('1')
    expect(slider.element.value).toBe('50')
  })
  
  it('renders with custom props', () => {
    const wrapper = mount(Slider, {
      props: {
        label: 'Temperature',
        modelValue: 0.7,
        min: 0,
        max: 1,
        step: 0.1,
        minLabel: 'Precise',
        maxLabel: 'Creative'
      }
    })
    
    // Check if the label is rendered correctly
    expect(wrapper.text()).toContain('Temperature: (0.7)')
    
    // Check if the custom min/max labels are rendered
    expect(wrapper.text()).toContain('Precise')
    expect(wrapper.text()).toContain('Creative')
    
    // Check if the slider has the correct attributes
    const slider = wrapper.find('input[type="range"]')
    expect(slider.attributes('min')).toBe('0')
    expect(slider.attributes('max')).toBe('1')
    expect(slider.attributes('step')).toBe('0.1')
    expect(slider.element.value).toBe('0.7')
  })
  
  it('emits update:modelValue event when value changes', async () => {
    const wrapper = mount(Slider, {
      props: {
        label: 'Test Slider',
        modelValue: 50
      }
    })
    
    // Find the slider input
    const slider = wrapper.find('input[type="range"]')
    
    // Set the value and trigger input event
    await slider.setValue(75)
    
    // Check if the correct event was emitted
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['75'])
  })
})