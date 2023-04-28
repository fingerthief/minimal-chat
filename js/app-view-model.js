import {
    wrapCodeSnippets,
    getConversationTitleFromGPT,
} from './utils.js';
import {
    fetchGPTResponse,
    loadMessagesFromLocalStorage,
    loadConversationTitles,
    loadStoredConversations,
} from './storage.js';

const ko = window.ko;
const messagesContainer = document.querySelector('.messages');



export function AppViewModel() {
    const self = this;
    self.userInput = ko.observable('');
    self.isProcessing = ko.observable(false);
    self.messages = ko.observableArray(loadMessagesFromLocalStorage() || []);
    self.isLoading = ko.observable(false);
    self.sliderValue = ko.observable(localStorage.getItem('gpt-attitude') || 50);
    self.isSidebarOpen = ko.observable(false);
    self.showConversationOptions = ko.observable(false);
    self.streamedMessageText = ko.observable();
    self.selectedModel = ko.observable(
        localStorage.getItem('selectedModel') || 'gpt-3.5-turbo',
    );

    self.messages.subscribe(() => {
        setTimeout(() => {
            hljs.highlightAll();
        }, 0);
    });

    self.conversationTitles = ko.observableArray(loadConversationTitles());
    self.storedConversations = ko.observableArray(loadStoredConversations());
    self.selectedConversation = ko.observable(
        self.storedConversations()[self.storedConversations().length - 1],
    );

    self.conversations = ko.observableArray(loadConversationTitles());
    self.selectedConversation(self.conversations()[0]);

    self.displayConversations = ko.computed(() =>
        self.conversations().filter(
            (conversation) =>
                !self.selectedConversation() ||
                self.selectedConversation().title ===
                'Choose an existing conversation' ||
                conversation.title !== 'Choose an existing conversation',
        ),
    );

    const userInput = document.getElementById('user-input');
    userInput.addEventListener('input', autoResize);
    userInput.addEventListener('focus', autoResize);

    function autoResize() {
        this.style.height = 'auto';
        this.style.height = `${this.scrollHeight}px`;
    }

    if (!localStorage.getItem('selectedModel')) {
        localStorage.setItem('selectedModel', self.selectedModel());
    }

    self.saveSelectedModel = function () {
        localStorage.setItem('selectedModel', self.selectedModel());
    };

    self.selectedModel.subscribe(() => {
        self.saveSelectedModel();
    });

    self.onShowConversationsClick = async function() {
        if (self.displayConversations().length > 1) {
            self.showConversationOptions(!self.showConversationOptions());
        }
    };

    document.addEventListener('click', (event) => {
        if (
            !event.target.closest('.sidebar') &&
            !event.target.closest('.settings-btn')
        ) {
            self.isSidebarOpen(false);
        }
    });

    self.selectedConversation.subscribe((newValue) => {
        if (newValue) {
            self.loadSelectedConversation(newValue);
        }
    });

    self.toggleSidebar = () => {
        self.isSidebarOpen(!self.isSidebarOpen());
    };

    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default behavior of the Enter key
            self.sendMessage(); // Call the sendMessage function
        }
    });

    self.loadSelectedConversation = function (value) {
        // Check if the title of the selected conversation is 'Choose an existing conversation'
        if (self.selectedConversation() && self.selectedConversation().title === 'Choose an existing conversation') {
            return;
        }

        const selectedMessages = self.selectedConversation().messageHistory;
        self.messages(selectedMessages);
        self.showConversationOptions(false);
    };

    self.deleteCurrentConversation = async function () {
        self.isProcessing(true);
        let storedConversations = JSON.parse(localStorage.getItem("gpt-conversations"));

        const newConversation = {
            messageHistory: self.messages().slice(0),
            title: await getConversationTitleFromGPT(self.messages().slice(0), self.selectedModel(), self.sliderValue())
        };

        newConversation.messageHistory = self.messages().slice(0);

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

        let conversations = JSON.parse(localStorage.getItem("gpt-conversations"));
        conversations.pop(conversationIndex);
        localStorage.setItem("gpt-conversations", JSON.stringify(conversations));
        self.storedConversations(loadStoredConversations());
        self.messages(loadMessagesFromLocalStorage());
        self.conversationTitles(loadConversationTitles());
        self.conversations(loadConversationTitles());
        self.isProcessing(false);
    };

    const apiKey = document.getElementById('api-key');
    apiKey.value = localStorage.getItem("gpt3Key") || "";

    async function fetchGPTResponseStream(conversation, attitude, model) {

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
                    stream: true,
                    messages: conversation,
                    temperature: attitude * 0.01
                }),
            });

           // self.messages.push({ role: 'assistant', content: "" });

            // Read the response as a stream of data
            const reader = await response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                // Massage and parse the chunk of data
                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");
                const parsedLines = lines
                    .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
                    .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
                    .map((line) => JSON.parse(line)); // Parse the JSON string

                for (const parsedLine of parsedLines) {
                    const { choices } = parsedLine;
                    const { delta } = choices[0];
                    const { content } = delta;
                    // Update the UI with the new content
                    if (content) {
                        self.streamedMessageText((self.streamedMessageText() || "") + content);
                        self.scrollToBottom();
                    }
                }
            }

            return self.streamedMessageText();
        } catch (error) {
            console.error("Error fetching GPT response:", error);
            return "An error occurred while fetching a response.";
        }
    }

    self.sendMessage = async function () {
        const messageText = self.userInput().trim();

        if (!messageText) {
            return;
        }

        self.messages.push({ role: 'user', content: messageText });
        this.scrollToBottom();
        self.userInput('');

        // Reset the user input field
        userInput.value = '';
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
        userInput.focus();

        self.streamedMessageText("");
        self.isLoading(true);

        try {
            const response = await fetchGPTResponseStream(self.messages(), self.sliderValue(), self.selectedModel());

            self.isLoading(false);
            self.messages.push({ role: 'assistant', content: response });

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

        // Find the index of the selected conversation in storedConversations
        const conversationIndex = self.storedConversations().findIndex(conversation => conversation.title === self.selectedConversation().title);

        if (conversationIndex !== -1) {
            // Update the message history of the selected conversation
            self.storedConversations()[conversationIndex].messageHistory = savedMessages;
        }

        // Save the updated conversations to localStorage
        localStorage.setItem("gpt-conversations", JSON.stringify(self.storedConversations()));
    };

    self.formatMessage = function (message, isStartup) {
        let md = window.markdownit();
        let formattedMessage = wrapCodeSnippets(md.render(message));
        return formattedMessage;
    };

    self.clearMessages = async function () {
        self.isProcessing(true);

        const newConversation = {
            messageHistory: self.messages().slice(0),
            title: await getConversationTitleFromGPT(self.messages().slice(0), self.selectedModel(), self.sliderValue())
        };

        newConversation.messageHistory = self.messages().slice(0);

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

        self.conversations(loadConversationTitles());
        self.storedConversations(loadStoredConversations());


        self.messages([]);
        localStorage.removeItem("gpt-messages");

        // Add the default option back to the conversations array if it's not already there
        const defaultOption = { title: 'Choose an existing conversation', messageHistory: [] };
        if (self.conversations()[0].title !== defaultOption.title) {
            self.conversations.unshift(defaultOption);
        }

        self.selectedConversation(self.conversations()[0]);
        self.isProcessing(false);
        //self.messages(loadMessagesFromLocalStorage());
    };

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

    if (self.conversations().length > 1) {
        self.selectedConversation(self.conversations()[self.conversations().length - 1]);
        self.loadSelectedConversation();
    }   
}