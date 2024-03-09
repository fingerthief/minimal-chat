# [Try MinimalGPT/MinimalPaLM/MinimalClaude](https://minimalgpt.app/)

<p><img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status">
<img src="https://img.shields.io/badge/version-4.1.0-blue" alt="Version">
<img src="https://img.shields.io/badge/license-MIT-green" alt="License"></p>

**MinimalGPT** is an open-source LLM chat web app designed to be as self-contained as possible. All conversations are stored locally on the client's device, with the only information being sent to the server being API calls to GPT, PaLM or Claude chat when the user sends a message and when a user saves a conversation to generate a conversation title.

> ⚠️ **Note**: You must input your **OpenAI API** Key for GPT3 or GPT4 in order for **GPT** models to function.

> ⚠️ **Note**: You must input your **Google PaLM API** Key in order for the **PaLM** model to function.

> ⚠️ **Note**: You must input your **Anthropic Claude-3 API** Key in order for the **Claude** model to function.

<h2>Obtaining API Keys</h2>
<p>To use MinimalGPT with the various language models, you’ll need to obtain API keys from their respective providers:</p>
<ul>
<li><strong>OpenAI (GPT-3, GPT-4)</strong>: Sign up for an API key at <a href="https://beta.openai.com/signup/">OpenAI’s website</a>.</li>
<li><strong>Google PaLM</strong>: Follow the instructions in the <a href="https://developers.generativeai.google/tutorials/setup">Google PaLM API documentation</a> to set up your API key.</li>
<li><strong>Anthropic Claude-3</strong>: Request access to the Claude API by filling out the form on <a href="https://www.anthropic.com/product">Anthropic’s website</a>.</li>
</ul>
<p>Once you have your API keys, input them in the app’s settings to start using the corresponding language models.</p>

---

### Tip for mobile users

On iOS/Android devices in your browser, you can install supported web applications (called PWA or Progressive Web Applications) like native mobile apps to your devices homescreen. This means even though it is a website it is nearly indistinguishable from a normal iOS/Android application.

On iOS press the **Share** button in the browser and find the option that says **Add to Home Screen**. Pressing that will install the web application to your home screen.

![ios-add-to-home-small](https://user-images.githubusercontent.com/2380471/235267080-d69a2a46-50fa-4acf-b36b-da10b5d439d1.jpg)

On Android the process is basically the same except the name of the option is **Install App**

![android-install-web-app2](https://github.com/fingerthief/minimal-gpt/assets/2380471/cfd51a6a-5a03-4ff0-851a-c20c0565a89d)

<h2>Table of Contents</h2>

<ul>
<li><a href="#features">Features</a></li>
<li><a href="#mobile-swipe-gestures">Mobile Swipe Gestures</a></li>
<li><a href="#keyboard-shortcuts">Keyboard Shortcuts</a></li>
<li><a href="#screenshots">Screenshots</a></li>
<li><a href="#run-web-app-locally">Run Web App Locally</a></li>
<li><a href="#obtaining-api-keys">Obtaining API Keys</a></li>
<li><a href="#contributing">Contributing</a></li>
<li><a href="#troubleshooting">Troubleshooting</a></li>
<li><a href="#future-plans">Future Plans</a></li>
<li><a href="#credits">Credits</a></li>
<li><a href="#license">License</a></li>
<li><a href="#faq">FAQ</a></li>
</ul>
<h2>Features</h2>
<ul>
<li>Minimal chat layout</li>
<li>Models Supported
<ul>
<li><strong>GPT 3.5</strong></li>
<li><strong>GPT 4</strong></li>
<li><strong>GPT-4-Turbo</strong></li>
<li><strong>GPT-Vision</strong> activated by having the <strong>GPT-4 or GPT-Turbo</strong> model selected and starting a message with <strong>vision::</strong> and then your prompt</li>
<li><strong>PaLM 2</strong></li>
<li><strong>Claude 3 Opus</strong></li>
<li><strong>Claude Vision</strong> activated by having the <strong>Claude</strong> model selected and starting a message with <strong>vision::</strong> and then your prompt</li>
</ul>
</li>
<li>Switch models mid conversations and maintain context</li>
<li>Swipe Gestures for quick settings and conversations access</li>
<li>Markdown Support</li>
<li>Code Syntax Highlighting</li>
<li>Basic <strong>DALL-E 3</strong> Integration (Prefix GPT model messages with <strong>image::</strong> and then your description to generate images)</li>
<li>Conversation message search</li>
<li>Conversation Importing/Exporting</li>
<li>Customizable settings</li>
<li>Responsive layout for mobile use</li>
<li>Auto Save New Conversations Option</li>
<li>PWA Support</li>
</ul>
<h3>Mobile Swipe Gestures</h3>
<ul>
<li>Swipe to the <strong>Left</strong> on the bottom input box and your <strong>Conversations</strong> dialog will appear.</li>
<li>Swipe to the <strong>Right</strong> on the bottom input box and your <strong>Settings</strong> dialog will appear.</li>
</ul>

### Mobile Swipe Gestures

- Swipe to the **Left** on the bottom input box and your **Conversations** dialog will appear.
- Swipe to the **Right** on the bottom input box and your **Settings** dialog will appear.

### Keyboard Shortcuts

- `Control + Shift + m` Opens the  conversations dialog
- `Control + Shift + s` Opens the settings dialog
- `Control + Shift + i` Starts a new conversation
- `Control + Shift + f` Activates search within the conversation

<h2>Contributing</h2>
<p>We welcome contributions from the community! If you’d like to contribute to MinimalGPT, please follow these guidelines:</p>
<ul>
<li>Submit bug reports and feature requests using the <a href="https://github.com/fingerthief/minimal-gpt/issues">issue tracker</a>.</li>
<li>For code contributions, fork the repository, make your changes, and submit a pull request.</li>
<li>Ensure that your code follows the project’s coding style and conventions.</li>
<li>Provide clear and concise commit messages and pull request descriptions.</li>
</ul>
<h2>Troubleshooting</h2>
<p>If you encounter any issues while using MinimalGPT, try the following:</p>
<ul>
<li>Make sure you have a stable internet connection.</li>
<li>Verify that your API keys are correct and have the necessary permissions.</li>
<li>Clear your browser cache and reload the app.</li>
<li>If the issue persists, please report it using the <a href="https://github.com/fingerthief/minimal-gpt/issues">issue tracker</a>.</li>
</ul>
<h2>Future Plans</h2>
<p>We have exciting plans for the future of MinimalGPT! Some of the features and improvements we’re working on include:</p>
<ul>
<li>Integration with additional language models and APIs.</li>
<li>Enhanced customization options for the user interface.</li>
<li>Improved mobile experience and PWA functionality.</li>
<li>Collaborative features for sharing and working on conversations with others.</li>
</ul>
<p>Stay tuned for updates and new releases!</p>
<h2>Credits</h2>
<p>MinimalGPT is made possible thanks to the following libraries, frameworks, and resources:</p>
<ul>
<li><a href="https://openai.com/">OpenAI API</a></li>
<li><a href="https://developers.generativeai.google/">Google PaLM API</a></li>
<li><a href="https://www.anthropic.com/">Anthropic Claude API</a></li>
</ul>
<h2>License</h2>
<p>MinimalGPT is released under the <a href="https://opensource.org/licenses/MIT">MIT License</a>. See the <code>LICENSE</code> file for more information.</p>

<h2>FAQ</h2>
<p><strong>Q: Is MinimalGPT free to use?</strong>
A: Yes, MinimalGPT is open-source and free to use. However, you’ll need to provide your own API keys for the language models you want to use.</p>
<p><strong>Q: Can I use MinimalGPT without an internet connection?</strong>
A: No, MinimalGPT requires an internet connection to communicate with the language model APIs.</p>
<p><strong>Q: Are my conversations secure and private?</strong>
A: Yes, all conversations are stored locally on your device and are not sent to any servers other than the necessary API calls to the language models.</p>
<p><strong>Q: Can I use MinimalGPT on my mobile device?</strong>
A: Yes, MinimalGPT is designed to be responsive and works well on mobile devices. You can even install it as a PWA for a native app-like experience.</p>

<h2>Run Web App Locally</h2>
<p>To run the web app locally, you’ll need <code>NodeJS</code> installed so NPM is available. Then, navigate to the project directory in VSCode and run the following commands:</p>
<ol>
<li>Install needed packages: <code>npm install</code></li>
<li>Start local server: <code>npm run start-server</code> (terminal will output the IP and port the server is running on)</li>
<li>That’s it! The app is now running locally.</li>
</ol>
<h3>Compiling Your SCSS to CSS</h3>
<ul>
<li>Run the command <code>npm run scss-build</code></li>
</ul>
<h3>Building/Bundling (WIP)</h3>
<ul>
<li>Running <code>npm run build</code> will perform a dist build gulpfile process that incldues minification and cache busting (sort of) and output to the <code>public</code> folder.</li>
</ul>

<h2>Screenshots</h2>
<h3>Minimal chat layout</h3>
<p><img src="https://github.com/fingerthief/minimal-gpt/assets/2380471/da778a1d-ee39-4488-926b-9f2c414e699f" alt="main"></p>
<h3>Local Conversation Saving and Conversation Importing/Exporting Via File</h3>
<p><img src="https://github.com/fingerthief/minimal-gpt/assets/2380471/20908247-806b-4f3b-b4fc-75e980735098" alt="convos"></p>
<h3>Conversation search</h3>
<p><img src="https://github.com/fingerthief/minimal-gpt/assets/2380471/98f23214-c2fc-4bbd-87c9-91c894934b0f" alt="Screenshot 2023-08-18 202911"></p>
<h3>Google PaLM 2 Model Support</h3>
<p><img src="https://github.com/fingerthief/minimal-gpt/assets/2380471/df224a22-8498-40be-9bb0-dce27f3ef2d1" alt="Screenshot 2023-08-18 202911"></p>
<h3>DALL-E Integration</h3>
<p><img src="https://github.com/fingerthief/minimal-gpt/assets/2380471/384e67f0-a9f1-4c64-9dab-8321492c763b" alt="Web capture_18-8-2023_203422_192 168 0 7"></p>
<h3>Settings</h3>
<p><img src="https://github.com/fingerthief/minimal-gpt/assets/2380471/f0147371-5096-40e7-a28d-8ac8d9294d2a" alt="Web capture_18-8-2023_20368_192 168 0 7"></p>

