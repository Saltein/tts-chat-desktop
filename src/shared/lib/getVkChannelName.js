export function getVkChannelName(input) {
    if (!input || typeof input !== "string") return null;

    // убираем пробелы
    input = input.trim();

    // если это не URL — считаем что это уже имя канала
    if (!input.includes("://") && !input.includes("/")) {
        return input;
    }

    try {
        // добавляем протокол если его нет
        const url = input.includes("://")
            ? new URL(input)
            : new URL("https://" + input);

        const parts = url.pathname.split("/").filter(Boolean);

        // VK Live формат: /channel/...
        return parts[0] || null;
    } catch {
        return null;
    }
}
