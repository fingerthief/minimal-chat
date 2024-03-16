## [Try MinimalGPT/MinimalPaLM/MinimalClaude (Public Site)](https://minimalgpt.app/)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-4.3.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**MinimalChat** is an open-source LLM chat web app designed to be as self-contained as possible. All conversations are stored locally on the client's device, with the only information being sent to the server being API calls to GPT, PaLM or Claude (uses a CORS proxy) chat when the user sends a message and when a user saves a conversation to generate a conversation title.

---

## Self Host with Docker

- `docker pull tannermiddleton/minimal-chat:latest`

---

> ⚠️ **Note**: You must input your **OpenAI API** Key for GPT3 or GPT4 in order for **GPT** models to function.

> ⚠️ **Note**: You must input your **Google PaLM API** Key in order for the **PaLM** model to function.

> ⚠️ **Note**: You must input your **Anthropic Claude-3 API** Key in order for the **Claude** model to function.

## Obtaining API Keys

To use MinimalGPT with the various language models, you'll need to obtain API keys from their respective providers:

- **OpenAI (GPT-3, GPT-4)**: Sign up for an API key at [OpenAI's website](https://beta.openai.com/signup/).
- **Google PaLM**: Follow the instructions in the [Google PaLM API documentation](https://developers.generativeai.google/tutorials/setup) to set up your API key.
- **Anthropic Claude-3**: Request access to the Claude API by filling out the form on [Anthropic's website](https://www.anthropic.com/product).

Once you have your API keys, input them in the app's settings to start using the corresponding language models.

---

### Tip for mobile users

On iOS/Android devices in your browser, you can install supported web applications (called PWA or Progressive Web Applications) like native mobile apps to your devices homescreen. This means even though it is a website it is nearly indistinguishable from a normal iOS/Android application.

On iOS press the **Share** button in the browser and find the option that says **Add to Home Screen**. Pressing that will install the web application to your home screen.

![ios-add-to-home-small](https://user-images.githubusercontent.com/2380471/235267080-d69a2a46-50fa-4acf-b36b-da10b5d439d1.jpg)

On Android the process is basically the same except the name of the option is **Install App**

![android-install-web-app2](https://github.com/fingerthief/minimal-gpt/assets/2380471/cfd51a6a-5a03-4ff0-851a-c20c0565a89d)

## Table of Contents

- [Obtaining API Keys](#obtaining-api-keys)
- [Features](#features)
- [FAQ](#faq)
- [Mobile Swipe Gestures](#mobile-swipe-gestures)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Application Demo (PWA)](#applcation-demo-pwa)
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
A: No, MinimalGPT requires an internet connection to communicate with the language model APIs.

**Q: Are my conversations secure and private?**
A: Yes, all conversations are stored locally on your device and are not sent to any servers other than the necessary API calls to the language models.

**Q: Can I use MinimalGPT on my mobile device?**
A: Yes, MinimalGPT is designed be responsive and works well on mobile devices. You can even install it as a PWA for a native app-like experience.

## Features

- Minimal layout
- Models Supported
  - **GPT 3.5**
  - **GPT 4**
  - **GPT-4-Turbo**
  - **GPT-Vision** activated by having the **GPT-4 or GPT-Turbo** model selected and starting a message with **vision::** and then your prompt
  - **PaLM 2**
  - **Claude 3 Opus**
  - **Claude 3 Sonnet**
  - **Claude 3 Haiku**
  - **Claude Vision** activated by having the **Claude** model selected and starting a message with **vision::** and then your prompt
- Switch models mid conversations and maintain context
- Swipe Gestures for quick settings and conversations access
- Markdown Support
- Code Syntax Highlighting
- Basic **DALL-E 3** Integration (Prefix GPT model messages with **image::** and then your description to generate images)
- Conversation message search
- Conversation Importing/Exporting
- Customizable settings
- Responsive layout for mobile use
- Auto Save New Conversations Option
- PWA Support

### Mobile Swipe Gestures

- Swipe to the **Left** on the bottom input box and your **Conversations** dialog will appear.
- Swipe to the **Right** on the bottom input box and your **Settings** dialog will appear.

### Keyboard Shortcuts

- `Control + Shift + m` Opens the  conversations dialog
- `Control + Shift + s` Opens the settings dialog
- `Control + Shift + i` Starts a new conversation
- `Control + Shift + f` Activates search within the conversation

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

- [OpenAI API](https://openai.com/)
- [Google PaLM API](https://developers.generativeai.google/)
- [Anthropic Claude API](https://www.anthropic.com/)

## License

MinimalGPT is released under the [MIT License](https://opensource.org/licenses/MIT). See the `LICENSE` file for more information.

## Run Web App Locally

To run the web app locally, you'll need `NodeJS` installed so NPM is available. Then, navigate to the project directory in VSCode and run the following commands:

1. Install needed packages: `npm install`
2. Start local server: `npm run start-server` (terminal will output the IP and port the server is running on)
3. That's it! The app is now running locally.

### Compiling Your SCSS to CSS

- Run the command `npm run scss-build`

### Building/Bundling (WIP)

- Running `npm run build` will perform a dist build gulpfile process that incldues minification and cache busting (sort of) and output to the `public` folder.

## Applcation Demo (PWA)

[![Application Demo installed as a PWA](https://i9.ytimg.com/vi_webp/dxMAGbOohN0/mq2.webp?sqp=CJy1168G-oaymwEmCMACELQB8quKqQMa8AEB-AG-BIACgAqKAgwIABABGGMgTyhlMA8=&rs=AOn4CLAEING3jNuCeohMzvAHRMHnJqFKaA)](https://www.youtube.com/watch?v=dxMAGbOohN0)

### Settings

![Screenshot 2024-03-16 at 13-42-53 MinimalChat](https://github.com/fingerthief/minimal-chat/assets/2380471/e691b134-d1d7-4ead-9bdb-b20879c3d1fd)
