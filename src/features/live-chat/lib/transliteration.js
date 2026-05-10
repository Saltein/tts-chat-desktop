import { ToWords } from "to-words";

const toWords = new ToWords({
    localeCode: "ru-RU",
});

const map = {
    yo: "ё",
    zh: "ж",
    ch: "ч",
    sh: "ш",
    sch: "щ",
    a: "а",
    b: "б",
    v: "в",
    g: "г",
    d: "д",
    e: "е",
    z: "з",
    i: "и",
    j: "й",
    k: "к",
    l: "л",
    m: "м",
    n: "н",
    o: "о",
    p: "п",
    r: "р",
    s: "с",
    t: "т",
    u: "у",
    f: "ф",
    h: "х",
    c: "ц",
    y: "ы",
    "+": " плюс ",
    "/": " слэш ",
    "=": " равно ",
    "@": " собачка ",
    "%": " процент ",
    "№": " номер ",
};

const fracMap = {
    1: "десятых",
    2: "сотых",
    3: "тысячных",
    4: "десятитысячных",
    5: "стотысячных",
    6: "миллионных",
    7: "десятимиллионных",
    8: "стомиллионных",
    9: "миллиардных",
    10: "десятимиллиардных",
    11: "стомиллиардных",

    12: "триллионных",
    13: "десятитриллионных",
    14: "стотриллионных",

    15: "квадриллионных",
    16: "десятиквадриллионных",
    17: "сто квадриллионных",

    18: "квинтиллионных",
    19: "десятиквинтиллионных",
    20: "сто квинтиллионных",

    21: "секстиллионных",
    22: "десятисекстиллионных",
    23: "сто секстиллионных",

    24: "септиллионных",
    25: "десятисептиллионных",
    26: "сто септиллионных",

    27: "октиллионных",
    28: "десяти октиллионных",
    29: "сто октиллионных",

    30: "нонтиллионных",
    31: "десяти нонтиллионных",
    32: "сто нонтиллионных",
};

export const transliterateMessage = (text) => {
    if (!text) text = "";

    console.log("[transliterateMessage] raw:", text);

    let result = text.toLowerCase();

    // 12,2 → 12.2
    result = result.replace(/(\d+),(\d+)/g, "$1.$2");

    // числа → слова
    result = result.replace(/\d+(\.\d+)?/g, (match) => {
        const isFloat = match.includes(".");

        // целые числа
        if (!isFloat) {
            return toWords.convert(Number(match));
        }

        // дробные числа
        const [intPart, fracPart] = match.split(".");

        const intWords = toWords.convert(Number(intPart));

        const fracWords = toWords.convert(Number(fracPart));

        return `${intWords} целых и ${fracWords} ${fracMap[fracPart.length] ? fracMap[fracPart.length] : ""}`;
    });

    console.log("[transliterateMessage] after numbers:", result);

    // транслитерация
    for (const [latin, cyril] of Object.entries(map)) {
        result = result.replaceAll(latin, cyril);
    }

    return result;
};
