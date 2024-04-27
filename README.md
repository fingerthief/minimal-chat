## [Try MinimalGPT/MinimalClaude/MinimalCustom (Public Site)](https://minimalgpt.app/)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-5.0.8-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**MinimalChat** is an open-source LLM chat web app designed to be as self-contained as possible. All conversations are stored locally on the client's device, with the only information being sent to the server being API calls to GPT or Claude (uses a CORS proxy) chat when the user sends a message and when a user saves a conversation to generate a conversation title.

---

## Self Host with Docker

- `docker pull tannermiddleton/minimal-chat:latest`

---

## Check Out the Wiki! (WIP)

### [Take me to the Wiki](https://github.com/fingerthief/minimal-chat/wiki)

---

<br>

> ⚠️ **Note**: You must input your **OpenAI API** Key for GPT3 or GPT4 in order for **GPT** models to function.

> ⚠️ **Note**: You must input your **Anthropic Claude-3 API** Key in order for the **Claude** model to function.

## Obtaining API Keys

To use MinimalGPT with the various language models, you'll need to obtain API keys from their respective providers:

- **OpenAI (GPT-3, GPT-4)**: Sign up for an API key at [OpenAI website](https://beta.openai.com/signup/).
- **Anthropic Claude-3**: Request access to the Claude API by filling out the form on [Anthropic's website](https://www.anthropic.com/product).
- **Hugging Face**: Sign up for an API key at [Hugging Face website](https://huggingface.co/docs/api-inference/en/quicktour#get-your-api-token).

Once you have your API keys, input them in the app's settings to start using the corresponding language models.

---

## Mobile Installation

On iOS/Android devices in your browser, you can install supported web applications (called PWA or Progressive Web Applications) like native mobile apps to your devices homescreen. This means even though it is a website it is nearly indistinguishable from a normal iOS/Android application.

On iOS press the **Share** button in the browser and find the option that says **Add to Home Screen**. Pressing that will install the web application to your home screen.

Install MinimalChat on your mobile device for a seamless app-like experience:

- **iOS**: Tap the **Share** button in Safari and select **Add to Home Screen**.
- **Android**: Tap **Install App** in your browser menu.

![iOS Installation](https://user-images.githubusercontent.com/2380471/235267080-d69a2a46-50fa-4acf-b36b-da10b5d439d1.jpg)
![Android Installation](https://github.com/fingerthief/minimal-gpt/assets/2380471/cfd51a6a-5a03-4ff0-851a-c20c0565a89d)

## Table of Contents

- [Obtaining API Keys](#obtaining-api-keys)
- [Features](#features)
- [FAQ](#faq)
- [Integration with Open AI Response Formatted APIs](#integration-with-open-ai-response-formatted-apis)
- [Mobile Swipe Gestures](#mobile-swipe-gestures)
- [Application Demo](#application-demo)
- [Run Web App Locally](#run-web-app-locally)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Future](#future-plans)
- [Credits](#credits)
- [License](#license)

## FAQ

**Q: Is MinimalGPT free to use?**
A: Yes, MinimalGPT is open-source and free to use. However, you'll need to provide your own API keys for the language models you want to use.

**Q: Can I use MinimalGPT without an internet connection?**
A: Yes! If you use [LM Studio](https://lmstudio.ai/) to locally host a LLM Model you can connect and chat with any model supported within [LM Studio](https://lmstudio.ai/)

**Q: Are my conversations secure and private?**
A: Yes, all conversations are stored locally on your device and are not sent to any servers other than the necessary API calls to the language models.

**Q: Can I use MinimalGPT on my mobile device?**
A: Yes, MinimalGPT is designed be responsive and works well on mobile devices. You can even install it as a PWA for a native app-like experience.

## Features

- Minimal layout
- Models Supported

  - **GPT 3.5-Turbo**
  - **GPT 4**
  - **GPT-4-Turbo**
  - **GPT-Vision**
  - **Claude 3 Models**
  - **Open AI Response Formatted APIs** - Supports any API Endpoint that returns Open AI formatted responses
    - **Vision** requests supported so long as the model you're using has **vision** support

- Switch models mid conversations and maintain context
- Swipe Gestures for quick settings and conversations access
- Markdown Support
- Code Syntax Highlighting
- Basic **DALL-E 3** Integration (Prefix GPT model messages with **image::** and then your description to generate images)
- Conversation Importing/Exporting
- Customizable settings
- Responsive layout for mobile use
- Auto Save New Conversations Option
- PWA Support

## Application Demo

![minimal-chat-demo-2](https://github.com/fingerthief/minimal-chat/assets/2380471/872e7aa3-db14-4001-93fb-5ea1829896d9)

## Mobile Swipe Gestures

- Swipe to the **Left** on the bottom input box and your **Conversations** dialog will appear.
- Swipe to the **Right** on the bottom input box and your **Settings** dialog will appear.

## Integration with Open AI Response Formatted APIs

MinimalChat supports integration with any API endpoint that returns responses formatted according to OpenAI's specifications. This feature allows users to connect with a variety of language models hosted externally, providing flexibility and extending the capabilities of the app.

## Configuring API Endpoints in MinimalChat

To integrate an external API, follow these steps in the settings panel of MinimalChat:

1. **Model Name**: Enter the identifier for the language model you wish to use. This is typically a specific name or value that uniquely identifies the model on the hosting service.

   - **Example**: If using [LM Studio](https://lmstudio.ai/), configuring the DeepSeek Coder Model hosted on Hugging Face, with the model name `LoneStriker/deepseek-coder-7b-instruct-v1.5-GGUF`. This name should be entered into the **Model** field. Details for this model can be found [here](https://huggingface.co/LoneStriker/deepseek-coder-7b-instruct-v1.5-GGUF).

2. **API Endpoint**: Specify the URL where the API is hosted. This URL is the endpoint to which MinimalChat will send requests to generate responses from the model.

   - **Example**: If using [LM Studio](https://lmstudio.ai/), the API endpoint might be something like `http://192.168.0.45:1234`.

3. **API Key**: Some APIs require an authentication key to access. Enter the API key provided by the service hosting the model.

   - **Example**: For [LM Studio](https://lmstudio.ai/), the required API key would be `lm-studio`.

4. **Max Tokens**: Define the maximum number of tokens that can be generated in a response. This setting helps manage the length of responses based on the model’s capabilities and the context window size.
   - **Note**: The default setting typically allows for about half of the model's maximum token limit, though this can be adjusted based on specific needs or model restrictions.

## Benefits of Using Open AI Formatted APIs

- **Flexibility**: Connect with a wide range of models from different providers that adhere to OpenAI's response format.
- **Customization**: Tailor the chat experience by selecting models that best fit the needs of your conversations or application.
- **Scalability**: Easily switch between different models or update API settings to enhance capabilities as new models become available.

This integration feature empowers users to expand the functionality of MinimalChat beyond the built-in models, leveraging the vast landscape of AI language models available in the market.

## Contributing

We welcome contributions from the community! If you'd like to contribute to MinimalGPT, please follow these guidelines:

- Submit bug reports and feature requests using the [issue tracker](https://github.com/fingerthief/minimal-gpt/issues).
- For code contributions, fork the repository, make your changes, and submit a pull request.
- Ensure that your code follows the project's coding style and conventions.
- Provide clear and concise commit messages and pull request descriptions.

## Troubleshooting

If you encounter any issues while using MinimalGPT, try the following:

- Make sure you have a stable internet connection.
- Verify that your API keys are correct and have the necessary permissions.
- Clear your browser cache and reload the app.
- If the issue persists, please report it using the [issue tracker](https://github.com/fingerthief/minimal-gpt/issues). Future Plans

## Future Plans

We have exciting plans for the future of MinimalGPT! Some of the features and improvements we're working on include:

- Integration with additional language models and APIs.
- Enhanced customization options for the user interface.
- Improved mobile experience and PWA functionality.
- Collaborative features for sharing and working on conversations with others.

Stay tuned for updates and new releases!

## Credits

MinimalGPT is made possible thanks to the following libraries, frameworks, and resources:

- **[OpenAI API](https://openai.com/)**
- **[Anthropic Claude API](https://www.anthropic.com/)**
- **[LM Studio](https://lmstudio.ai/)**
- **[Hugging Face](https://huggingface.co/)**

## License

MinimalGPT is released under the [MIT License](https://opensource.org/licenses/MIT). See the `LICENSE` file for more information.

## Run Web App Locally

To run the web app locally, you'll need `NodeJS` installed so NPM is available. Then, navigate to the project directory in VSCode and run the following commands:

1. Install needed packages: `npm install`
2. Start local server: `npm run dev` (terminal will output the IP and port the server is running on)
3. That's it! The app is now running locally.

Also `npm run build` will output a dist folder with minified files etc...`npm run preview` will run a local server using the dist build as a base,

### Compiling Your SCSS to CSS

- Vue handles this with a recompiles during hot reloads.

### Building/Bundling (WIP)

- Running `npm run build` will perform a dist build process that incldues minification and cache busting (sort of) and output to the `dist` folder.
