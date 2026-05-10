export const parseVkEmojisToHTML = (message, smiles) => {
    if (!message) {
        return "";
    }
    if (smiles.length === 0) {
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
