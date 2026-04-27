export function isBright(hex) {
    // Убираем символ '#' в начале, если он есть
    hex = hex.replace(/^#/, "");

    // Преобразуем короткую форму (#RGB) в полную (#RRGGBB)
    if (hex.length === 3) {
        hex = hex
            .split("")
            .map((c) => c + c)
            .join("");
    }

    // Проверяем, что длина теперь 6 символов
    if (hex.length !== 6) {
        throw new Error("Некорректный HEX-цвет");
    }

    // Извлекаем компоненты R, G, B
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Формула относительной яркости (perceived brightness)
    // Коэффициенты основаны на чувствительности человеческого глаза к разным цветам
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;

    // Возвращаем true, если яркость больше 127.5 (50% от 255)
    return brightness > 127.5;
}
