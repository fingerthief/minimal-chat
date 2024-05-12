export function createConversation(conversations, title, messages) {
    const maxId = conversations.length > 0 ? Math.max(...conversations.map(c => c.id)) : 0;
    const newId = maxId + 1;

    const newConversation = {
        title: title,
        id: newId,
        messageHistory: messages
    };

    conversations.push(newConversation);
    return conversations;
}

export function updateConversation(conversations, id, updatedConversation) {
    const index = conversations.findIndex(conversation => conversation.id === id);
    if (index !== -1) {
        conversations[index] = { ...conversations[index], ...updatedConversation };
    }
    return conversations;
}

export function deleteConversation(conversations, id) {
    return conversations.filter(conversation => conversation.id !== id);
}
