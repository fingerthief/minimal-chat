# [Try MinimalGPT](https://minimalgpt.app/)

An open source GPT chat web app built to be as contained as possible. All conversations etc...are stored local to the client. The only information being sent anywhere is the API call to GPT chat when the user sends a message and when a user saves a conversation in order to generate a conversation title.
 
## Note: You must input your OpenAI API Key for GPT3(.5) in order for this to function.

### Tip - On iOS devices in safari you can add a web page to your home screen. If you do that then MinimalGPT will run in "mobile web app" mode, essentially removing the usual browser controls giving you an iOS app like experience. 

## Minimal chat layout with Markdown and Code Syntax Highlighting support.
![Web capture_23-4-2023_152049_minimalgpt web app](https://user-images.githubusercontent.com/2380471/233864135-a43b7a61-a1b8-4b10-9d52-5de43b5a7660.jpeg)


## Settings
![Web capture_23-4-2023_152154_minimalgpt web app](https://user-images.githubusercontent.com/2380471/233864160-7ac4b3b6-c822-43c8-9d2e-62bc8494ce6a.jpeg)


## Responsive Layout for mobile use
![mobile-resize](https://user-images.githubusercontent.com/2380471/233864662-be954f53-a337-42f8-8e26-cfc969279096.png)

# Running Web App Locally

You need `NodeJS` installed so NPM is available. Afterwards you can navigate to the project directory in VSCode and run the following commands:

- Install needed packages `npm install`
- Start Local Server: `npm run start-server` (terminal will output what IP and port the server is running on)
- Boom it's running

## Compiling Your SCSS to CSS

- Run the command `npm run scss-build`

## Building/Bundling (WIP)

- A basic gulpfile exists that copies the needed files for running the application into a folder named `public`. However there is no minifications etc..yet.
- Running `npm run build` will do what is described in the point before this.
