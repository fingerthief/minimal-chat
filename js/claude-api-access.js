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

export async function fetchClaudeVisionResponse(visionMessages, apiKey, model,) {
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
        return result.content[0].text;
    } else {
        return "I'm sorry, I couldn't generate a response.";
    }
}