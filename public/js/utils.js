export function wrapCodeSnippets(input) {
    const codeSnippetRegex = /`([^`]+)`/g;

    const wrapped = input.replace(codeSnippetRegex, (match, code) => {
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        return `<pre><code>${escapedCode}</code></pre>`;
    });

    return wrapped;
}

export async function getConversationTitleFromGPT(messages, model, sliderValue) {
    try {
        const apiKey = document.getElementById('api-key');
        apiKey.value = localStorage.getItem("gpt3Key") || "";

        let tempMessages = messages.slice(0);
        tempMessages.push({ role: 'user', content: "Summarize our conversation in 5 words or less." });
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.value.trim() || 'Missing API Key'}`,
            },
            body: JSON.stringify({
                model: model,
                messages: tempMessages,
                temperature: sliderValue * 0.01
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
        return "An error occurred while fetching a response.";
    }
}