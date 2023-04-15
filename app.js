import '../node_modules/markdown/lib/markdown.js';
import '../node_modules/knockout/build/output/knockout-latest.debug.js';

const ko = window.ko;
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
let messagesContainer = document.querySelector('.messages');
const apiKey = document.getElementById('api-key');

let messages = []; // Add this line to store all the messages

apiKey.value = localStorage.getItem("gpt3Key") ? localStorage.getItem("gpt3Key") : "";

if (localStorage.getItem("gpt-messages") && localStorage.getItem("gpt-messages") !== "") {
    for (const message of JSON.parse(localStorage.getItem("gpt-messages"))) {
        addMessage(message.role, message.content);
        messages.push(message);
    }
}

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageText = userInput.value.trim();

    if (messageText) {
        messages.push({ role: 'user', content: messageText }); // Store the user message
        addMessage('user', messageText);
        userInput.value = '';

        showLoadingMessage();

        fetchGPTResponse(messages).then((response) => {
            removeLoadingMessage();
            messages.push({ role: 'assistant', content: response }); // Store the GPT response
            addMessage('assistant', response);
            hljs.highlightAll();

            let savedMessages = [];
            for (const message of messages)
            {
                savedMessages.push(message);
            }

            localStorage.setItem("gpt-messages", JSON.stringify(savedMessages));
        });
    }
});

function addMessage(role, message) {
    let md = window.markdownit();
    let formattedMessage = wrapCodeSnippets(md.render(message));

    const newMessage = document.createElement('div');
    newMessage.className = role === 'user' ? 'user message' : 'gpt message';
    newMessage.innerHTML = `<span class="label">${role === 'user' ? 'Me' : 'GPT'}</span>${formattedMessage}`;
    messagesContainer.appendChild(newMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add the following new functions
function showLoadingMessage() {
    const newMessage = document.createElement('div');
    newMessage.className = 'gpt message loading';
    newMessage.innerHTML = `<span class="label">GPT</span>Generating Response <span class="loading spinner"></span>`;
    messagesContainer.appendChild(newMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


function removeLoadingMessage() {
    const loadingMessage = document.querySelector('.gpt.message.loading');
    if (loadingMessage) {
        messagesContainer.removeChild(loadingMessage);
    }
}

function wrapCodeSnippets(input) {
    // Regular expression to match code snippets surrounded by backticks
    const codeSnippetRegex = /`([^`]+)`/g;

    // Replace code snippets with wrapped versions
    const wrapped = input.replace(codeSnippetRegex, (match, code) => {
        // Escape HTML entities to prevent XSS attacks
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        return `<pre><code>${escapedCode}</code></pre>`;
    });

    return wrapped;
}


async function fetchGPTResponse(conversation) {
    const prompt = `Me: ${conversation}\nAI:`;

    if (!localStorage.getItem("gpt3Key") || localStorage.getItem("gpt3Key") !== apiKey.value && apiKey.value !== "") {
        localStorage.setItem("gpt3Key", apiKey.value.trim());
    }

    if (apiKey.Value !== localStorage.getItem("gpt3Key")) {
        apiKey.value = localStorage.getItem("gpt3Key")
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("gpt3Key") ? localStorage.getItem("gpt3Key") : 'Missing API Key'}`, // Replace with your actual API key
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: conversation,
                temperature: 0.5
            }),
        });

        const result = await response.json();
        console.log(result);

        if (result.choices && result.choices.length > 0) {
            return result.choices[0].message.content;
        } else {
            return "I'm sorry, I couldn't generate a response.";
        }
    } catch (error) {
        console.error("Error fetching GPT response:", error);
        return "An error occurred while fetching a response.";
    }
}



