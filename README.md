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

![Web capture_23-4-2023_221755_minimalgpt app](https://user-images.githubusercontent.com/2380471/233892872-97083462-2105-489e-81a4-765bc8047ff8.jpeg)

### Settings

![Web capture_23-4-2023_221812_minimalgpt app](https://user-images.githubusercontent.com/2380471/233892954-a4a20d61-8a86-43e9-a319-a19daa4dfeab.jpeg)


### Responsive Layout for mobile use

![mobile_ui](https://user-images.githubusercontent.com/2380471/233892985-29b330da-6094-4a97-90b0-4cf906cd8302.png)

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
