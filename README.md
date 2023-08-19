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
- `Control + Shift + f` Activates search within the conversation

### Minimal chat layout

![main](https://github.com/fingerthief/minimal-gpt/assets/2380471/da778a1d-ee39-4488-926b-9f2c414e699f)

### Local Conversation Saving and Conversation Importing/Exporting Via File

![convos](https://github.com/fingerthief/minimal-gpt/assets/2380471/20908247-806b-4f3b-b4fc-75e980735098)

### Conversation search

![Screenshot 2023-08-18 202911](https://github.com/fingerthief/minimal-gpt/assets/2380471/98f23214-c2fc-4bbd-87c9-91c894934b0f)

### Google PaLM 2 Model Support

![Screenshot 2023-08-18 202911](https://github.com/fingerthief/minimal-gpt/assets/2380471/df224a22-8498-40be-9bb0-dce27f3ef2d1)

### DALL-E Integration

![Web capture_18-8-2023_203422_192 168 0 7](https://github.com/fingerthief/minimal-gpt/assets/2380471/384e67f0-a9f1-4c64-9dab-8321492c763b)

### Settings

![Web capture_18-8-2023_20368_192 168 0 7](https://github.com/fingerthief/minimal-gpt/assets/2380471/f0147371-5096-40e7-a28d-8ac8d9294d2a)

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
