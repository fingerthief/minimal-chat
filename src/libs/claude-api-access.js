import { showToast, sleep } from "./utils";

const numberOfRetryAttemptsAllowed = 5;

let retryClaudeCount = 0;
export async function fetchClaudeResponse(conversation, attitude, model) {
    let filteredMessages = filterGPTMessages(conversation);

    let filteredMessagesWithoutSystemPrompt = filteredMessages.slice(1);

    let tempMessages = filteredMessagesWithoutSystemPrompt.map(message => ({
        role: message.role,
        content: message.content
    }))

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
                system: filteredMessages[0].content,
                stream: false,
                model: model,
                messages: tempMessages,
                temperature: attitude * 0.01,
                max_tokens: parseInt(localStorage.getItem("maxTokens")) || 4096,
                top_p: parseFloat(localStorage.getItem("top_P") || 1.0)
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

        let filteredMessages = filterGPTMessages(messages);

        let filteredMessagesWithoutSystemPrompt = filteredMessages.slice(1);

        let tempMessages = filteredMessagesWithoutSystemPrompt.map(message => ({
            role: message.role,
            content: message.content
        }))

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

            return await fetchClaudeConversationTitle(messages);
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

        let filteredMessages = filterGPTMessages(visionMessages);
        let tempMessages = filteredMessages.map(message => ({
            role: message.role,
            content: message.content
        }));

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
                        content: tempMessages
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

export async function streamClaudeResponse(messages, model, attitude, updateUIFunction, abortController, streamedMessageText, autoScrollToBottom = true) {
    try {
        let filteredMessages = filterGPTMessages(messages);

        let filteredMessagesWithoutSystemPrompt = filteredMessages.slice(1);

        let tempMessages = filteredMessagesWithoutSystemPrompt.map(message => ({
            role: message.role,
            content: message.content
        }));

        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent("https://api.anthropic.com/v1/messages")}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "anthropic-version": "2023-06-01",
                'X-API-Key': localStorage.getItem("claudeKey"),
            },
            body: JSON.stringify({
                system: filteredMessages[0].content,
                messages: tempMessages,
                temperature: attitude * 0.01,
                model: model,
                stream: true,
                max_tokens: 4096,
                top_p: parseFloat(localStorage.getItem("top_P") || 1.0)
            }),
            signal: abortController.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        let result = '';
        let decodedResult = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            result += chunk;

            // Efficiently process the streamed response chunk by chunk
            const lines = result.split('\n');
            result = lines.pop(); // Keep incomplete line for next chunk processing

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const data = line.slice(5).trim();
                    if (data === '[DONE]') {
                        return decodedResult;
                    }

                    try {
                        const token = JSON.parse(data);

                        if (token?.delta?.text) {
                            decodedResult += token.delta.text;
                            updateUIFunction(token.delta.text, autoScrollToBottom);
                        }

                        if (token?.type === "message_stop") {
                            return decodedResult;
                        }
                    } catch (parseError) {
                        console.error("JSON parsing error:", parseError);
                        continue;
                    }
                }
            }
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            showToast(`Stream Request Aborted.`);
            return streamedMessageText.value;
        }

        console.error("Error fetching Claude Model response:", error);
        showToast(`Stream Request Failed.`);
        return streamedMessageText.value;
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