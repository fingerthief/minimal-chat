# [Try MinimalGPT](https://minimalgpt.app/)

**MinimalGPT** is an open-source GPT chat web app designed to be as self-contained as possible. All conversations are stored locally on the client's device, with the only information being sent to the server being API calls to GPT chat when the user sends a message and when a user saves a conversation to generate a conversation title.

> ⚠️ **Note**: You must input your OpenAI API Key for GPT-3.5 in order for this to function.

---

### Tip for iOS users

On iOS devices in Safari, you can add a web page to your home screen. If you do that, then MinimalGPT will run in "mobile web app" mode, essentially removing the usual browser controls and providing an iOS app-like experience.

## Features

- Minimal chat layout with Markdown and Code Syntax Highlighting support
- Customizable settings
- Responsive layout for mobile use

### Minimal chat layout with Markdown and Code Syntax Highlighting support

![MinimalGPT chat interface](https://user-images.githubusercontent.com/2380471/233864135-a43b7a61-a1b8-4b10-9d52-5de43b5a7660.jpeg)

### Settings

![MinimalGPT settings](https://user-images.githubusercontent.com/2380471/233864160-7ac4b3b6-c822-43c8-9d2e-62bc8494ce6a.jpeg)

### Responsive Layout for mobile use

![MinimalGPT mobile layout](https://user-images.githubusercontent.com/2380471/233864662-be954f53-a337-42f8-8e26-cfc969279096.png)

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
