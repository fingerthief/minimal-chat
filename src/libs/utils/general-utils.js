import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { isSidebarOpen, showConversationOptions, messages, sliderValue, isInteractModeOpen, pushToTalkMode, maxTokens, showStoredFiles, selectedModel, localModelName, streamedMessageText, isLoading } from '../state-management/state';
import { addMessage } from '../conversation-management/message-processing';
import { fetchTTSResponse } from '../api-access/gpt-api-access';
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function removeAPIEndpoints(url) {
  if (typeof url !== 'string') {
    showToast('URL must be a string');
    return;
  }

  // Remove API endpoints and any trailing "/"
  return url.replace(/\/v1(?:\/chat(?:\/completions)?)?/g, '').replace(/\/$/, '');
}

let retryCount = 0;
export async function getConversationTitleFromGPT(messages2, model, sliderValue2) {
  try {

    let tempMessages = messages.value.map((message) => ({
      role: message.role,
      content: message.content,
    }));
    tempMessages.push({ role: 'user', content: 'Summarize our conversation in 5 words or less.' });
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('gptKey') || 'Missing API Key'}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: tempMessages,
        max_tokens: 18,
        temperature: sliderValue.value,
      }),
    });

    const result = await response.json();

    if (result.choices && result.choices.length > 0) {
      retryCount = 0;
      return result.choices[0].message.content;
    } else {
      throw "I'm sorry, I couldn't generate a response.";
    }
  } catch (error) {
    if (retryCount < 5) {
      retryCount++;
      return getConversationTitleFromGPT(messages, model, sliderValue);
    }

    console.error('Error fetching GPT response:', error);
    return 'An error occurred while generating conversaton title.';
  }
}

let buffer = '';

export function parseStreamResponseChunk(chunk) {
  if (typeof chunk !== 'string') {
    throw new Error('Input chunk must be a string');
  }

  buffer += chunk;
  const lines = buffer.split('\n');

  // Handle the last incomplete line by preserving it in the buffer
  const completeLines = lines.slice(0, -1);
  buffer = lines[lines.length - 1];

  const results = [];
  for (const line of completeLines) {
    let cleanedLine = line.trim();

    // Removing multiple occurrences of "data:", any "[DONE]" tags, ": OPENROUTER PROCESSING", "event: " tags, and "ping"
    // Also removing streaming tags: message_start, content_block_start, content_block_delta, content_block_stop, message_delta, message_stop
    // Regex explanation:
    // - \[DONE\]: Matches the literal "[DONE]"
    // - \s*: Matches any whitespace characters (space, tab, newline, etc.)
    // - data:\s*: Matches "data:" followed by any whitespace
    // - : OPENROUTER PROCESSING: Matches the literal ": OPENROUTER PROCESSING"
    // - event:\s*: Matches "event:" followed by any whitespace
    // - ping: Matches the literal "ping"
    // - message_start|content_block_start|content_block_delta|content_block_stop|message_delta|message_stop: Matches any of these literal tags
    // Global flag 'g' to replace all occurrences throughout the string
    cleanedLine = cleanedLine.replace(
      /\[DONE\]\s*|data:\s*|: OPENROUTER PROCESSING|event:\s*|ping|message_start|content_block_start|content_block_delta|content_block_stop|message_delta|message_stop/gi,
      ''
    );

    if (cleanedLine !== '') {
      try {
        const parsed = JSON.parse(cleanedLine);
        results.push(parsed);
      } catch (error) {
        console.error(`Error parsing JSON: ${error}\nData: ${cleanedLine}`);
      }
    }
  }
  return results;
}

export function showToast(message) {
  Toastify({
    text: message,
    duration: 2000,
    newWindow: true,
    close: false,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true,
    style: {
      background: '#157474ac',
      color: 'whitesmoke',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
      borderRadius: '12px',
      padding: '14px 20px',
      fontFamily: 'Roboto, sans-serif',
      fontSize: '16px',
      lineHeight: '1.4',
      maxWidth: '70vw',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      cursor: 'default',
      transition: 'transform 0.15s ease-in-out, opacity 0.15s ease-in-out',
      opacity: '1',
      transform: 'translateY(-10px)',
      zIndex: '5'
    },
    onClick: function () { },
  }).showToast();
}

export function determineModelDisplayName(newValue) {
  const MODEL_TYPES = {
    OPEN_AI_FORMAT: 'open-ai-format',
    CLAUDE: 'claude',
    GPT: 'gpt',
    WEB_LLM: 'web-llm',
  };

  // Determine settings based on model type
  if (newValue.includes(MODEL_TYPES.OPEN_AI_FORMAT)) {
    return localModelName.value.replace(/\b['"]|['"]\b/g, '');
  } else if (newValue.includes(MODEL_TYPES.CLAUDE)) {
    return 'Claude';
  } else if (newValue.includes(MODEL_TYPES.GPT)) {
    return 'GPT';
  } else if (newValue.includes(MODEL_TYPES.WEB_LLM)) {
    return 'WebGPU Model';
  }
}

export function unloadModel(engine) {
  if (engine !== undefined) {
    engine.unload();
  }
}

// utils.js
export function updateUIWrapper(content, autoScrollBottom = true, appendTextValue = true) {
  updateUI(content, messages.value, addMessage, autoScrollBottom, appendTextValue);
}

// Variable to track if user has manually scrolled
let userHasManuallyScrolled = false;
let lastScrollPosition = 0;
let isAutoScrolling = false;

// Function to detect if user has manually scrolled
function setupScrollDetection() {
  const messageList = document.querySelector('.message-list');
  if (messageList) {
    const scroller = messageList.querySelector('.scroller');
    if (scroller) {
      // Track scroll position changes
      scroller.addEventListener('scroll', () => {
        // Only count as manual scroll if we're not auto-scrolling and
        // user has scrolled up more than 100px from bottom
        if (!isAutoScrolling) {
          const bottomPosition = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
          if (bottomPosition > 100) {
            userHasManuallyScrolled = true;
          } else {
            // If they scroll back to bottom, resume auto-scrolling
            userHasManuallyScrolled = false;
          }
        }
        lastScrollPosition = scroller.scrollTop;
      }, { passive: true });
      
      // User initiated scrolling with wheel
      scroller.addEventListener('wheel', () => {
        if (isLoading.value) {
          userHasManuallyScrolled = true;
        }
      }, { passive: true });
      
      // Touch devices
      scroller.addEventListener('touchmove', () => {
        if (isLoading.value) {
          userHasManuallyScrolled = true;
        }
      }, { passive: true });
    }
  }
}

// Attempt to set up event listeners when the DOM is ready
setTimeout(setupScrollDetection, 1000);

// Try again shortly after in case the component wasn't rendered yet
setTimeout(setupScrollDetection, 3000);

export function updateUI(content, messages, addMessage, autoScrollBottom = true, appendTextValue = true) {
  const lastMessage = messages[messages.length - 1];
  
  // Update streamedMessageText to trigger watchers in components
  streamedMessageText.value += content;

  if (lastMessage && lastMessage.role === 'assistant') {
    if (!appendTextValue) {
      lastMessage.content = content;
      return;
    }

    lastMessage.content[0].text += content;
    
    // Only auto-scroll if user hasn't manually scrolled
    if (!userHasManuallyScrolled) {
      setTimeout(() => {
        try {
          // Set flag to indicate we're auto-scrolling programmatically
          isAutoScrolling = true;
          
          // Find main scrollable container
          const messageList = document.querySelector('.message-list');
          if (messageList) {
            const scroller = messageList.querySelector('.scroller');
            if (scroller) {
              // Auto-scroll to bottom
              scroller.scrollTop = scroller.scrollHeight;
            }
          }
          
          // Reset auto-scrolling flag after a short delay
          setTimeout(() => {
            isAutoScrolling = false;
          }, 50);
        } catch (error) {
          isAutoScrolling = false;
          // Silent fail - no need to log these errors
        }
      }, 10);
    }
  } else {
    // Reset the scroll detection when a new message is added
    userHasManuallyScrolled = false;
    addMessage('assistant', content);
  }
}

export function isScrollable(element) {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

export function updateScrollButtonVisibility(messagesContainer, shouldShowScrollButton) {
  const messagesElement = messagesContainer.querySelectorAll('.scroller');
  if (messagesElement.length > 0) {
    const lastMessage = messagesElement[messagesElement.length - 1];

    if (!isScrollable(messagesContainer)) {
      shouldShowScrollButton.value = false;
      return;
    }

    // Calculate the bottom position of the last message relative to the container
    const lastMessageBottom = lastMessage.offsetTop + lastMessage.offsetHeight;
    const scrollBottom = messagesContainer.scrollTop + messagesContainer.offsetHeight;

    // Determine if the scroll position is within 20% of the bottom of the container
    const threshold = messagesContainer.scrollHeight - messagesContainer.offsetHeight * 0.2;

    if (lastMessageBottom > messagesContainer.offsetHeight && scrollBottom < threshold) {
      shouldShowScrollButton.value = true;
    } else {
      shouldShowScrollButton.value = false;
    }
  }
}

export function handleDoubleClick(sidebarContentContainer) {
  const currentWidth = sidebarContentContainer.offsetWidth;
  console.log(currentWidth);
  if (currentWidth < 25) {
    sidebarContentContainer.style.width = '420px';
  } else {
    sidebarContentContainer.style.width = '0px';
  }
}

export function startResize(event, sidebarContentContainer, initialWidth, initialMouseX) {
  initialWidth = sidebarContentContainer.offsetWidth;
  initialMouseX = event.clientX;
  document.addEventListener('mousemove', (e) => resize(e, sidebarContentContainer, initialWidth, initialMouseX));
  document.addEventListener('mouseup', () => stopResize(sidebarContentContainer, initialWidth, initialMouseX));
}

export function resize(event, sidebarContentContainer, initialWidth, initialMouseX) {
  const deltaX = event.clientX - initialMouseX;
  sidebarContentContainer.style.width = `${initialWidth + deltaX}px`;
}

export function stopResize() {
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
}

export function swipedLeft(event) {
  isSidebarOpen.value = false;
  showConversationOptions.value = !showConversationOptions.value;
}

export function swipedRight(event) {
  showConversationOptions.value = false;
  isSidebarOpen.value = !isSidebarOpen.value;
}

export async function handleTextStreamEnd(message) {
  if (isInteractModeOpen.value) {
    try {
      if (message.length <= 4096) {
        await fetchTTSResponse(message);
      }
    } catch (error) {
      console.error('Error with TTS Response:', error);
    } finally {
      if (pushToTalkMode.value) {
        isInteractModeOpen.value = false;
      }
    }
  }
}