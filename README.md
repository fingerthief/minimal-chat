# [**MinimalChat: A Simple and Customizable LLM Chat App (public site link)**](https://minimalchat.app)

![Version](https://img.shields.io/badge/version-6.1.5-blue)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/fingerthief/minimal-chat/firebase-hosting-merge.yml)
![License](https://img.shields.io/badge/license-MIT-green)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fminimalchat.app)
![GitHub repo size](https://img.shields.io/github/repo-size/fingerthief/minimal-chat)
![Docker Image Size](https://img.shields.io/docker/image-size/tannermiddleton/minimal-chat)
![GitHub top language](https://img.shields.io/github/languages/top/fingerthief/minimal-chat)
![GitHub Repo stars](https://img.shields.io/github/stars/fingerthief/minimal-chat)

## **What is MinimalChat?**

MinimalChat is a minimal and lightweight open-source chat application with full mobile PWA support that allows you to interact with various language models, including GPT-4, Claude Opus, various Local/Custom Model Endpoints. A focus on being simple to setup and use while being fully featured and very responsive is always the top priority.

![cropped_mockup](https://github.com/fingerthief/minimal-chat/assets/2380471/1e80c15a-c805-43d3-80e3-46eacbc29913)

## Self Host with Docker

- `docker pull tannermiddleton/minimal-chat:latest` - Enter the port number to run on and that is it!

---

### Application Demo

[Visit the Application Demos Wiki Page](https://github.com/fingerthief/minimal-chat/wiki/Application-Demos) for more demos.

https://github.com/fingerthief/minimal-chat/assets/2380471/51fde475-1b3f-4904-8c5a-48188e95ea31

## **Experience the Power of Web Local LLM Models**

A huge thank you to the innovative folks at [Web LLM](https://github.com/mlc-ai/web-llm) for making it possible to bring the magic of large language models (LLMs) directly to your browser!

With this integration, you can now seamlessly download and cache popular LLM models like `llama-3-8b-instruct` locally and run them entirely within your browser, without any hassle or reliance on external servers. This means you can enjoy greater control and unparalleled flexibility in how you choose to interact with models.

[More notes in the Wiki](https://github.com/fingerthief/minimal-chat/wiki/Host-and-Run-Entire-LLM-Models-Directly-in-the-Browser-Locally)

### Fast and Lightweight

![minimalchat-memory](https://github.com/fingerthief/minimal-chat/assets/2380471/432d77dc-78dd-469f-9844-71c770b59f06)

## **Getting Started**

### [Check Out the Wiki!](https://github.com/fingerthief/minimal-chat/wiki) for more detailed information

### Installation

To run the web app locally, you'll need NodeJS installed. Then, navigate to the project directory and run the following commands:

1. Install needed packages: `npm install`
2. Build the app `npm run build`
3. Start local server: `npm run preview` (terminal will output the IP and port the server is running on). Optionally you can run `npm run dev` to run the application in development mode.
4. That's it! The app is now running locally.

### Configuration

[Visit the Wiki for a detailed explanation of available configuration options.](https://github.com/fingerthief/minimal-chat/wiki/Configuration-Options-Explained)

## **Features**

- Minimal layout
- Supports multiple language models, including:
  - GPT Model
  - Claude 3 Models
  - Open AI Response Formatted APIs (custom/local) models
  - Local Browser Loaded Models
- Switch models mid-conversations and maintain context
- Swipe Gestures for quick settings and conversations access
- Edit, Regenerate or Delete past message responses
- Markdown Support
- Code Syntax Highlighting
- Basic DALL-E 3 Integration (Prefix GPT model messages with **image::** and then your description to generate images)
- Conversation Importing/Exporting
- Responsive layout for mobile use
- Progressive Web Application Support

## **FAQs**

### Is MinimalChat free to use?

Yes, MinimalChat is open-source and free to use. However, you'll need to provide your own API keys for the language models you want to use if they require one. Local models etc..would not require an API key and could be used freely.

### Can I use MinimalChat without an internet connection?

Yes! If you use LM Studio to locally host a LLM Model, you can connect and chat with any model that returns a response in the OpenAI Response format standard.

You can even load a full model into your browser directly and run interact with it all within MinimalChat. After the model is initially downloaded and cached the first time it can be used without an internet connection.

### Are my conversations secure and private?

Yes, all conversations are stored locally on your device and are not sent to any servers other than the necessary API calls to the language models.

### Can I use MinimalChat on my mobile device?

Yes, MinimalChat is designed to be fully mobile compatible. You can even install it as a PWA for a native app-like experience.

## **Mobile Swipe Gestures**

- Swipe to the **Left** on the bottom input box and your **Conversations** dialog will appear.
- Swipe to the **Right** on the bottom input box and your **Settings** dialog will appear.

## **Integration with Open AI Response Formatted APIs**

MinimalChat supports integration with any API endpoint that returns responses formatted according to OpenAI's specifications. This feature allows users to connect with a variety of language models hosted externally, providing flexibility and extending the capabilities of the app.

Get more information in the [Open AI API Format Wiki](https://github.com/fingerthief/minimal-chat/wiki/Open-AI-Formatted-Response-APIs)

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

## **License**

MinimalChat is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

## **Contact**

If you have any questions, feedback, or suggestions, feel free to reach out to us:

- [GitHub Issues](https://github.com/fingerthief/minimal-chat/issues)

- Add me on Discord for questions, ideas or issues Username: `fingerthief#0453`

---

**Thank you for using MinimalChat!**

_Buy me a coffee for some reason: ☕️ [![Buy Me a Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow-btn.png)](https://buymeacoffee.com/fingerthief) ☕️_
