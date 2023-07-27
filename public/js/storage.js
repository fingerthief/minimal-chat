const apiKey = document.getElementById('api-key');
apiKey.value = localStorage.getItem("gptKey");

export async function fetchGPTResponse(conversation, attitude, model) {
    const prompt = `Me: ${conversation}\nAI:`;
    let storedApiKey = localStorage.getItem("gptKey");

    // if (storedApiKey !== apiKey.value.trim()) {
    //     localStorage.setItem("gptKey", apiKey.value.trim());
    //     storedApiKey = apiKey.value.trim();
    // }

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
            return result.choices[0].message.content;
        } else {
            return "I'm sorry, I couldn't generate a response.";
        }
    } catch (error) {
        console.error("Error fetching GPT response:", error);
        return "An error occurred while fetching GPT response.";
    }
}

export async function generateDALLEImage(conversation) {
    let storedApiKey = localStorage.getItem("gptKey");

    // if (storedApiKey !== apiKey.value.trim()) {
    //     localStorage.setItem("gptKey", apiKey.value.trim());
    //     storedApiKey = apiKey.value.trim();
    // }

    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${storedApiKey || 'Missing API Key'}`,
            },
            body: JSON.stringify({
                prompt: conversation,
                n: 8,
                size: "256x256",
            }),
        });

        const result = await response.json();

        if (result.data && result.data.length > 0) {
            return result;
        } else {
            return "I'm sorry, I couldn't generate an image. The prompt may not be allowed by the API.";
        }
    } catch (error) {
        console.error("Error fetching DALL-E response:", error);
        return "An error generating DALL-E image.";
    }
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
    // for (const message of parsedConversations) {
    //     for (const messageItem of message.messageHistory) {
    //         try {
    //             if (containsUrl(messageItem.content)) {
    //                 let urlMessage = extractHttpsUrls(messageItem.content);

    //                 let badLinkCount = 0;
    //              //   let replacements = [];
    //                 for (const url of urlMessage) {
    //                     let response = await fetch(url);
    //                     if (!response.ok) {
    //                         badLinkCount++;
    //                        // replacements.push({ original: url, replacement: ' **[Image Link Expired]** ' });
    //                     }
    //                 }

    //                 if (badLinkCount > 0) {
    //                     //for (const replacement of replacements) {
    //                     messageItem.content = ' **[DALL-E Generated Image(s) Have Expired]** ';
    //                    // }
    //                 }
    //             }
    //         }
    //         catch (error) {
    //             // console.error(`Error processing URL: ${error}`);
    //             continue;
    //         }
    //     }
    // }

    return parsedConversations.length ? parsedConversations[parsedConversations.length - 1].messageHistory : [];

}

export function loadConversationTitles() {
    const storedConversations = localStorage.getItem('gpt-conversations');
    let parsedConversations = storedConversations ? JSON.parse(storedConversations) : [];
    return parsedConversations;
}

export function loadStoredConversations() {
    hljs.highlightAll();
    const storedConversations = localStorage.getItem("gpt-conversations");
    return storedConversations ? JSON.parse(storedConversations) : [];
}