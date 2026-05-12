import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/*
node patch-parser.js 
⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇
После yarn install или npm install (когда устанавливаете/обновляете любые пакеты)
После yarn add <пакет> (добавления нового пакета)
После yarn remove <пакет> (удаления пакета)
При обновлении youtubei.js (если оно будет в будущем)


🔥 Рекомендация на будущее
Чтобы не зависеть от ручных патчей, всё же советую перейти на @distube/youtubei.js. 
Тогда вы просто обновляете пакет через yarn upgrade, и всё продолжает работать:

yarn remove youtubei.js
yarn add @distube/youtubei.js@latest

# меняете import в main.js и всё
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.join(
    __dirname,
    "node_modules",
    "youtubei.js",
    "dist",
    "src",
    "parser",
    "parser.js",
);

if (fs.existsSync(parserPath)) {
    let content = fs.readFileSync(parserPath, "utf-8");

    // Добавляем проверки на undefined
    content = content.replace(/\.url/g, "?.url");
    content = content.replace(/thumbnail\.url/g, "thumbnail?.url");
    content = content.replace(
        /thumbnails\[(\d+)\]\.url/g,
        "thumbnails?.[$1]?.url",
    );

    // Добавляем проверку в parseItem
    content = content.replace(
        /export function parseItem\(data, validTypes\) \{([^}]*?)if \(!shouldIgnore\(classname\)\) \{/s,
        (match) => {
            return match + "\n        if (!data[keys[0]]) return null;\n";
        },
    );

    fs.writeFileSync(parserPath, content, "utf-8");
    console.log("✅ Parser.js patched successfully!");
} else {
    console.error("❌ parser.js not found!");
}
