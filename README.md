# [**MinimalChat: A Simple and Customizable LLM Chat App**](https://minimalgpt.app)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-5.1.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fminimalgpt.app)
![GitHub repo size](https://img.shields.io/github/repo-size/fingerthief/minimal-chat)
![Docker Image Size](https://img.shields.io/docker/image-size/tannermiddleton/minimal-chat)
![GitHub top language](https://img.shields.io/github/languages/top/fingerthief/minimal-chat)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/fingerthief/minimal-chat/firebase-hosting-merge.yml)
![GitHub Repo stars](https://img.shields.io/github/stars/fingerthief/minimal-chat)

## Self Host with Docker

- `docker pull tannermiddleton/minimal-chat:latest`

---

## **What is MinimalChat?**

MinimalChat is a lightweight, open-source chat app that allows you to interact with various language models, including GPT-3.5-Turbo, GPT-4, and more. With its minimalistic design and customizable settings, MinimalChat provides a seamless and intuitive chat experience.

### General Demo

![326288101-4ece60a2-fa31-45f9-8c0a-7c7a5b84c864](https://github.com/fingerthief/minimal-chat/assets/2380471/11eb3d52-b3e9-41f2-b7c3-967e43560da7)

### Demo Vision Support (Claude, GPT, and Custom Models)

![326293416-a6f75498-4590-4782-af49-22935d0464b8](https://github.com/fingerthief/minimal-chat/assets/2380471/980a3b5b-2ce2-44be-a8cc-232f5915dc57)

### Mobile Version and Regenerating Responses Demo

![326301714-31c12768-403a-4cf7-a558-ca1be305c485](https://github.com/fingerthief/minimal-chat/assets/2380471/34adbe33-0a6a-4b68-b653-376d23ed708e)

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
