let retryClaudeCount = 0;
export async function fetchClaudeResponse(conversation, attitude, model) {

    let lastMessageContent = "";
    let indexAfterMessages = [];


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

        if (retryClaudeCount < 0) {
            retryClaudeCount++;
            console.log("Retry Number: " + retryClaudeCount);
            return await fetchClaudeResponse(conversation, attitude, model);
        }
        else {
            console.error("Error fetching Claude response:", error);
            return "An error occurred while fetching Claude response stream.";
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
                model: "claude-3-opus-20240229",
                messages: tempMessages,
                temperature: 0.1
            }),
        });

        const result = await response.json();

        claudeRetryTitleCount = 0;

        if (result.content && result.content.length > 0) {
            return result.content[0].text;
        } else {
            return "I'm sorry, I couldn't generate a response.";
        }
    } catch (error) {

        if (claudeRetryTitleCount < 3) {
            claudeRetryTitleCount++;
            console.log("Retry Number: " + claudeRetryTitleCount);
            return await fetchClaudeConversationTitle(conversation, attitude, model);
        }
        else {
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
        if (claudeVisionRetryCount < 3) {

            claudeVisionRetryCount++;

            console.log("Retry Number: " + claudeVisionRetryCount);
            return await fetchClaudeVisionResponse(visionMessages, apiKey, model);
        }
        else {
            console.error("Error fetching Claude response:", error);
            return "An error occurred while fetching Claude conversation title.";
        }
    }
}

export async function streamClaudeResponse(messages, model, attitude, updateUIFunction) {
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent("https://api.anthropic.com/v1/messages")}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "anthropic-version": "2023-06-01",
            'X-API-Key': localStorage.getItem("claudeKey"),
        },
        body: JSON.stringify({
            messages: messages,
            temperature: attitude * 0.01,
            max_tokens: 4096,
            model: model,
            stream: true,
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
                    decodedResult += token.delta.text;
                    updateUIFunction(token?.delta?.text);
                }

                if (token?.type === "message_stop") {
                    return decodedResult;
                }
            }
        }
    }
}