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
        { popover: { title: 'MinimalChat Tutorial', description: 'Welcome to MinimalChat! Please follow this quick guided tour of the application. It highlights very useful information, features and gesutres!' } },
        { element: '.settings-btn', popover: { title: 'Configuration Page', description: 'Dive into the configuration page and setup various LLM models and services!' } },
        { element: '#settings-dialog', popover: { title: 'Swiping to The Right', description: 'Quickly access the Configuration page by swiping to the right from the edge of the screen!', side: "top", align: 'start' } },
        { element: '#conversations-dialog', popover: { title: 'Swiping to The Left', description: 'Easily access the Conversations Management page by swiping left from the edge of the screen!', side: "top", align: 'start' } },
        { element: '#message-1', popover: { title: 'Editing Previous Messages', description: 'Double click any user message in the conversation to enter edit mode and regenerate the response!' } },
        { element: '.gpt .label', popover: { title: 'Quickly Copy Message Text', description: 'Tapping the label of any message will quickly copy the text to your clipboard.' } },
        { element: '.context-menu', popover: { title: 'Quick Actions Menu', description: 'Long press the messages list to open a quick actions menu for deleting or starting a new conversation.', side: "top", align: 'start' } },
        { element: '.image-button', popover: { title: 'Initiating Vision Requests', description: 'Initiating a Visions request is as simple as entering your prompt and choosing an image via the image upload button!' } },
        { element: '.upload-button', popover: { title: 'Upload File(s) to The Conversation Context', description: 'Easily add the contents of valid files (non images etc..) to the current conversations context.' } },
        { element: '.header-icon', popover: { title: 'Have an idea or issue?', description: 'Clicking the header icon will navigate you to the GitHub repo where you can submit issues or ideas as needed!' } },
        { popover: { title: 'Assimilation Complete!', description: 'And that\'s it, thanks for sticking around! Dive in and start using the application however you\'d like, happy chatting!' } }
    ];

    const desktopTutorialSteps = [
        { popover: { title: 'MinimalChat Walkthrough', description: 'Welcome to MinimalChat! Please follow this quick guided tour of the application. It highlights very useful information, features and gesutres!' } },
        { element: '.models-dropdown', popover: { title: 'Quick Change Models', description: 'While in the dekstop layout you can quickly switch what model is being used for requests.' } },
        { element: '.resize-container', popover: { title: 'Conversations Panel', description: 'This is the area that displays saved conversations and the actions for managing them.', side: "top", align: 'start' } },
        { element: '#conversation-0', popover: { title: 'Editing Conversation Titles', description: 'Double clicking a saved conversation will activate edit mode and allow you to change the conversation title.', side: "top", align: 'start' } },
        { element: '.settings-icon', popover: { title: 'Configuration Page', description: 'Dive into the configuration page and setup various LLM models and services!' } },
        { element: '#message-1', popover: { title: 'Editing Previous Messages', description: 'Double click any user message in the conversation to enter edit mode and regenerate the response!' } },
        { element: '.gpt .label', popover: { title: 'Quickly Copy Message Text', description: 'Tapping the label of any message will quickly copy the text to your clipboard.' } },
        { element: '.image-button', popover: { title: 'Initiating Vision Requests', description: 'Initiating a Visions request is as simple as entering your prompt and choosing an image via the image upload button!' } },
        { element: '.upload-button', popover: { title: 'Upload File(s) to The Conversation Context', description: 'Easily add the contents of valid files (non images etc..) to the current conversations context.' } },
        { element: '.header-icon', popover: { title: 'Have an idea or issue?', description: 'Clicking the header icon will navigate you to the GitHub repo where you can submit issues or ideas as needed!' } },
        { popover: { title: 'Assimilation Complete!', description: 'And that\'s it, thanks for sticking around! Dive in and start using the application however you\'d like, happy chatting!' } }
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