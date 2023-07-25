

const MODEL_NAME = "chat-bison-001";

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
    
            console.log(result.candidates[0].content);
    
            return reponseText;
    }
    catch (err) {
        console.error("Error fetching PaLM Response:", err);
        return "An error occurred while fetching PaLM response. Please try again.";
    }
        
}

export async function fetchPalmConversationTitle(messages) {
    const API_KEY = localStorage.getItem("palmKey");
    messages.push({ content: "Summarize this conversations in 10 words or less."})
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta2/models/${MODEL_NAME}:generateMessage?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: { messages : messages },
                temperature: 0.25,
                candidate_count: 1          
            }),
        });

        const result = await response.json();
        const reponseText = result.candidates[0].content;

        console.log(result.candidates[0].content);

        return reponseText;       
}