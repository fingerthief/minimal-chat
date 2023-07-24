

const MODEL_NAME = "chat-bison-001";
const API_KEY = 'AIzaSyCzZkjcXrHMdn6YlJqag80NL2nSqAzDq9c';

export async function fetchPalmResponse(messages) {

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta2/models/${MODEL_NAME}:generateMessage?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: { messages : messages },
                temperature: 0.1,
                candidate_count: 1          
            }),
        });

        const result = await response.json();
        const reponseText = result.candidates[0].content;

        console.log(result.candidates[0].content);

        return reponseText;
        
}

export async function savePalmMessages(currentMessages) {
    const savedMessages = currentMessages().map(message => ({
        content: message.content
    }));

    // Find the index of the selected conversation in storedConversations
    // const conversationIndex = self.storedConversations().findIndex(conversation => conversation.title === self.selectedConversation().title);

    // if (conversationIndex !== -1) {
    //     // Update the message history of the selected conversation
    //     self.storedConversations()[conversationIndex].messageHistory = savedMessages;
    // } 
    // else {
    //     if (JSON.parse(self.selectedAutoSaveOption())) {
    //         await this.saveNewConversations();
    //     }
    // }

    // // Save the updated conversations to localStorage
    // localStorage.setItem("gpt-conversations", JSON.stringify(self.storedConversations()));
};

