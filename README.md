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

![Web capture_27-4-2023_205811_minimalgpt app](https://user-images.githubusercontent.com/2380471/235036383-9eea2a81-0832-476a-aaff-6cd1bcbb4799.jpeg)

### Settings

![Web capture_27-4-2023_20593_minimalgpt app](https://user-images.githubusercontent.com/2380471/235036412-b736fb7e-cbf4-4684-8bca-8293b9ae3761.jpeg)

### Responsive Layout for mobile use

![2023-04-27 20_58_37-NVIDIA GeForce Overlay DT](https://user-images.githubusercontent.com/2380471/235036430-5842a4ff-1d9f-434f-820e-db6fc7a9e900.png)

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
