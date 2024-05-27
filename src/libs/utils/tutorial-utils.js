import { isSmallScreen, messages, conversations, selectedConversation, contextMenuOpened, selectedModel, systemPrompt } from "../state-management/state";
import { deleteCurrentConversation } from "../conversation-management/useConversations";
import { driver } from "driver.js";
import { nextTick, computed } from "vue";
import { saveSystemPrompt, systemPrompts } from "./settings-utils";

export async function runTutorialForSettings() {
    systemPrompt.value = "Respond like Dale Gribble";
    saveSystemPrompt('Respond like Dale Gribble');
    selectedModel.value = 'general-config'; // use the general section for walkthrough

    const settingsTutorialSteps = [
        {
            popover: {
                title: 'Settings Quick Guide',
                description: 'Welcome to The MinimalChat Configuration Page! Follow this short guided tour to learn about the configuration experience.'
            }
        },
        {
            element: '.right-panel',
            popover: {
                title: 'Mobile Gesture Support',
                description: '1.) Double tap anywhere in the configuration panel to quickly collapse and expand the model selection panel to the left. <br><br>2.) Swipe to the right from the edge of the screen to quickly close the settings page.',
                side: "top",
                align: 'center'
            }
        },
        {
            element: '.left-panel',
            popover: {
                title: 'Model Selection Panel',
                description: 'Quickly select different models. The configuration panel to the right will update with the appropriate items.',
                side: "right",
                align: 'start'
            }
        },
        {
            element: '.left-panel ul li:nth-child(2)',
            popover: {
                title: 'Model Groups',
                description: 'Models of the same provider are grouped together for better organization. Click on a group to expand or collapse it.',
                side: "right",
                align: 'start'
            }
        },
        {
            element: '.left-panel ul li:nth-child(1)',
            popover: {
                title: 'General Configuration Settings',
                description: 'The general configuration option houses settings and actions that are more MinimalChat specific.',
                side: "right",
                align: 'start'
            }
        },
        {
            element: '.right-panel',
            popover: {
                title: 'Configuration Section',
                description: 'This section displays the configuration options for the selected model. Adjust settings like API keys, temperature, max tokens, and more.',
                side: "left",
                align: 'start'
            }
        },
        {
            element: '.system-prompt-container',
            popover: {
                title: 'System Prompt',
                description: 'Enter a system prompt if you desire. This prompt will be used by the model to guide its responses.',
                side: "left",
                align: 'start'
            }
        },
        {
            element: '.saved-system-prompts',
            popover: {
                title: 'Saved System Prompts',
                description: 'View and manage your saved system prompts here. Click on a prompt to select it, or click the trash icon to delete it.',
                side: "left",
                align: 'start'
            }
        },
        {
            element: '.control-checkbox',
            popover: {
                title: 'Higher Contrast Messages',
                description: 'Enable or disable higher contrast messages for more distinction between messages. This results in a more classic message bubble design.',
                side: "left",
                align: 'start'
            }
        },
        {
            element: '.config-section',
            popover: {
                title: 'Import/Export Configuration',
                description: 'Manage your settings by exporting them to a JSON file for backup or importing settings from a JSON file.',
                side: "left",
                align: 'start'
            }
        },
        {
            popover: {
                title: 'Walkthrough Finished!',
                description: 'Thanks for following the walkthrough!'
            }
        }
    ];



    const hasShownUserSettingsTutorial = JSON.parse(localStorage.getItem('hasShownUserSettingsTutorial') || false);

    nextTick(async () => {
        if (!hasShownUserSettingsTutorial) {
            nextTick(async () => {
                const driverObj = driver({
                    popoverClass: 'driverjs-theme',
                    allowClose: true,
                    stageRadius: 18,
                    showProgress: true,
                    overlayOpacity: 0.75,
                    steps: settingsTutorialSteps,
                    onDestroyStarted: () => {
                        driverObj.destroy();

                        systemPrompt.value = "";
                        systemPrompts.value = "";
                        localStorage.setItem('system-prompts', "");
                    },
                });
                driverObj.drive();
                localStorage.setItem('hasShownUserSettingsTutorial', true);
            });
        }
    });
}

export async function runTutortialForNewUser() {
    const hasShownUserTutorial = JSON.parse(localStorage.getItem('hasShownUserTutorial') || false);

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
                    allowClose: true,
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