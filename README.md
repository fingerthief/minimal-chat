# [**MinimalChat: A Simple and Customizable LLM Chat App**](https://minimalgpt.app)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-5.1.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Self Host with Docker

- `docker pull tannermiddleton/minimal-chat:latest`

---

## **What is MinimalChat?**

MinimalChat is a lightweight, open-source chat app that allows you to interact with various language models, including GPT-3.5-Turbo, GPT-4, and more. With its minimalistic design and customizable settings, MinimalChat provides a seamless and intuitive chat experience.

### General Demo

[
![minimal-chat-demo-3](https://github.com/fingerthief/minimal-chat/assets/2380471/dd4ecd26-e1fa-4e4f-91c8-1aa54db73305)](https://github.com/fingerthief/minimal-chat/wiki/General-Demo)

### Demo Vision Support (Claude, GPT, and Custom Models)

[![minimal-chat-vision-demo](https://github.com/fingerthief/minimal-chat/assets/2380471/eb02141d-752d-48b4-9aab-24f227eb197a)](https://github.com/fingerthief/minimal-chat/wiki/Demo-Vision-Support)

### Demo DAll-E Image Generation (gpt-4-turbo only currently)

![minimal-chat-image-generation-demo](https://private-user-images.githubusercontent.com/2380471/326187674-28e2f894-f92f-4e4e-a6f8-a87939020fa1.gif?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MTQyMzE2MTMsIm5iZiI6MTcxNDIzMTMxMywicGF0aCI6Ii8yMzgwNDcxLzMyNjE4NzY3NC0yOGUyZjg5NC1mOTJmLTRlNGUtYTZmOC1hODc5MzkwMjBmYTEuZ2lmP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI0MDQyNyUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNDA0MjdUMTUyMTUzWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9OTg4NjVjNzYxNzJlOGQzNDk2N2FiNTFhZmJkYmQxMjZjZmQ0MWQ4YmY0NzNkMTVjZmYyMTFlMDRhODc3ZWYxNCZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmYWN0b3JfaWQ9MCZrZXlfaWQ9MCZyZXBvX2lkPTAifQ.2209dbj3MrYmnm7Rt8DvuSwpyrCLdYf47DLJriaDPUI)

## **Getting Started**

### Check Out the Wiki! (WIP)

#### [Take me to the Wiki](https://github.com/fingerthief/minimal-chat/wiki)

### Installation

To run the web app locally, you'll need NodeJS installed. Then, navigate to the project directory and run the following commands:

1. Install needed packages: `npm install`
2. Start local server: `npm run dev` (terminal will output the IP and port the server is running on)
3. That's it! The app is now running locally.

### Configuration

To integrate an external API, follow these steps in the settings panel of MinimalChat:

1. **Model Name**: Enter the identifier for the language model you wish to use.
2. **API Endpoint**: Specify the URL where the API is hosted.
3. **API Key**: Enter the API key provided by the service hosting the model.
4. **Max Tokens**: Define the maximum number of tokens that can be generated in a response. This is input token + potential output tokens.

## **Features**

- Minimal layout
- Supports multiple language models, including:
  - GPT Model
  - Claude 3 Models
  - Open AI Response Formatted APIs (custom/local) models
- Switch models mid-conversations and maintain context
- Swipe Gestures for quick settings and conversations access
- Markdown Support
- Code Syntax Highlighting
- Basic DALL-E 3 Integration (Prefix GPT model messages with **image::** and then your description to generate images)
- Conversation Importing/Exporting
- Customizable settings
- Responsive layout for mobile use
- Auto Save New Conversations Option
- PWA Support

## **FAQs**

### Is MinimalChat free to use?

Yes, MinimalChat is open-source and free to use. However, you'll need to provide your own API keys for the language models you want to use.

### Can I use MinimalChat without an internet connection?

Yes! If you use LM Studio to locally host a LLM Model, you can connect and chat with any model that returns a response in the OpenAI Response format standard.

### Are my conversations secure and private?

Yes, all conversations are stored locally on your device and are not sent to any servers other than the necessary API calls to the language models.

### Can I use MinimalChat on my mobile device?

Yes, MinimalChat is designed to be responsive and works well on mobile devices. You can even install it as a PWA for a native app-like experience.

## **Mobile Swipe Gestures**

- Swipe to the **Left** on the bottom input box and your **Conversations** dialog will appear.
- Swipe to the **Right** on the bottom input box and your **Settings** dialog will appear.

## **Integration with Open AI Response Formatted APIs**

MinimalChat supports integration with any API endpoint that returns responses formatted according to OpenAI's specifications. This feature allows users to connect with a variety of language models hosted externally, providing flexibility and extending the capabilities of the app.

## **Benefits of Using Open AI Formatted APIs**

- Flexibility: Connect with a wide range of models from different providers that adhere to OpenAI's response format.
- Customization: Tailor the chat experience by selecting models that best fit the needs of your conversations or application.
- Scalability: Easily switch between different models or update API settings to enhance capabilities as new models become available.

## **Contributing**

We welcome contributions from the community! If you'd like to contribute to MinimalChat, please follow these guidelines:

- Submit bug reports and feature requests using the [issue tracker](https://github.com/fingerthief/minimal-chat/issues).
- For code contributions, fork the repository, make your changes, and submit a pull request.
- Ensure that your code follows the project's coding style and conventions.
- Provide clear and concise commit messages and pull request descriptions.

## **Troubleshooting**

If you encounter any issues while using MinimalChat, try the following:

- Make sure you have a stable internet connection.
- Verify that your API keys are correct and have the necessary permissions.
- As a **LAST STEP** Clear your browser cache and reload the app.
  - This also clears all of your saved configured settings. You should never really need to do this, but weirder things have happened.
- If the issue persists, please report it using the [issue tracker](https://github.com/fingerthief/minimal-chat/issues).

## **Future Plans**

We have exciting plans for the future of MinimalChat! Some of the features and improvements we're working on include:

- Integration with additional language models and APIs.
- Enhanced customization options for the user interface.
- Improved mobile experience

## **License**

MinimalChat is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

## **Contact**

If you have any questions, feedback, or suggestions, feel free to reach out to us:

- [GitHub Issues](https://github.com/fingerthief/minimal-chat/issues)

---

**Thank you for using MinimalChat!**

_Buy me a coffee for some reason: ☕️ [![Buy Me a Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow-btn.png)](https://buymeacoffee.com/fingerthief) ☕️_
