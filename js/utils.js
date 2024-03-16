export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export function wrapCodeSnippets(input) {
    const codeSnippetRegex = /`([^`]+)`/g;

    const wrapped = input.replace(codeSnippetRegex, (match, code) => {
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        return `<pre class="hljs"><code>${escapedCode}</code></pre>`;
    });

    return wrapped;
}

let retryCount = 0;
export async function getConversationTitleFromGPT(messages, model, sliderValue) {
    try {
        const apiKey = document.getElementById('api-key');
        apiKey.value = localStorage.getItem("gptKey");

        let tempMessages = messages.slice(0);
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
            self.getConversationTitleFromGPT(messages, model, sliderValue);
        }

        console.error("Error fetching GPT response:", error);
        return "An error occurred while generating conversaton title.";
    }
}

export function showToast(message) {
    Toastify({
        text: message,
        duration: 2000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #473253, #4d3f4f)",
        },
        onClick: function () { } // Callback after click
    }).showToast();
}