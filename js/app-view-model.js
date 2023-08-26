import {
    wrapCodeSnippets,
    getConversationTitleFromGPT
} from '../js/utils.js';
import {
    loadConversationTitles,
    loadStoredConversations,
    generateDALLEImage
} from '../js/storage.js';
import {
    fetchPalmResponse,
    fetchPalmConversationTitle
} from '../js/palm-api-access.js';

import "../node_modules/swiped-events/dist/swiped-events.min.js";

const ko = window.ko;
const messagesContainer = document.querySelector('.messages');

export function AppViewModel() {
    const self = this;
    self.userInput = ko.observable('');
    self.isGeneratingImage = ko.observable(false);
    self.userSearchInput = ko.observable('');
    self.isProcessing = ko.observable(false);
    self.shouldShowScrollButton = ko.observable(false);
    self.messages = ko.observableArray([]);
    self.isLoading = ko.observable(false);
    self.sliderValue = ko.observable(localStorage.getItem('gpt-attitude') || 50);
    self.palmSliderValue = ko.observable(localStorage.getItem('palm-attitude') || 50);
    self.isSidebarOpen = ko.observable(false);
    self.showConversationOptions = ko.observable(false);
    self.streamedMessageText = ko.observable();
    self.showingSearchField = ko.observable(false);
    self.filteredMessages = ko.observableArray([]);
    self.isPalmEnabled = ko.observable(false);
    self.lastLoadedConversationId = ko.observable(null);

    self.selectedModel = ko.observable(
        localStorage.getItem('selectedModel') || 'gpt-3.5-turbo',
    );

    self.selectedAutoSaveOption = ko.observable(
        localStorage.getItem('selectedAutoSaveOption') || true,
    );

    self.selectedDallEImageCount = ko.observable(localStorage.getItem('selectedImageCountOption') || '4');
    self.selectedDallEImageResolution = ko.observable(localStorage.getItem('selectedImageResolutionOption') || '256x256');

    hljs.configure({ ignoreUnescapedHTML: true });

    self.conversationTitles = ko.observableArray(loadConversationTitles());
    self.storedConversations = ko.observableArray(loadStoredConversations());
    self.selectedConversation = ko.observable(
        self.storedConversations()[self.storedConversations().length],
    );

    self.conversations = ko.observableArray(loadConversationTitles());
    self.selectedConversation(self.conversations()[0]);

    self.displayConversations = ko.computed(() =>
        self.conversations()
    );

    ko.bindingHandlers.stopClickPropagation = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            element.addEventListener('click', function (event) {
                event.stopPropagation();
            });
        }
    };

    const defaults = {
        html: false, // Enable HTML tags in source
        xhtmlOut: false, // Use '/' to close single tags (<br />)
        breaks: false, // Convert '\n' in paragraphs into <br>
        langPrefix: 'language-', // CSS language prefix for fenced blocks
        linkify: true, // autoconvert URL-like texts to links
        typographer: true, // Enable smartypants and other sweet transforms
        // options below are for demo only
        _highlight: false, // <= THIS IS WHAT YOU NEED
        _strict: false,
        _view: 'src' // html / src / debug
    };

    defaults.highlight = function (str, lang) {
        const md = window.markdownit(defaults);
        var esc = md.utils.escapeHtml;
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(lang, str, true).value +
                    '</code></pre>';
            } catch (__) { }
        } else {
            return '<pre class="hljs"><code>' + esc(str) + '</code></pre>';
        }

    };

    const floatinSearchField = document.getElementById('floating-search-field');
    floatinSearchField.addEventListener('transitionend', zIndexAfterTransition)

    floatinSearchField.style.zIndex = '-9999';

    const apiKey = document.getElementById('api-key');
    apiKey.value = localStorage.getItem("gptKey");

    apiKey.addEventListener("blur", () => {
        if (apiKey.value.trim() !== "")
        {
            localStorage.setItem("gptKey", apiKey.value.trim());
        }
    });

    const palmApiKey = document.getElementById('palm-api-key');
    palmApiKey.value = localStorage.getItem("palmKey");

    palmApiKey.addEventListener("blur", () => {
        if (palmApiKey.value.trim() !== "")
        {
            localStorage.setItem("palmKey", palmApiKey.value.trim());
        }
    });

    self.sliderValue.subscribe((attitude) => {
        localStorage.setItem("gpt-attitude", attitude);
    });

    self.palmSliderValue.subscribe((attitude) => {
        localStorage.setItem("palm-attitude", attitude);
    });

    let blurTimeout;
    self.onUserSearchBlur = function (event) {
        clearTimeout(blurTimeout);
        blurTimeout = setTimeout(function () {
            // Your blur event logic here
            self.showSearchField();
        }, 200);
    }

    function zIndexAfterTransition() {
        if (!self.showingSearchField()) {
            this.style.zIndex = '-9999';
        }
    }

    const appBody = document.getElementById('app-container');

    const userInput = document.getElementById('user-input');
    userInput.addEventListener('input', self.autoResize);
    userInput.addEventListener('focus', self.autoResize);
    userInput.addEventListener('blur', self.autoResize);

    self.autoResize = function () {
        if (!self.userInput() || self.userInput().trim() === "") {

            this.style.height = '30px';
            return;
        }

        this.style.height = 'auto';
        this.style.height = `${this.scrollHeight - 15}px`;
    }

    if (!localStorage.getItem('selectedModel')) {
        localStorage.setItem('selectedModel', self.selectedModel());
    }

    if (!localStorage.getItem('selectedAutoSaveOption')) {
        localStorage.setItem('selectedAutoSaveOption', self.selectedAutoSaveOption());
    }

    self.swipedLeft = function () {
        self.isSidebarOpen(false);
        self.showConversationOptions(!self.showConversationOptions());
    }

    self.swipedRight = function () {
        self.showConversationOptions(false);
        self.isSidebarOpen(!self.isSidebarOpen());
    }

    self.filteredMessages = ko.computed(() => {
        const searchQuery = self.userSearchInput().toLowerCase();
        if (searchQuery.length === 0) {
            return self.messages();
        }
        return self.messages().filter((message) =>
            message.content.toLowerCase().includes(searchQuery)
        );
    });

    self.saveSelectedModel = function () {
        localStorage.setItem('selectedModel', self.selectedModel());

        self.messages.valueHasMutated();
    };

    self.saveSelectedAutoSaveOption = function () {
        localStorage.setItem('selectedAutoSaveOption', self.selectedAutoSaveOption());
    };

    self.saveSelectedDallEImageCountOption = function () {
        localStorage.setItem('selectedImageCountOption', self.selectedDallEImageCount());
    };

    self.saveSelectedDallEImageResolutionOption = function () {
        localStorage.setItem('selectedImageResolutionOption', self.selectedDallEImageResolution());
    };

    self.selectedModel.subscribe(() => {
        self.saveSelectedModel();

        if (self.selectedModel() === "chat-bison-001") {
            self.palmMessages = [];

            for (const chatMessage of self.messages()) {
                self.palmMessages.push({ content: chatMessage.content });
            }
        }
    });

    self.selectedAutoSaveOption.subscribe(() => {
        self.saveSelectedAutoSaveOption();
    });

    self.selectedDallEImageCount.subscribe(() => {
        self.saveSelectedDallEImageCountOption();
    });
    self.selectedDallEImageResolution.subscribe(() => {
        self.saveSelectedDallEImageResolutionOption();
    });

    self.onShowConversationsClick = async function () {
            self.showConversationOptions(!self.showConversationOptions());
    };

    document.addEventListener('click', (event) => {
        if (
            !event.target.closest('.sidebar') &&
            !event.target.closest('.settings-btn') &&  !event.target.closest('.saved-conversations-dropdown')
        ) {
            self.isSidebarOpen(false);
            self.showConversationOptions(false);
        }
    });

    self.toggleSidebar = () => {
        self.isSidebarOpen(!self.isSidebarOpen());

        if (self.isSidebarOpen()) {
            const apiKey = document.getElementById('api-key');
            apiKey.value = localStorage.getItem("gptKey");

            const palmApiKey = document.getElementById('palm-api-key');
            palmApiKey.value = localStorage.getItem("palmKey");
        }
    };

    const messagesContainer = document.getElementById("messagesContainer");

    self.updateScrollButtonVisibility = function () {
        const messages = messagesContainer.querySelectorAll('.message');
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const rect = lastMessage.getBoundingClientRect();

            if (!isScrollable(messagesContainer)) {
                self.shouldShowScrollButton(false);
                return;
            }

            if ((parseFloat(rect.bottom) * 0.001) > 0.75) {
                self.shouldShowScrollButton(true);
            } else {
                self.shouldShowScrollButton(false);
            }
        }
    };
    
    messagesContainer.addEventListener('scroll', self.updateScrollButtonVisibility);

    function isScrollable(element) {
        return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
    }  

    hotkeys('ctrl+shift+m', function (event, handler) {
        event.preventDefault();
        self.isSidebarOpen(false);
        self.showConversationOptions(true);
    });

    hotkeys('ctrl+shift+s', function (event, handler) {
        event.preventDefault();
        self.showConversationOptions(false);
        self.isSidebarOpen(true);
    });

    hotkeys('ctrl+shift+i', function (event, handler) {
        event.preventDefault();
        self.clearMessages();
    });

    hotkeys('ctrl+shift+f', function (event, handler) {
        event.preventDefault();
        self.showSearchField();
    });

    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault(); // Prevent the default behavior of the Enter key
            self.userInput(self.userInput() + " \n");
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default behavior of the Enter key
            self.sendMessage(); // Call the sendMessage function
        }
    });

    self.loadSelectedConversation = async function (value) {

        if (value) {
            self.selectedConversation(value.conversation);

            self.lastLoadedConversationId(value.id);
            localStorage.setItem('lastConversationId', self.lastLoadedConversationId());
        }

        if (!self.selectedConversation()) {
            return;
        }

        const selectedMessages = self.selectedConversation().messageHistory;
        self.messages(selectedMessages);
        self.showConversationOptions(false);

        self.messages(selectedMessages);
    };

    self.showSearchField = async function (isFromSearch) {
        clearTimeout(blurTimeout);

        if (!self.showingSearchField()) {
            floatinSearchField.style.zIndex = '9999';
            //userSearchInput.focus();
        }

        self.showingSearchField(!self.showingSearchField());
    };

    self.deleteCurrentConversation = async function () {
        if (self.lastLoadedConversationId() === null) {
            return;
        }

        self.storedConversations(loadStoredConversations());

        self.isProcessing(true);

        const conversationIndex = self.storedConversations().findIndex(conversation => { 
            return conversation.id === parseInt(self.lastLoadedConversationId());
        });

        self.storedConversations().splice(conversationIndex, 1);
        self.storedConversations.valueHasMutated();

        localStorage.setItem("gpt-conversations", JSON.stringify(self.storedConversations()));
        self.storedConversations(loadStoredConversations());
        self.messages([]);
        self.conversationTitles(loadConversationTitles());
        self.conversations(loadConversationTitles());
        self.lastLoadedConversationId(null);
        localStorage.setItem("lastConversationId", self.lastLoadedConversationId());
        self.isProcessing(false);
    };


    let retryCount = 0;
    async function fetchGPTResponseStream(conversation, attitude, model) {

        let lastMessageContent = "";
        let indexAfterMessages = [];


        let gptMessagesOnly = conversation.filter(message => {
            let isGPT = message.content.trim().toLowerCase().startsWith("image::") === false & lastMessageContent.startsWith("image::") === false;
            lastMessageContent = message.content.trim().toLowerCase();
            return isGPT;
        });

        const prompt = `Me: ${conversation}\nAI:`;
        let storedApiKey = localStorage.getItem("gptKey");

        if (storedApiKey !== apiKey.value.trim()) {
            localStorage.setItem("gptKey", apiKey.value.trim());
            storedApiKey = apiKey.value.trim();
        }

        if (!localStorage.getItem("gpt-attitude") || localStorage.getItem("gpt-attitude") !== attitude) {
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
                    messages: gptMessagesOnly,
                    temperature: attitude * 0.01
                }),
            });

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
                        hljs.highlightAll();
                        self.scrollToBottom();
                    }
                }
            }

            retryCount = 0;
            return self.streamedMessageText();
        } catch (error) {

            if (retryCount < 5) {
                retryCount++;
                console.log("Retry Number: " + retryCount);
                return await fetchGPTResponseStream(conversation, attitude, model);
            }
            else {
                console.error("Error fetching GPT response:", error);
                return "An error occurred while fetching GPT response stream.";
            }
        }
    }

    self.palmMessages = [];
    self.sendMessage = async function () {
        const messageText = self.userInput().trim();

        // if (messageText.toLowerCase().startsWith("weather::")) {
        //     self.userInput("");
        //     userInput.style.height = '30px';

        //     self.messages.push({ role: 'user', content:  messageText});

        //     self.messages.push({ role: 'assistant', content: `<br><div><iframe src="https://personalizedweather.onrender.com/" width="600" height="500"></iframe></div><br>`});

        //     self.saveMessages();
        //     this.scrollToBottom();
        //     return;
        // }

        if (self.selectedModel().indexOf("bison") !== -1) {
            self.userInput("");
            userInput.style.height = '30px';
            self.isPalmEnabled(true);
            self.isLoading(true);
            let messageContext;

            if (self.palmMessages.length === 0) {
                self.palmMessages.push({ content: messageText });
                self.messages.push({ role: "user", content: messageText });
                this.scrollToBottom();

                messageContext = self.palmMessages.slice(0);
            }
            else {
                self.messages.push({ role: "user", content: messageText });
                this.scrollToBottom();
                messageContext = self.palmMessages.slice(0);
                messageContext.push({ content: messageText });
            }

            const response = await fetchPalmResponse(messageContext);
            self.palmMessages.push({ content: response });
            self.messages.push({ role: "assistant", content: response });

            self.saveMessages();
            this.scrollToBottom();
            self.isLoading(false);
            return;
        }

        self.isPalmEnabled(false);

        if (!messageText || messageText === "" || self.isLoading() || self.isGeneratingImage()) {
            return;
        }

        const imagePrompt =  self.userInput().trim();

        if (imagePrompt.toLowerCase().startsWith("image::")) {
            self.messages.push({ role: 'user', content: imagePrompt })
            self.isGeneratingImage(true);
            this.scrollToBottom();

            self.userInput("");
            userInput.style.height = '30px';

            const response = await generateDALLEImage(imagePrompt.toLowerCase().split("image::")[1]);

            let imageURLStrings = `${imagePrompt.toLowerCase().split("image::")[1]} \n\n`;
            for (const image of response.data) {
                imageURLStrings += `![${imagePrompt.toLowerCase().split("image::")[1]}](${image.url}) \n`;
            }

            self.messages.push({ role: 'assistant', content: imageURLStrings });
            self.saveMessages();
            this.scrollToBottom();
            self.isGeneratingImage(false);
            return;
        }


        self.messages.push({ role: 'user', content: messageText });
        this.scrollToBottom();
        self.userInput('');

        // Reset the user input field
        userInput.value = '';
        userInput.style.height = '30px';
        

        self.streamedMessageText("");
        self.isLoading(true);

        try {
            const response = await fetchGPTResponseStream(self.messages(), self.sliderValue(), self.selectedModel());

            self.isLoading(false);
            self.messages.push({ role: 'assistant', content: response });

            self.saveMessages();
            this.scrollToBottom();
            hljs.highlightAll();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    self.saveMessages = async function () {
        const savedMessages = self.messages().map(message => ({
            role: message.role,
            content: message.content
        }));

        let conversationIndex = -1;

        if (self.selectedConversation()) {
            // Find the index of the selected conversation in storedConversations
            conversationIndex = self.storedConversations().findIndex(conversation => conversation.conversation.title === self.selectedConversation().title);
        }

        if (conversationIndex !== -1) {
            // Update the message history of the selected conversation
            self.storedConversations()[conversationIndex].conversation.messageHistory = savedMessages;
        } 
        else {
            if (JSON.parse(self.selectedAutoSaveOption())) {
                await this.saveNewConversations();
            }
        }

        // Save the updated conversations to localStorage
        localStorage.setItem("gpt-conversations", JSON.stringify(self.storedConversations()));
    };

    self.formatMessage = function (message, isStartup) {
        let md = window.markdownit(defaults);
        let renderedMessage = wrapCodeSnippets(md.render(message));
        return renderedMessage;
    };

    self.saveNewConversations = async function () {
        const newConversation = {
            messageHistory: self.messages().slice(0),
            title: self.isPalmEnabled() ? await fetchPalmConversationTitle(self.palmMessages.slice(0)) : await getConversationTitleFromGPT(self.messages().slice(0), self.selectedModel(), self.sliderValue())
        };

        newConversation.messageHistory = self.messages().slice(0);

        if (!localStorage.getItem("gpt-conversations")) {
            const newConversation = {
                messageHistory: self.messages().slice(0),
                title: self.isPalmEnabled() ? await fetchPalmConversationTitle(self.palmMessages.slice(0)) : await getConversationTitleFromGPT(self.messages().slice(0), self.selectedModel(), self.sliderValue())
            };

            localStorage.setItem("gpt-conversations", JSON.stringify([{ id: 0, conversation: newConversation }]));
            localStorage.setItem("lastConversationId", "0");
            self.lastLoadedConversationId(0);
        } else {
            let storedConversations = JSON.parse(localStorage.getItem("gpt-conversations"));

            newConversation.conversationId = storedConversations.length - 1;

            if (self.lastLoadedConversationId() !== null) {
                const conversationIndex = storedConversations.findIndex(conversation => { 
                    return conversation.id === parseInt(self.lastLoadedConversationId());
                });
                // Update the existing conversation's messageHistory with the new values
                storedConversations[conversationIndex].conversation.messageHistory = newConversation.messageHistory;
            } else {
                // If the conversation doesn't exist, add it to the stored conversations
                const newConversationWithTitle = {
                    messageHistory: self.messages().slice(0),
                    title: self.isPalmEnabled() ? await fetchPalmConversationTitle(self.palmMessages.slice(0)) : await getConversationTitleFromGPT(self.messages().slice(0), self.selectedModel(), self.sliderValue())
                };

                let highestId = 0;
                for (const conversation of storedConversations) {
                    if (conversation.id > highestId) {
                        highestId = conversation.id;
                    }
                }

                storedConversations[storedConversations.length] = { };
                storedConversations[storedConversations.length - 1].id = highestId + 1; 
                storedConversations[storedConversations.length - 1].conversation = newConversationWithTitle;
                self.lastLoadedConversationId(highestId + 1);
            }

            localStorage.setItem("gpt-conversations", JSON.stringify(storedConversations));
            localStorage.setItem("lastConversationId", self.lastLoadedConversationId());
        }

        self.conversations(loadConversationTitles());
        self.storedConversations(loadStoredConversations());

        self.selectedConversation(self.conversations()[self.conversations().length]);
        self.loadSelectedConversation();
    }

    self.copyText = function(content) {
        navigator.clipboard.writeText(content);
    }

    self.clearMessages = async function () {
        self.isProcessing(true);

        const newConversation = {
            messageHistory: self.messages().slice(0),
        };

        newConversation.messageHistory = self.messages().slice(0);

        if (!localStorage.getItem("gpt-conversations")) {
            const newConversation = {
                messageHistory: self.messages().slice(0),
                title: self.isPalmEnabled() ? await fetchPalmConversationTitle(self.palmMessages.slice(0)) : await getConversationTitleFromGPT(self.messages().slice(0), self.selectedModel(), self.sliderValue())
            };

            localStorage.setItem("gpt-conversations", JSON.stringify([{ id: 0, conversation: newConversation }]));
            localStorage.setItem("lastConversationId", "0");
            self.lastLoadedConversationId(0);
        } else {
            let storedConversations = JSON.parse(localStorage.getItem("gpt-conversations"));

            newConversation.conversationId = storedConversations.length - 1;

            if (self.selectedAutoSaveOption() && self.lastLoadedConversationId() !== null) {
                // Update the existing conversation's messageHistory with the new values

                const conversationIndex = storedConversations.findIndex(conversation => { 
                    return conversation.id === parseInt(self.lastLoadedConversationId());
                });

                storedConversations[conversationIndex].conversation.messageHistory = newConversation.messageHistory;
            } else {
                // If the conversation doesn't exist, add it to the stored conversations
                const newConversationWithTitle = {
                    messageHistory: self.messages().slice(0),
                    title: self.isPalmEnabled() ? await fetchPalmConversationTitle(self.palmMessages.slice(0)) : await getConversationTitleFromGPT(self.messages().slice(0), self.selectedModel(), self.sliderValue())
                };

                let highestId = 0;
                for (const conversation of storedConversations) {
                    if (conversation.id > highestId) {
                        highestId = conversation.id;
                    }
                }

                storedConversations[storedConversations.length] = { };
                storedConversations[storedConversations.length - 1].id = highestId + 1; 
                storedConversations[storedConversations.length - 1].conversation = newConversationWithTitle; 
            }

            localStorage.setItem("gpt-conversations", JSON.stringify(storedConversations));
            localStorage.setItem("lastConversationId", null);
        }

        self.conversations(loadConversationTitles());
        self.storedConversations(loadStoredConversations());

        localStorage.removeItem("gpt-messages");
        self.messages([]);
        self.lastLoadedConversationId(null);

        self.selectedConversation({ messageHistory: [], title: 'placeholder'});
        self.isProcessing(false);
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

        self.updateScrollButtonVisibility();
    };

    self.openFileSelector = function () {
        document.getElementById('fileUpload').click();
    }

    self.uploadFile = function (element, event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const contents = e.target.result;

                let isValid = false;

                try {
                    let parsedContents = JSON.parse(contents);

                    for (const conversationItem of parsedContents) {
                        if (conversationItem.id) {
                            isValid = true;
                        }
                    }
                }
                catch (err) { console.log("bad file detected"); }

                if (!isValid) {
                    return;
                }

                localStorage.setItem("gpt-conversations", contents);
                self.conversations(loadConversationTitles());
                self.storedConversations(loadStoredConversations());

                self.selectedConversation(self.conversations()[self.conversations().length]);
                self.loadSelectedConversation();

                self.showConversationOptions(true);

            };
            reader.readAsText(file);
        }
    }

    self.importConversationsClick = function () {
        self.openFileSelector();
    }

    self.exportConversationsClick = function () {
        self.downloadConversations("conversations.json", localStorage.getItem("gpt-conversations"))
    }

    self.downloadConversations = function(filename, text) {
        let element = document.createElement('a');

        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    if (self.conversations().length > 0) {

        if (localStorage.getItem("lastConversationId") !== "null") {
            self.lastLoadedConversationId(localStorage.getItem("lastConversationId"));
                
            const conversationIndex = self.conversations().findIndex(conversation => { 
                return conversation.id === parseInt(self.lastLoadedConversationId());
            });

            self.selectedConversation(self.conversations()[conversationIndex].conversation);
            self.loadSelectedConversation();
        }
        else {
            self.selectedConversation(self.conversations()[0].conversation);
            self.loadSelectedConversation();
        }
    }
}
