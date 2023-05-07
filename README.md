# [Try MinimalGPT](https://minimalgpt.app/)

**MinimalGPT** is an open-source GPT chat web app designed to be as self-contained as possible. All conversations are stored locally on the client's device, with the only information being sent to the server being API calls to GPT chat when the user sends a message and when a user saves a conversation to generate a conversation title.

> ⚠️ **Note**: You must input your OpenAI API Key for GPT3 or GPT4 in order for this to function.

---

### Tip for iOS users

On iOS devices in Safari, you can add a web page to your home screen. If you do that, then MinimalGPT will run in `mobile web app` mode, essentially removing the usual browser controls and providing an iOS app experience.

![ios-add-to-home-small](https://user-images.githubusercontent.com/2380471/235267080-d69a2a46-50fa-4acf-b36b-da10b5d439d1.jpg)

## Features

- Minimal chat layout with Markdown and Code Syntax Highlighting support
- Basic DALL-E Integration
- Conversation message search
- Customizable settings
- Responsive layout for mobile use

### Minimal chat layout

![Web capture_29-4-2023_19545_minimalgpt app](https://user-images.githubusercontent.com/2380471/235330441-1c17f182-1dfc-4e68-acb6-9f96ec9d031f.jpeg)

### Conversation search

![search](https://user-images.githubusercontent.com/2380471/235330608-4e7a799d-8968-4a0d-81bf-499f646e2ce4.png)

### DALL-E Integration

![Web capture_29-4-2023_195737_minimalgpt app](https://user-images.githubusercontent.com/2380471/235330549-ce91ba12-aa20-4284-8b91-b3391f88446a.jpeg)

### Settings

![Web capture_29-4-2023_195422_minimalgpt app](https://user-images.githubusercontent.com/2380471/235330449-fcb36cf3-13e3-44c6-a1c2-4b934e851efa.jpeg)

### [Responsive layout for mobile use (Click Here For Demo Video)](https://www.youtube.com/shorts/pUSd8ENeh0g)

![unnamed (1)](https://user-images.githubusercontent.com/2380471/235331432-ce06a826-e2f1-4ab6-8d16-284cdaa9427b.png)

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
