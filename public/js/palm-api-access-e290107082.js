

const MODEL_NAME = "chat-bison-001";
let retryCount = 0;

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

        if (retryCount < 5) {
            retryCount++;
            console.log("Retry count: " + retryCount);
            await sleep(1000);

            return await fetchPalmResponse(messages);
        }
        else {
            console.error("Error fetching PaLM Response:", err);
            return "An error occurred while fetching PaLM response. Please try again.";
        }
    }
        
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        if (retryCount < 5) {
            retryCount++;
            console.log("retrying PaLM title generation attempt:" + retryCount)
            return await fetchPalmConversationTitle(baseMessages);
        }

        return error;
    }
 
}