# [Try MinimalGPT/MinimalPaLM](https://minimalgpt.app/)

**MinimalGPT** is an open-source GPT chat web app designed to be as self-contained as possible. All conversations are stored locally on the client's device, with the only information being sent to the server being API calls to GPT or PaLM chat when the user sends a message and when a user saves a conversation to generate a conversation title.

> ⚠️ **Note**: You must input your OpenAI API Key for GPT3 or GPT4 in order for GPT models to function.

> ⚠️ **Note**: You must input your Google PaLM API Key in order for the PaLM model to function.

---

### Tip for mobile users

On iOS/Android devices in your browser, you can install supported web applications (called PWA or Progressive Web Applications) like native mobile apps to your devices homescreen. This means even though it is a website it is nearly indistinguishable from a normal iOS/Android application.

On iOS press the **Share** button in the browser and find the option that says **Add to Home Screen**. Pressing that will install the web application to your home screen.

![ios-add-to-home-small](https://user-images.githubusercontent.com/2380471/235267080-d69a2a46-50fa-4acf-b36b-da10b5d439d1.jpg)

On Android the process is basically the same except the name of the option is **Install App**

![android-install-web-app2](https://github.com/fingerthief/minimal-gpt/assets/2380471/cfd51a6a-5a03-4ff0-851a-c20c0565a89d)

## Features

- Minimal chat layout
- OpenAI GPT 3.5 and GPT 4 Support
- Google PaLM 2 Support
- Switch models mid conversations and maintain context
- Swipe Gestures for quick settings and conversations access
- Markdown Support
- Code Syntax Highlighting
- Basic DALL-E Integration (Prefix GPT model messages with **image::** and then your description to generate images)
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

### Minimal chat layout

![Screenshot 2023-07-23 at 11-45-06 MinimalGPT](https://github.com/fingerthief/minimal-gpt/assets/2380471/f9ef7f23-2e20-4939-933b-855ae2e44502)

### Local Conversation Saving and Conversation Importing/Exporting Via File

![import-export](https://github.com/fingerthief/minimal-gpt/assets/2380471/12f78b86-512d-484a-91b2-21a50b0f455c)

### Conversation search

![Screenshot 2023-07-23 114733](https://github.com/fingerthief/minimal-gpt/assets/2380471/27b23efd-b93a-417c-b8a3-929378c49908)

### Google PaLM 2 Model Support

![palm_small](https://github.com/fingerthief/minimal-gpt/assets/2380471/55eaabac-7125-4266-9188-b357034c74e9)

### DALL-E Integration

![Screenshot 2023-07-23 115242](https://github.com/fingerthief/minimal-gpt/assets/2380471/4231d9aa-771a-481f-b3f3-b6e4b9879d8e)

### Settings

![settings](https://github.com/fingerthief/minimal-gpt/assets/2380471/aa55a67c-043a-442e-ac43-76022994f4d1)

## Run Web App Locally

To run the web app locally, you'll need `NodeJS` installed so NPM is available. Then, navigate to the project directory in VSCode and run the following commands:

1. Install needed packages: `npm install`
2. Start local server: `npm run start-server` (terminal will output the IP and port the server is running on)
3. That's it! The app is now running locally.

### Compiling Your SCSS to CSS

- Run the command `npm run scss-build`

### Building/Bundling (WIP)

- A basic Gulpfile exists that copies the necessary files for running the application into a folder named `public`. However, there is no minification yet.
- Running `npm run build` will perform the actions described in the point above.
