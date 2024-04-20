/* eslint-disable no-unused-vars */
import { showToast, sleep } from "./utils";

let hfStreamRetryCount = 0;
export async function fetchHuggingFaceModelResponseStream(conversation, attitude, model, huggingFaceEndpoint, updateUiFunction, apiKey, maxTokens) {
    const gptMessagesOnly = filterMessages(conversation);

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: model,
            stream: true,
            messages: gptMessagesOnly,
            temperature: attitude * 0.01,
            max_tokens: parseInt(maxTokens)
        }),
    };

    try {
        const response = await fetch(`${huggingFaceEndpoint + `/v1/chat/completions`}`, requestOptions);

        const result = await readResponseStream(response, updateUiFunction);

        hfStreamRetryCount = 0;
        return result;
    } catch (error) {
        console.error("Error fetching Hugging Face Model response:", error);
        hfStreamRetryCount++

        if (hfStreamRetryCount < 3) {
            await sleep(1500);
            return fetchHuggingFaceModelResponseStream(conversation, attitude, model, huggingFaceEndpoint, updateUiFunction);
        }

        return "Error fetching response from Hugging Face Model";

    }
}


let retryCount = 0;
export async function getConversationTitleFromHuggingFaceModel(messages, model, sliderValue, HuggingFaceModelEndpoint) {
    try {
        const apiKey = document.getElementById('api-key');
        apiKey.value = localStorage.getItem("hfKey");

        let tempMessages = messages.slice(0);
        tempMessages.push({ role: 'user', content: "Summarize my inital request or greeting in 5 words or less." });

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.value}`,
            },
            body: JSON.stringify({
                model: model,
                stream: true,
                messages: tempMessages,
                temperature: sliderValue * 0.01,
                max_tokens: 500
            }),
        };

        const response = await fetch(`${HuggingFaceModelEndpoint + `/v1/chat/completions`}`, requestOptions);

        const result = await readResponseStream(response);

        hfStreamRetryCount = 0;
        return result;
    } catch (error) {

        if (retryCount < 5) {
            retryCount++;
            getConversationTitleFromHuggingFaceModel(messages, model, sliderValue);
        }

        console.error("Error fetching Hugging Face Model response:", error);
        return "An error occurred while generating conversaton title.";
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
        const parsedLines = parseHuggingFaceResponseChunk(chunk);
        for (const parsedLine of parsedLines) {
            const { choices } = parsedLine;
            const { delta } = choices[0];
            const { content } = delta;
            if (content) {
                decodedResult += content;

                if (updateUiFunction) {
                    updateUiFunction(content);
                }
            }
        }
    }
}

let buffer = "";  // Buffer to hold incomplete JSON data across chunks
function parseHuggingFaceResponseChunk(chunk) {
    buffer += chunk;  // Append new chunk to buffer
    const lines = buffer.split("\n");

    const completeLines = lines.slice(0, -1);  // All lines except the last one
    buffer = lines[lines.length - 1];  // Last line might be incomplete, keep it in buffer

    const results = [];
    for (const line of completeLines) {
        let cleanedLine = line.trim();

        // Check if the line contains the control message [DONE] and remove it
        if (cleanedLine.includes("[DONE]")) {
            cleanedLine = cleanedLine.replace("[DONE]", "").trim();
        }

        // Remove any "data: " prefix that might be present after cleaning
        // Using regex to handle any case variations and extra spaces
        cleanedLine = cleanedLine.replace(/^data:\s*/i, "").trim();

        if (cleanedLine !== "") {
            try {
                const parsed = JSON.parse(cleanedLine);
                results.push(parsed);
            } catch (error) {
                console.error("Failed to parse JSON:", cleanedLine, error);
            }
        }
    }
    return results;
}

function filterMessages(conversation) {
    let lastMessageContent = "";
    return conversation.filter(message => {
        const isGPT = !message.content.trim().toLowerCase().startsWith("image::") &&
            !lastMessageContent.startsWith("image::");
        lastMessageContent = message.content.trim().toLowerCase();
        return isGPT;
    });
}