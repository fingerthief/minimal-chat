/* eslint-disable no-unused-vars */
import { showToast, sleep } from "./utils";

let localStreamRetryCount = 0;
export async function fetchLocalModelResponseStream(conversation, attitude, model, localModelEndpoint, updateUiFunction) {
    const gptMessagesOnly = filterLocalMessages(conversation);

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("localModelKey") || "No Key Provided"}`,
        },
        body: JSON.stringify({
            model: model,
            stream: true,
            messages: gptMessagesOnly,
            temperature: attitude * 0.01
        }),
    };

    try {
        const response = await fetch(localModelEndpoint + `/v1/chat/completions`, requestOptions);

        const result = await readResponseStream(response, updateUiFunction);

        localStreamRetryCount = 0;
        return result;
    } catch (error) {
        console.error("Error fetching Local Model response:", error);
        localStreamRetryCount++

        if (localStreamRetryCount < 3) {
            await sleep(1500);
            return fetchLocalModelResponseStream(conversation, attitude, model, localModelEndpoint, updateUiFunction);
        }

        return "Error fetching response from Local LLM Model";

    }
}


let retryCount = 0;
export async function getConversationTitleFromLocalModel(messages, model, sliderValue, localModelEndpoint) {
    try {
        const apiKey = document.getElementById('api-key');
        apiKey.value = localStorage.getItem("gptKey");

        let tempMessages = messages.slice(0);
        tempMessages.push({ role: 'user', content: "Summarize my inital request or greeting in 5 words or less." });

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("localModelKey") || "No Key Provided"}`,
            },
            body: JSON.stringify({
                model: model,
                stream: true,
                messages: tempMessages,
                temperature: sliderValue * 0.01
            }),
        };

        const response = await fetch(localModelEndpoint + `/v1/chat/completions`, requestOptions);

        const result = await readResponseStream(response);

        localStreamRetryCount = 0;
        return result;
    } catch (error) {

        if (retryCount < 5) {
            retryCount++;
            getConversationTitleFromLocalModel(messages, model, sliderValue);
        }

        console.error("Error fetching Local Model response:", error);
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
        const parsedLines = parseOpenAiFormatResponseChunk(chunk);
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
function parseOpenAiFormatResponseChunk(chunk) {
    buffer += chunk;  // Append new chunk to buffer

    // Handle the [DONE] tag
    buffer = buffer.replace(/\[DONE\]/g, '');

    const lines = buffer.split("\n");
    const completeLines = lines.slice(0, -1);  // All lines except the last one
    buffer = lines[lines.length - 1];  // Last line might be incomplete, keep it in buffer

    const results = [];
    for (const line of completeLines) {
        let cleanedLine = line.trim();

        const firstBraceIndex = cleanedLine.indexOf('{');
        cleanedLine = firstBraceIndex !== -1 ? cleanedLine.substring(firstBraceIndex) : cleanedLine;

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

function filterLocalMessages(conversation) {
    let lastMessageContent = "";
    return conversation.filter(message => {
        const isGPT = !message.content.trim().toLowerCase().startsWith("image::") &&
            !lastMessageContent.startsWith("image::");
        lastMessageContent = message.content.trim().toLowerCase();
        return isGPT;
    });
}