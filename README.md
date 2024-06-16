# [**MinimalChat: A Simple and Customizable LLM Chat Client**](https://minimalchat.app)

![Version](https://img.shields.io/badge/version-6.2.4-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fminimalchat.app)
![Repo Size](https://img.shields.io/github/repo-size/fingerthief/minimal-chat)
![Docker Image Size](https://img.shields.io/docker/image-size/tannermiddleton/minimal-chat)
![Top Language](https://img.shields.io/github/languages/top/fingerthief/minimal-chat)
![Stars](https://img.shields.io/github/stars/fingerthief/minimal-chat)

## What is MinimalChat?

MinimalChat is an open-source, lightweight chat application supporting multiple language models like GPT-4 Omni and various Local/Custom Model Endpoints. It is designed to be simple, fully featured, and highly responsive, with full mobile PWA support.

![App Mockup](https://github.com/fingerthief/minimal-chat/assets/2380471/46e9b2bc-abcc-44b5-9ff0-1019d5dc6bdf)

## Self-Hosting with Docker

```sh
docker pull tannermiddleton/minimal-chat:latest
```

## Application Demo

[Watch Higher Quality Video](https://www.youtube.com/watch?v=bO78W8MPWgE)

[Demo Video](https://github.com/fingerthief/minimal-chat/assets/2380471/e93141b7-1ee1-4dbf-a106-0d92897d899b)

## Experience the Power of Web Local LLM Models

Thanks to [Web LLM](https://github.com/mlc-ai/web-llm), you can now download and cache popular LLM models like `llama-3-8b-instruct` directly in your browser.

[More details in the Wiki](https://github.com/fingerthief/minimal-chat/wiki/Host-and-Run-Entire-LLM-Models-Directly-in-the-Browser-Locally)

## Getting Started

### Installation

1. Install packages: `npm install`
2. Build the app: `npm run build`
3. Start local server: `npm run preview`for Production mode or `npm run dev` for development mode.

### Configuration

[Visit the Wiki for detailed configuration options](https://github.com/fingerthief/minimal-chat/wiki/Configuration-Options-Explained)

## Features

- Minimal layout
- Voiced conversational interactions with STT and TTS
- Supports multiple language models:
  - GPT Model
  - Open AI Response Formatted APIs (custom/local)
  - Load and host full models locally in your own browser with WebLLM
- Switch models mid-conversation
- Swipe gestures for quick settings and conversation access
- Edit, regenerate, or delete past messages
- Markdown support
- Code syntax highlighting
- Basic DALL-E 3 integration
- Conversation importing/exporting
- Mobile responsive layout
- PWA support

## FAQs

### Is MinimalChat free?

Yes, MinimalChat is open-source and free. However, API keys are required for some language models.

### Can I use MinimalChat offline?

Yes, by using LM Studio to host a local LLM Model or by loading a full model into your browser.

### Are my conversations secure?

Yes, all conversations are stored locally on your device.

### Is MinimalChat mobile-compatible?

Yes, it is fully mobile-compatible and can be installed as a PWA.

## Mobile Swipe Gestures

- Swipe left on the input box to open **Conversations**.
- Swipe right on the input box to open **Settings**.
- Double tap the settings page to expand/collapse the side panel.

## Integration with Open AI Response Formatted APIs

Supports any API endpoint returning responses formatted according to OpenAI's specifications.

[More information in the Wiki](https://github.com/fingerthief/minimal-chat/wiki/Open-AI-Formatted-Response-APIs)

## Contributing

We welcome contributions! Please:

- Submit issues via the [issue tracker](https://github.com/fingerthief/minimal-chat/issues)
- Fork the repository, make changes, and submit a pull request
- Follow coding style and conventions
- Provide clear commit messages and pull request descriptions

## Troubleshooting

- Ensure a stable internet connection
- Verify API keys and permissions
- Clear browser cache as a last resort

Report issues via the [issue tracker](https://github.com/fingerthief/minimal-chat/issues)

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contact

For questions, feedback, or suggestions:

- [GitHub Issues](https://github.com/fingerthief/minimal-chat/issues)
- Discord: `fingerthief#0453`

---

**Thank you for using MinimalChat!**
