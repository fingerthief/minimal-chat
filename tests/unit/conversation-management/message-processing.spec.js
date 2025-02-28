import { describe, it, expect, vi, beforeEach } from 'vitest'

// Setup mocks before importing the module
const mockMessages = { value: [] }
const mockSystemPrompt = { value: 'You are a helpful assistant' }

// Mock the dependencies
vi.mock('vue', () => {
  return {
    ref: vi.fn((val) => ({ value: val }))
  }
})

vi.mock('@/libs/api-access/claude-api-access', () => ({
  streamClaudeResponse: vi.fn()
}))

vi.mock('@/libs/utils/general-utils', () => ({
  showToast: vi.fn()
}))

vi.mock('@/libs/api-access/web-llm-access', () => ({
  sendBrowserLoadedModelMessage: vi.fn()
}))

vi.mock('../../../src/libs/api-access/open-ai-api-standard-access', () => ({
  fetchLocalModelResponseStream: vi.fn()
}))

vi.mock('../../../src/libs/api-access/gpt-api-access', () => ({
  fetchGPTResponseStream: vi.fn(),
  generateDALLEImage: vi.fn()
}))

// Mock the setSystemPrompt function
const mockSetSystemPrompt = vi.fn()
vi.mock('../../../src/libs/conversation-management/conversations-management', () => ({
  setSystemPrompt: mockSetSystemPrompt
}))

// Mock the state
vi.mock('../../../src/libs/state-management/state', () => {
  return {
    systemPrompt: mockSystemPrompt,
    messages: mockMessages
  }
})

// Import the module after the mocks are set up
const { addMessage } = await import('../../../src/libs/conversation-management/message-processing')

describe('message-processing.js', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessages.value = []
  })
  
  describe('addMessage', () => {
    it('should add a text message to the messages array', async () => {
      await addMessage('user', 'Hello, how are you?')
      
      expect(mockMessages.value.length).toBe(1)
      expect(mockMessages.value[0].role).toBe('user')
      expect(mockMessages.value[0].content).toEqual([
        { type: 'text', text: 'Hello, how are you?' }
      ])
      expect(mockMessages.value[0].id).toBe(1)
      expect(mockSetSystemPrompt).toHaveBeenCalledWith(mockMessages.value, mockSystemPrompt.value)
    })
    
    it('should add a message with pre-formatted content array', async () => {
      const content = [
        { type: 'text', text: 'This is a text message' },
        { type: 'image_url', url: 'https://example.com/image.jpg' }
      ]
      
      await addMessage('assistant', content)
      
      expect(mockMessages.value.length).toBe(1)
      expect(mockMessages.value[0].role).toBe('assistant')
      expect(mockMessages.value[0].content).toEqual(content)
      expect(mockSetSystemPrompt).toHaveBeenCalledWith(mockMessages.value, mockSystemPrompt.value)
    })
    
    it('should set incrementing IDs for each message', async () => {
      await addMessage('user', 'Message 1')
      await addMessage('assistant', 'Message 2')
      await addMessage('user', 'Message 3')
      
      expect(mockMessages.value.length).toBe(3)
      expect(mockMessages.value[0].id).toBe(1)
      expect(mockMessages.value[1].id).toBe(2)
      expect(mockMessages.value[2].id).toBe(3)
      expect(mockSetSystemPrompt).toHaveBeenCalledTimes(3)
    })
  })
})