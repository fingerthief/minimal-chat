import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function removeAPIEndpoints(url) {
    if (typeof url !== 'string') {
        showToast("URL must be a string");
        throw new Error('Input URL must be a string');
    }

    // Remove API endpoints and any trailing "/"
    return url.replace(/\/v1(?:\/chat(?:\/completions)?)?/g, '').replace(/\/$/, '');
}

let retryCount = 0;
export async function getConversationTitleFromGPT(messages, model, sliderValue) {
    try {
        const apiKey = document.getElementById('api-key');
        apiKey.value = localStorage.getItem("gptKey");

        let tempMessages = messages.map(message => ({
            role: message.role,
            content: message.content
        }));
        tempMessages.push({ role: 'user', content: "Summarize our conversation in 5 words or less." });
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.value.trim() || 'Missing API Key'}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: tempMessages,
                temperature: sliderValue * 0.01
            }),
        });

        const result = await response.json();

        if (result.choices && result.choices.length > 0) {
            retryCount = 0;
            return result.choices[0].message.content;
        } else {
            throw "I'm sorry, I couldn't generate a response.";
        }
    } catch (error) {

        if (retryCount < 5) {
            retryCount++;
            return getConversationTitleFromGPT(messages, model, sliderValue);
        }

        console.error("Error fetching GPT response:", error);
        return "An error occurred while generating conversaton title.";
    }
}

let buffer = "";
export function parseOpenAiFormatResponseChunk(chunk) {
    if (typeof chunk !== 'string') {
        throw new Error('Input chunk must be a string');
    }

    buffer += chunk;
    const lines = buffer.split('\n');

    const completeLines = lines.slice(0, -1);
    buffer = lines[lines.length - 1];

    const results = [];
    for (const line of completeLines) {
        let cleanedLine = line.trim();

        if (cleanedLine.includes('[DONE]')) {
            cleanedLine = cleanedLine.replace('[DONE]', '').trim();
        }

        // Remove any "data: " prefix that might be present after cleaning
        // Using regex to handle any case variations and extra spaces
        cleanedLine = cleanedLine.replace(/^data:\s*/i, '').trim();

        if (cleanedLine !== '') {
            try {
                const parsed = JSON.parse(cleanedLine);
                results.push(parsed);
            } catch (error) {
                // console.error(`Data: ${cleanedLine}`);
            }
        }
    }
    return results;
}

export function showToast(message) {
    Toastify({
        text: message,
        duration: 1250,
        newWindow: true,
        close: false,
        gravity: "bottom", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #0f3b39, #0f3b39)",
        },
        onClick: function () { } // Callback after click
    }).showToast();

}