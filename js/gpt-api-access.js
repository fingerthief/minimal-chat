import { showToast } from "../js/utils.js";

const apiKey = document.getElementById('api-key');
apiKey.value = localStorage.getItem("gptKey");

const numberOfRetryAttemptsAllowed = 5;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let gptResponseRetryCount = 0;
export async function fetchGPTResponse(conversation, attitude, model) {
    const prompt = `Me: ${conversation}\nAI:`;
    let storedApiKey = localStorage.getItem("gptKey");

    if (!localStorage.getItem("gpt-attitude") || localStorage.getItem("gpt-attitude") !== attitude) {
        localStorage.setItem("gpt-attitude", attitude);
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${storedApiKey || 'Missing API Key'}`,
            },
            body: JSON.stringify({
                model: model,
                messages: conversation,
                temperature: attitude * 0.01
            }),
        });

        const result = await response.json();

        if (result.choices && result.choices.length > 0) {
            gptResponseRetryCount = 0;
            return result.choices[0].message.content;
        } else {
            return "Error parsing fetchGPTResponse response object.";
        }
    } catch (error) {
        if (gptResponseRetryCount < numberOfRetryAttemptsAllowed) {
            gptResponseRetryCount++;

            showToast(`Failed fetchGPTResponse Request. Retrying...Attempt #${gptResponseRetryCount}`);

            await sleep(1000);

            return await fetchGPTResponse(conversation, attitude, model);
        }

        showToast(`Retry Attempts Failed for fetchGPTResponse Request.`);

        return "An error occurred while fetching GPT response.";
    }
}

let gptVisionRetryCount = 0;
export async function fetchGPTVisionResponse(visionMessages, apiKey) {
    const payload = {
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: visionMessages
            }
        ],
        max_tokens: 4096
    };

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });
    
        const data = await response.json();

        gptVisionRetryCount = 0;
    
        return data.choices[0].message.content;
    }
    catch (error) {

        if (gptVisionRetryCount < numberOfRetryAttemptsAllowed) {
            gptVisionRetryCount++;

            showToast(`Failed fetchGPTVisionResponse Request. Retrying...Attempt #${dalleRetryCount}`);

            await sleep(1000);

            return fetchGPTVisionResponse(visionMessages, apiKey);
        }

        showToast(`Retry Attempts Failed for fetchGPTVisionResponse Request.`);
        return "Error generating GPT Vision response."
    }

}

let dalleRetryCount = 0;
export async function generateDALLEImage(conversation) {
    let storedApiKey = localStorage.getItem("gptKey");

    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            model: "dall-e-3",
            quality: "hd",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${storedApiKey || 'Missing API Key'}`,
            },
            body: JSON.stringify({
                prompt: conversation,
                n: parseInt(localStorage.getItem("selectedImageCountOption")) || 4,
                size: localStorage.getItem("selectedImageResolutionOption") || "256x256",
            }),
        });

        const result = await response.json();

        if (result.data && result.data.length > 0) {
            dalleRetryCount = 0;
            return result;
        } else {
            return "I'm sorry, I couldn't generate an image. The prompt may not be allowed by the API.";
        }
    } catch (error) {
        if (dalleRetryCount < numberOfRetryAttemptsAllowed) {
            dalleRetryCount++;

            showToast(`Failed generateDALLEImage Request. Retrying...Attempt #${dalleRetryCount}`);

            await sleep(1000);

            return await generateDALLEImage(conversation);
        }

        showToast(`Retry Attempts Failed for generateDALLEImage Request.`);
        console.error("Error fetching DALL-E response:", error);
        return "An error generating DALL-E image.";
    }
}


let gptStreamRetryCount = 0;
export async function fetchGPTResponseStream(conversation, attitude, model, updateUiFunction) {
    const gptMessagesOnly = filterGPTMessages(conversation);

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("gptKey")}`,
        },
        body: JSON.stringify({
            model: model,
            stream: true,
            messages: gptMessagesOnly,
            temperature: attitude * 0.01
        }),
    };

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", requestOptions);

        const result = await readResponseStream(response, updateUiFunction);
        
        gptStreamRetryCount = 0;
        return result;
    } catch (error) {
        console.error("Error fetching GPT response:", error);
        return retryFetchGPTResponseStream(conversation, attitude, model, updateUiFunction);
    }
}

async function readResponseStream(response, updateUiFunction) {
    let decodedResult = "";

    const reader = await response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            return decodedResult
        };
        const chunk = decoder.decode(value);
        const parsedLines = parseResponseChunk(chunk);
        for (const parsedLine of parsedLines) {
            const { choices } = parsedLine;
            const { delta } = choices[0];
            const { content } = delta;
            if (content) {
                decodedResult += content;
                updateUiFunction(content);
            }
        }
    }
}

async function retryFetchGPTResponseStream(conversation, attitude, model, updateUiFunction) {
    if (gptStreamRetryCount < numberOfRetryAttemptsAllowed) {
        console.log("Retry Number: " + (gptStreamRetryCount + 1));

        updateUiFunction("", true);

        showToast(`Failed fetchGPTResponseStream Request. Retrying...Attempt #${gptStreamRetryCount}`);

        await sleep(1000);

        return await fetchGPTResponseStream(conversation, attitude, model);
    }

    showToast(`Retry Attempts Failed for fetchGPTResponseStream Request.`);

    return "An error occurred while fetching GPT response stream.";
}

function parseResponseChunk(chunk) {
    const lines = chunk.split("\n");
    return lines
        .map((line) => line.replace(/^data: /, "").trim())
        .filter((line) => line !== "" && line !== "[DONE]")
        .map((line) => JSON.parse(line));
}

function filterGPTMessages(conversation) {
    let lastMessageContent = "";
    return conversation.filter(message => {
        const isGPT = !message.content.trim().toLowerCase().startsWith("image::") &&
            !lastMessageContent.startsWith("image::");
        lastMessageContent = message.content.trim().toLowerCase();
        return isGPT;
    });
}

function containsUrl(str) {
    const urlPattern = /https?:\/\/(?:www\.)?[^\s]+\.[^\s]+/i;
    return urlPattern.test(str);
}

function extractHttpsUrls(str) {
    const urlPattern = /https:\/\/(?:www\.)?[^\s]+\.[^\s]+/ig;
    const matches = [...str.matchAll(urlPattern)];
    return matches.map(match => match[0]);
}

export async function loadMessagesFromLocalStorage() {
    const storedMessages = localStorage.getItem("gpt-conversations");
    let parsedConversations = storedMessages ? JSON.parse(storedMessages) : [];
    return parsedConversations.length ? parsedConversations[parsedConversations.length - 1].messageHistory : [];

}

export function loadConversationTitles() {
    const storedConversations = localStorage.getItem('gpt-conversations');
    let parsedConversations = storedConversations ? JSON.parse(storedConversations) : [];
    return parsedConversations;
}

export function loadStoredConversations() {
    const storedConversations = localStorage.getItem("gpt-conversations");
    return storedConversations ? JSON.parse(storedConversations) : [];
}