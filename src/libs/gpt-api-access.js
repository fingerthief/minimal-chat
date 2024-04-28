import { showToast, sleep, parseOpenAiFormatResponseChunk } from "./utils";

const MAX_RETRY_ATTEMPTS = 5;
let gptResponseRetryCount = 0;
let gptVisionRetryCount = 0;
let dalleRetryCount = 0;
let gptStreamRetryCount = 0;
export async function fetchGPTResponse(conversation, attitude, model) {
    const apiKey = localStorage.getItem("gptKey");
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey || 'Missing API Key'}`,
            },
            body: JSON.stringify({
                model,
                messages: conversation,
                temperature: attitude * 0.01,
            }),
        });

        const result = await response.json();
        gptResponseRetryCount = 0;

        if (result.choices && result.choices.length > 0) {
            return result.choices[0].message.content;
        } else {
            return "Error parsing fetchGPTResponse response object.";
        }
    } catch (error) {
        if (gptResponseRetryCount < MAX_RETRY_ATTEMPTS) {
            gptResponseRetryCount++;
            showToast(`Failed fetchGPTResponse Request. Retrying...Attempt #${gptResponseRetryCount}`);
            await sleep(1000);
            return await fetchGPTResponse(conversation, attitude, model);
        } else {
            showToast(`Retry Attempts Failed for fetchGPTResponse Request.`);
            return "An error occurred while fetching GPT response.";
        }
    }
}

export async function fetchGPTVisionResponse(visionMessages, apiKey) {
    const payload = {
        model: "gpt-4-turbo",
        messages: [
            {
                role: "user",
                content: visionMessages,
            },
        ],
        max_tokens: 4096,
    };

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        gptVisionRetryCount = 0;

        return data.choices[0].message.content;
    } catch (error) {
        if (gptVisionRetryCount < MAX_RETRY_ATTEMPTS) {
            gptVisionRetryCount++;
            showToast(`Failed fetchGPTVisionResponse Request. Retrying...Attempt #${gptVisionRetryCount}`);
            await sleep(1000);
            return fetchGPTVisionResponse(visionMessages, apiKey);
        } else {
            showToast(`Retry Attempts Failed for fetchGPTVisionResponse Request.`);
            return "Error generating GPT Vision response.";
        }
    }
}

export async function generateDALLEImage(conversation) {
    const apiKey = localStorage.getItem("gptKey");

    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            model: "dall-e-3",
            quality: "hd",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey || 'Missing API Key'}`,
            },
            body: JSON.stringify({
                prompt: conversation,
                n: parseInt(localStorage.getItem("selectedDallEImageCount")) || 2,
                size: localStorage.getItem("selectedDallEImageResolution") || "256x256",
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
        if (dalleRetryCount < MAX_RETRY_ATTEMPTS) {
            dalleRetryCount++;
            showToast(`Failed generateDALLEImage Request. Retrying...Attempt #${dalleRetryCount}`);
            await sleep(1000);
            return await generateDALLEImage(conversation);
        } else {
            showToast(`Retry Attempts Failed for generateDALLEImage Request.`);
            console.error("Error fetching DALL-E response:", error);
            return "An error generating DALL-E image.";
        }
    }
}

export async function fetchGPTResponseStream(conversation, attitude, model, updateUiFunction, abortController, streamedMessageText, autoScrollToBottom = true) {
    const gptMessagesOnly = filterGPTMessages(conversation);

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("gptKey")}`,
        },
        body: JSON.stringify({
            model,
            stream: true,
            messages: gptMessagesOnly,
            temperature: attitude * 0.01,
        }),
        signal: abortController.signal
    };
    let result

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", requestOptions);

        result = await readResponseStream(response, updateUiFunction, autoScrollToBottom);

        gptStreamRetryCount = 0;
        return result;
    }
    catch (error) {
        if (error.name === 'AbortError') {
            showToast(`Stream Request Aborted.`);
            return streamedMessageText.value;
        }

        console.error("Error fetching GPT response:", error);
        showToast(`Stream Request Failed.`);
        return streamedMessageText.value;
    }
}

async function readResponseStream(response, updateUiFunction, autoScrollToBottom = true) {
    const reader = await response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let decodedResult = "";

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            return decodedResult;
        }
        const chunk = decoder.decode(value);
        const parsedLines = parseOpenAiFormatResponseChunk(chunk);
        for (const parsedLine of parsedLines) {
            const { choices } = parsedLine;
            const { delta } = choices[0];
            const { content } = delta;
            if (content) {
                decodedResult += content;
                updateUiFunction(content, autoScrollToBottom);
            }
        }
    }
}

function filterGPTMessages(conversation) {
    let lastMessageContent = "";
    return conversation.filter((message) => {
        const isGPT = !message.content.trim().toLowerCase().startsWith("image::") && !lastMessageContent.startsWith("image::");
        lastMessageContent = message.content.trim().toLowerCase();
        return isGPT;
    });
}

export async function loadMessagesFromLocalStorage() {
    const storedMessages = localStorage.getItem("gpt-conversations");
    let parsedConversations = storedMessages ? JSON.parse(storedMessages) : [];
    return parsedConversations.length ? parsedConversations[parsedConversations.length - 1].messageHistory : [];
}

export function loadConversationTitles() {
    const storedConversations = localStorage.getItem("gpt-conversations");
    let parsedConversations = storedConversations ? JSON.parse(storedConversations) : [];
    return parsedConversations;
}

export function loadStoredConversations() {
    const storedConversations = localStorage.getItem("gpt-conversations");
    return storedConversations ? JSON.parse(storedConversations) : [];
}