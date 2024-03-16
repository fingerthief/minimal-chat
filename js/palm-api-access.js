

import { showToast, sleep } from '../js/utils.js';

const MODEL_NAME = "chat-bison-001";
let retryCount = 0;
const numberOfRetriesAllowed = 5;

export async function fetchPalmResponse(messages) {
    const API_KEY = localStorage.getItem("palmKey");
    const ATTITUDE = localStorage.getItem("palm-attitude");
    try {

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta2/models/${MODEL_NAME}:generateMessage?key=${API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt: { messages : messages },
                    temperature: ATTITUDE * 0.01,
                    candidate_count: 1          
                }),
            });
    
            const result = await response.json();
            const reponseText = result.candidates[0].content;
    
            retryCount = 0;
            return reponseText;
    }
    catch (err) {

        if (retryCount < numberOfRetriesAllowed) {
            retryCount++;
            console.log("Retry count: " + retryCount);
            
            showToast(`Failed fetchPalmResponse Request. Retrying...Attempt #${retryCount}`);
            await sleep(1000);

            return await fetchPalmResponse(messages);
        }
        else {
            showToast(`Retry Attempts Failed for fetchPalmResponse Request.`);

            console.error("Error fetching PaLM Response:", err);
            return "An error occurred while fetching PaLM response. Please try again.";
        }
    }
        
}

let baseMessages;
export async function fetchPalmConversationTitle(messages) {
    baseMessages = messages;

    try {
        const API_KEY = localStorage.getItem("palmKey");
        messages.push({ content: "Give me one title for the summary of this conversation. 6 words maximum response."})
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta2/models/${MODEL_NAME}:generateMessage?key=${API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt: { messages : messages },
                    temperature: 0.5,
                    candidate_count: 1          
                }),
            });
    
            const result = await response.json();
            const reponseText = result.candidates[0].content;
    
            return reponseText;      
    } catch (error) {
        if (retryCount < numberOfRetriesAllowed) {
            retryCount++;

            showToast(`Failed fetchPalmConversationTitle Request. Retrying...Attempt #${retryCount}`);

            await sleep(1000);

            console.log("retrying PaLM title generation attempt:" + retryCount)
            return await fetchPalmConversationTitle(baseMessages);
        }

        showToast(`Retry Attempts Failed for fetchPalmConversationTitle Request.`);

        return error;
    }
 
}