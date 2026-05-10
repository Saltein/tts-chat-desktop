export const parseVkEmojisToHTML = (message, smiles) => {
    console.log("[parseVkEmojisToHTML] message:", message);
    console.log("[parseVkEmojisToHTML] smiles:", smiles);

    if (!message) {
        console.log("[parseVkEmojisToHTML] no message");
        return "";
    }
    if (smiles.length === 0) {
        console.log("[parseVkEmojisToHTML] no smiles");
        return message;
    }
    const emojisMap = Object.fromEntries(
        smiles.map((item) => [item.name, item.mediumUrl]),
    );

    return message.replace(/([^\s]+)\s?/g, (fullMatch, word) => {
        const emojiUrl = emojisMap[word];

        if (!emojiUrl) return fullMatch;

        return `<img src="${emojiUrl}" alt="${word}"/>`;
    });
};
