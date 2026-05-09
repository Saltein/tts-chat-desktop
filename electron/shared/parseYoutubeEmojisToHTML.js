export const parseYoutubeEmojisToHTML = (message) => {
    if (!message?.runs) return "";

    const html = message.runs
        .map((run) => {
            if (run.emoji) {
                const url = run.emoji?.image?.[0]?.url;
                if (!url) return "";

                let finalUrl = url;
                let finalString = `<img src="${url}"/>`;

                if (url.includes("https://yt3.ggpht.com/")) {
                    finalUrl = url
                        .replace("https://yt3.ggpht.com/", "")
                        .split("=")[0];

                    // Check if local asset exists
                    const localAssetPath = `assets://youtubeEmojis/${finalUrl}.png`;
                    if (assetExists(localAssetPath)) {
                        finalString = `<img src="${localAssetPath}"/>`;
                    } else {
                        finalString = `<img src="${url}"/>`;
                    }

                    console.log("[parseYoutubeEmojisToHTML]", finalString);
                }

                return finalString;
            }

            if (run.text) {
                return run.text;
            }

            return "";
        })
        .join("");

    return html;
};

const assetExists = async (assetPath) => {
    try {
        const response = await fetch(assetPath, { method: "HEAD" });
        return response.ok;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        return false;
    }
};

export const clearMessageFromEmojis = (message) => {
    if (!message?.runs) return "";

    return message.runs
        .map((run) => {
            if (run.emoji) {
                return "";
            }
            return run.text ? run.text : "";
        })
        .join("");
};
