import '../node_modules/markdown/lib/markdown.js';
import '../node_modules/knockout/build/output/knockout-latest.debug.js';

const ko = window.ko;
const apiKey = document.getElementById('api-key');
apiKey.value = localStorage.getItem("gpt3Key") || "";
let messagesContainer = document.querySelector('.messages');

// Knockout ViewModel
function AppViewModel() {
    const self = this;
    self.userInput = ko.observable('');
    self.messages = ko.observableArray(loadMessagesFromLocalStorage());
    self.isLoading = ko.observable(false);
    self.sliderValue = ko.observable(localStorage.getItem("gpt-attitude") || 50);
    this.isSidebarOpen = ko.observable(false);
    self.selectedModel = ko.observable(localStorage.getItem('selectedModel') || 'gpt-3.5-turbo');

    if (!localStorage.getItem("selectedModel")) {
        localStorage.setItem("selectedModel", self.selectedModel());
    }

    self.saveSelectedModel = function () {
        localStorage.setItem('selectedModel', self.selectedModel());
    };
    
    self.selectedModel.subscribe(() => {
        self.saveSelectedModel();
    });
    
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.sidebar') && !event.target.closest('.settings-btn')) {
            this.isSidebarOpen(false);
        }
    });
    
    this.toggleSidebar = () => {
        this.isSidebarOpen(!this.isSidebarOpen());
    };    

    function wrapCodeSnippets(input) {
        const codeSnippetRegex = /`([^`]+)`/g;

        const wrapped = input.replace(codeSnippetRegex, (match, code) => {
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

    async function fetchGPTResponse(conversation, attitude, model) {
        const prompt = `Me: ${conversation}\nAI:`;
        let storedApiKey = localStorage.getItem("gpt3Key");

        if (storedApiKey !== apiKey.value.trim()) {
            localStorage.setItem("gpt3Key", apiKey.value.trim());
            storedApiKey = apiKey.value.trim();
        }

        if (!localStorage.getItem("gpt-attitude") || localStorage.getItem("gpt-attitude") !==  attitude) {
            localStorage.setItem("gpt-attitude", attitude);
        }

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${storedApiKey || 'Missing API Key'}`,
                },
                body: JSON.stringify({
                    model: model,
                    messages: conversation,
                    temperature: attitude * 0.01
                }),
            });

            const result = await response.json();

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

    function loadMessagesFromLocalStorage() {
        const storedMessages = localStorage.getItem('gpt-conversations');
        let parsedConversations = storedMessages ? JSON.parse(storedMessages) : [];


        return parsedConversations.length ? parsedConversations[parsedConversations.length - 1].messageHistory : []; 
    }


    self.sendMessage = async function () {
        const messageText = self.userInput().trim();

        if (!messageText) {
            return;
        }

        self.messages.push({ role: 'user', content: messageText });
        this.scrollToBottom();
        self.userInput('');
        self.isLoading(true);

        try {
            const response = await fetchGPTResponse(self.messages(), self.sliderValue(), self.selectedModel());
            self.isLoading(false);
            self.messages.push({ role: 'assistant', content: response });
            hljs.highlightAll();
            self.saveMessages();
            this.scrollToBottom();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    self.saveMessages = function () {
        const savedMessages = self.messages().map(message => ({
            role: message.role,
            content: message.content
        }));
        localStorage.setItem("gpt-messages", JSON.stringify(savedMessages));
    };

    self.formatMessage = function (message) {
        let md = window.markdownit();
        let formattedMessage = wrapCodeSnippets(md.render(message));
        return formattedMessage;
    };

    self.clearMessages = async function () {
        const newConversation = {
            messageHistory: self.messages(),
            title: await getConversationTitleFromGPT()
        };
    
        if (!localStorage.getItem("gpt-conversations")) {
            localStorage.setItem("gpt-conversations", JSON.stringify([newConversation]));
        } else {
            let storedConversations = JSON.parse(localStorage.getItem("gpt-conversations"));
    
            // Find the index of the conversation that has a 15% or more match in assistant's answers
            const conversationIndex = storedConversations.findIndex((storedConversation) => {
                const storedAssistantAnswers = storedConversation.messageHistory.filter(msg => msg.role === 'assistant');
                const newAssistantAnswers = newConversation.messageHistory.filter(msg => msg.role === 'assistant');
    
                const matchingAnswers = storedAssistantAnswers.filter((storedAnswer, index) => {
                    return index < newAssistantAnswers.length && storedAnswer.content === newAssistantAnswers[index].content;
                });
    
                const matchingPercentage = (matchingAnswers.length / storedAssistantAnswers.length) * 100;
    
                return matchingPercentage >= 15;
            });
    
            if (conversationIndex !== -1) {
                // Update the existing conversation's messageHistory with the new values
                storedConversations[conversationIndex].messageHistory = newConversation.messageHistory;
            } else {
                // If the conversation doesn't exist, add it to the stored conversations
                storedConversations.push(newConversation);
            }
    
            localStorage.setItem("gpt-conversations", JSON.stringify(storedConversations));
        }
    
        self.messages.removeAll();
        localStorage.removeItem("gpt-messages");
    };
    

    async function getConversationTitleFromGPT() {
        try {
            let tempMessages = self.messages().slice(0);
            tempMessages.push({ role: 'user', content: "Summarize our conversation in 5 words or less." });
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey.value.trim() || 'Missing API Key'}`,
                },
                body: JSON.stringify({
                    model: self.selectedModel(),
                    messages: tempMessages,
                    temperature: self.sliderValue() * 0.01
                }),
            });

            const result = await response.json();

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


    self.scrollToBottom = function () {
        // Smooth scrolling
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth',
        });

        // Fallback to ensure the container is scrolled to the bottom
        setTimeout(() => {
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
            });
        }, 500); // Adjust the timeout duration as needed
    };

}

// Bind the ViewModel
ko.applyBindings(new AppViewModel());
