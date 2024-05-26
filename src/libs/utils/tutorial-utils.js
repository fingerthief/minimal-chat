import { messages, conversations, selectedConversation, contextMenuOpened } from "../state-management/state";
import { deleteCurrentConversation } from "../conversation-management/useConversations";
import { driver } from "driver.js";
import { nextTick, computed } from "vue";

export async function runTutortialForNewUser() {
    const hasShownUserTutorial = JSON.parse(localStorage.getItem('hasShownUserTutorial') || false);

    const isSmallScreen = computed(() => window.innerWidth <= 600);

    // Watch for window resize events to update the computed property
    window.addEventListener('resize', () => {
        isSmallScreen.value = window.innerWidth <= 600;
    });

    const mobileTutorialSteps = [
        { popover: { title: 'MinimalChat Tutorial', description: 'Welcome to MinimalChat! Follow this quick guided tour to learn about the app. It highlights useful information, features, and gestures!' } },
        { element: '.settings-btn', popover: { title: 'Configuration Page', description: 'Visit the configuration page to set up various LLM models and services!' } },
        { element: '#settings-dialog', popover: { title: 'Swipe Right', description: 'Access the Configuration page quickly by swiping right from the edge of the screen!', side: "top", align: 'start' } },
        { element: '#conversations-dialog', popover: { title: 'Swipe Left', description: 'Access the Conversations Management page quickly by swiping left from the edge of the screen!', side: "top", align: 'start' } },
        { element: '#message-0', popover: { title: 'Edit Previous Messages', description: 'Double-click any user message in the conversation to enter edit mode and regenerate the response!' } },
        { element: '.gpt .label', popover: { title: 'Copy Message Text', description: 'Tap the label of any message to quickly copy the text to your clipboard.' } },
        { element: '.context-menu', popover: { title: 'Quick Actions Menu', description: 'Long press the messages list to open a quick actions menu for deleting or starting a new conversation.', side: "top", align: 'start' } },
        { element: '.image-button', popover: { title: 'Initiate Vision Requests', description: 'Start a Vision request by entering your prompt and choosing an image via the upload button!' } },
        { element: '.upload-button', popover: { title: 'Upload Files', description: 'Easily add the contents of valid files (non-images, etc.) to the current conversation context.' } },
        { element: '.header-icon', popover: { title: 'Have an Idea or Issue?', description: 'Click the header icon to navigate to the GitHub repo where you can submit issues or ideas!' } },
        { popover: { title: 'Tutorial Complete!', description: 'Thanks for following the tutorial! Dive in and start using the app however you like. Happy chatting!' } }
    ];

    const desktopTutorialSteps = [
        { popover: { title: 'MinimalChat Walkthrough', description: 'Welcome to MinimalChat! Follow this quick guided tour to learn about the app. It highlights useful information, features, and gestures!' } },
        { element: '#quick-select-model-selector', popover: { title: 'Quickly Change Models', description: 'In the desktop layout, you can quickly switch the model being used for requests.' } },
        { element: '.sidebar-conversations', popover: { title: 'Conversations Panel', description: 'This area displays saved conversations and actions for managing them.', side: "top", align: 'start' } },
        { element: '#conversation-0', popover: { title: 'Edit Conversation Titles', description: 'Double-click a saved conversation to activate edit mode and change the conversation title.', side: "top", align: 'start' } },
        { element: '.settings-icon', popover: { title: 'Configuration Page', description: 'Visit the configuration page to set up various LLM models and services!' } },
        { element: '#message-0', popover: { title: 'Edit Previous Messages', description: 'Double-click any user message in the conversation to enter edit mode and regenerate the response!' } },
        { element: '.gpt .label', popover: { title: 'Copy Message Text', description: 'Tap the label of any message to quickly copy the text to your clipboard.' } },
        { element: '.image-button', popover: { title: 'Initiate Vision Requests', description: 'Start a Vision request by entering your prompt and choosing an image via the upload button!' } },
        { element: '.upload-button', popover: { title: 'Upload Files', description: 'Easily add the contents of valid files (non-images, etc.) to the current conversation context.' } },
        { element: '.header-icon', popover: { title: 'Have an Idea or Issue?', description: 'Click the header icon to navigate to the GitHub repo where you can submit issues or ideas!' } },
        { popover: { title: 'Tutorial Complete!', description: 'Thanks for following the tutorial! Dive in and start using the app however you like. Happy chatting!' } }
    ];

    // Add a temporary placeholder conversation item
    const placeholderConversation = {
        id: '0',
        title: 'Example Conversation',
        messageHistory: [
            { id: 0, role: 'user', content: 'This is an example saved conversation item.' },
            { id: 1, role: 'assistant', content: 'Feel free to explore and add your own conversations.' }
        ]
    };

    nextTick(async () => {
        if (!hasShownUserTutorial) {
            const event = new Event('show-context-menu');
            window.dispatchEvent(event);

            await nextTick(() => {
                const driverObj = driver({
                    popoverClass: 'driverjs-theme',
                    allowClose: false,
                    stageRadius: 18,
                    showProgress: true,
                    overlayOpacity: 0.75,
                    steps: isSmallScreen.value === true ? mobileTutorialSteps : desktopTutorialSteps,
                    onDestroyStarted: () => {
                        driverObj.destroy();

                        deleteCurrentConversation();

                        contextMenuOpened.value = false;
                    },

                });

                messages.value = placeholderConversation.messageHistory;
                conversations.value.push(placeholderConversation);
                selectedConversation.value = placeholderConversation;

                driverObj.drive();

                localStorage.setItem('hasShownUserTutorial', true);
            });
        }
    });
}