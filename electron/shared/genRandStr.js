export function genRandStr(length = 18) {
    // Определяем наборы символов
    const latinLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const cyrillicLetters =
        "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя";
    const digits = "0123456789";
    const specialChars = "!@#$%^&*()_+[]{}|;:,.<>?";

    // Объединяем все символы
    const allChars = latinLetters + cyrillicLetters + digits + specialChars;
    const allCharsLength = allChars.length;

    let result = "";

    // Генерируем строку
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allCharsLength);
        result += allChars[randomIndex];
    }

    return result;
}
