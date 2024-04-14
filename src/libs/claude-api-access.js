import { showToast, sleep } from "./utils";

const numberOfRetryAttemptsAllowed = 5;

let retryClaudeCount = 0;
export async function fetchClaudeResponse(conversation, attitude, model) {

    let lastMessageContent = "";


    let messagesOnly = conversation.filter(message => {
        let isMessage = message.content.trim().toLowerCase().startsWith("image::") === false & lastMessageContent.startsWith("image::") === false;
        lastMessageContent = message.content.trim().toLowerCase();
        return isMessage;
    });

    let storedApiKey = localStorage.getItem("claudeKey");

    if (!localStorage.getItem("claude-attitude") || localStorage.getItem("claude-attitude") !== attitude) {
        localStorage.setItem("claude-attitude", attitude);
    }

    try {

        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent("https://api.anthropic.com/v1/messages")}`, {
            method: "POST",
            headers: {
                "x-api-key": storedApiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                max_tokens: 4096,
                stream: false,
                model: model,
                messages: messagesOnly,
                temperature: attitude * 0.01
            }),
        });

        const result = await response.json();

        if (result.content && result.content.length > 0) {
            return result.content[0].text;
        } else {
            return "I'm sorry, I couldn't generate a response.";
        }
    } catch (error) {

        if (retryClaudeCount < numberOfRetryAttemptsAllowed) {
            retryClaudeCount++;

            showToast(`Failed fetchClaudeResponse Request. Retrying...Attempt #${retryClaudeCount}`);

            await sleep(1000);

            console.log("Retry Number: " + retryClaudeCount);
            return await fetchClaudeResponse(conversation, attitude, model);
        }
        else {
            showToast(`Retry Attempts Failed for fetchClaudeResponse Request.`);
            console.error("Error fetching Claude response:", error);
            return "An error occurred while fetching Claude response.";
        }
    }
}

let claudeRetryTitleCount = 0;
export async function fetchClaudeConversationTitle(messages) {
    try {
        let storedApiKey = localStorage.getItem("claudeKey");

        let tempMessages = [...messages];
        tempMessages.push({ role: 'user', content: "Summarize our conversation in 5 words or less." });

        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent("https://api.anthropic.com/v1/messages")}`, {
            method: "POST",
            headers: {
                "x-api-key": storedApiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                max_tokens: 200,
                stream: false,
                model: "claude-3-haiku-20240307",
                messages: tempMessages,
                temperature: 0.1
            }),
        });

        const result = await response.json();

        claudeRetryTitleCount = 0;

        if (result.content && result.content.length > 0) {
            return result.content[0].text;
        } else {
            showToast("Error: Failed to generate conversation title");
            
            return "I'm sorry, I couldn't generate a response.";
        }
    } catch (error) {

        if (claudeRetryTitleCount < numberOfRetryAttemptsAllowed) {
            claudeRetryTitleCount++;
            console.log("Retry Number: " + claudeRetryTitleCount);

            showToast(`Failed fetchClaudeConversationTitle Request. Retrying...Attempt #${claudeRetryTitleCount}`);

            await sleep(1000);

            return await fetchClaudeConversationTitle(conversation, attitude, model);
        }
        else {
            showToast(`Retry Attempts Failed for fetchClaudeConversationTitle Request.`);
            console.error("Error fetching Claude response:", error);
            return "An error occurred while fetching Claude conversation title.";
        }
    }
}

let claudeVisionRetryCount = 0;
export async function fetchClaudeVisionResponse(visionMessages, apiKey, model,) {
    try {
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent("https://api.anthropic.com/v1/messages")}`, {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                max_tokens: 4096,
                stream: false,
                model: model,
                messages: [
                    {
                        role: "user",
                        content: visionMessages
                    }
                ],
                temperature: 0.5
            }),
        });
    
        const result = await response.json();
    
        if (result.content && result.content.length > 0) {
            claudeVisionRetryCount = 0;
            return result.content[0].text;
        } else {
            return "I'm sorry, I couldn't analyze the image. This usually is caused by uploading an image larger than 5MB in size.";
        }
    } catch (error) {
        if (claudeVisionRetryCount < numberOfRetryAttemptsAllowed) {

            claudeVisionRetryCount++;

            showToast(`Failed fetchClaudeVisionResponse Request. Retrying...Attempt #${claudeVisionRetryCount}`);

            await sleep(1000);

            console.log("Retry Number: " + claudeVisionRetryCount);
            return await fetchClaudeVisionResponse(visionMessages, apiKey, model);
        }
        else {
            showToast(`Retry Attempts Failed for fetchClaudeVisionResponse Request.`);

            console.error("Error fetching Claude response:", error);
            return "An error occurred while fetching Claude conversation title.";
        }
    }
}

let claudeStreamRetryCount = 0;
export async function streamClaudeResponse(messages, model, attitude, updateUIFunction) {
    try {
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent("https://api.anthropic.com/v1/messages")}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "anthropic-version": "2023-06-01",
                'X-API-Key': localStorage.getItem("claudeKey"),
            },
            body: JSON.stringify({
                messages: filterGPTMessages(messages),
                temperature: attitude * 0.01,
                max_tokens: 4096,
                model: model,
                stream: true
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        let result = '';
        let decodedResult = "";
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            result += chunk;

            // Process the streamed response chunk by chunk
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const data = line.slice(5).trim();
                    if (data === '[DONE]') {
                        return decodedResult;
                    }

                    const token = JSON.parse(data);

                    if (token?.delta?.text) {
                        claudeStreamRetryCount = 0;
                        decodedResult += token.delta.text;
                        updateUIFunction(token?.delta?.text, false);
                    }

                    if (token?.type === "message_stop") {
                        return decodedResult;
                    }
                }
            }
        }
    }
    catch (error) {
        if (claudeStreamRetryCount < numberOfRetryAttemptsAllowed) {
            claudeStreamRetryCount++;
            showToast("Error: An error occurred during the stream response. Retrying...");

            updateUIFunction("", true);

            console.log("Retry Number: " + claudeStreamRetryCount);

            showToast(`Failed streamClaudeResponse Request. Retrying...Attempt #${claudeStreamRetryCount}`);

            await sleep(1000);

            return await streamClaudeResponse(messages, model, attitude, updateUIFunction);
        }
        else {
            showToast(`Retry Attempts Failed for streamClaudeResponse Request.`);

            console.error("Error fetching Claude response:", error);
            return "An error occurred while fetching Claude conversation title.";
        }
    }
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