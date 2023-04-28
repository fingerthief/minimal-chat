# [Try MinimalGPT](https://minimalgpt.app/)

**MinimalGPT** is an open-source GPT chat web app designed to be as self-contained as possible. All conversations are stored locally on the client's device, with the only information being sent to the server being API calls to GPT chat when the user sends a message and when a user saves a conversation to generate a conversation title.

> ⚠️ **Note**: You must input your OpenAI API Key for GPT-3.5 in order for this to function.

---

### Tip for iOS users

On iOS devices in Safari, you can add a web page to your home screen. If you do that, then MinimalGPT will run in `mobile web app` mode, essentially removing the usual browser controls and providing an iOS app experience.

![ios-add-to-home-small](https://user-images.githubusercontent.com/2380471/235267080-d69a2a46-50fa-4acf-b36b-da10b5d439d1.jpg)


## Features

- Minimal chat layout with Markdown and Code Syntax Highlighting support
- Customizable settings
- Responsive layout for mobile use

### Minimal chat layout with Markdown and Code Syntax Highlighting support

![Web capture_28-4-2023_17482_minimalgpt app](https://user-images.githubusercontent.com/2380471/235266294-6b7bb6a1-577a-4d9c-a607-d19eb6279ffe.jpeg)

### Settings

![Web capture_28-4-2023_174818_minimalgpt app](https://user-images.githubusercontent.com/2380471/235266309-1adba0aa-698c-4a6c-99b9-dec939e013ae.jpeg)

### Responsive Layout for mobile use

![2023-04-28 17_49_07-NVIDIA GeForce Overlay DT](https://user-images.githubusercontent.com/2380471/235266327-47441d95-95c1-416d-8e58-1193c073da52.png)

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
