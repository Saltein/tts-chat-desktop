export class TTSLogParser {
    constructor(options = {}) {
        this.buffer = "";
        this.inMultiLine = false;
        this.currentMessage = null;
        this.stripAnsi = options.stripAnsi !== false; // по умолчанию true
        this.stripUnicodeEscapes = options.stripUnicodeEscapes !== false; // по умолчанию true
    }

    // Очистка ANSI escape последовательностей
    cleanAnsi(str) {
        if (!this.stripAnsi) return str;
        // Удаляет ANSI escape последовательности вида \x1B[...m, \x1B[...K и т.д.
        return str.replace(/\x1B\[[0-9;]*[mK]/g, "");
    }

    // Очистка Unicode escape последовательностей
    cleanUnicodeEscapes(str) {
        if (!this.stripUnicodeEscapes) return str;
        // Преобразует \uXXXX в соответствующий символ
        return str.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
        });
    }

    // Полная очистка строки
    cleanString(str) {
        let result = str;
        result = this.cleanUnicodeEscapes(result);
        result = this.cleanAnsi(result);
        return result;
    }

    parse(data) {
        const str = data.toString();
        this.buffer += str;

        // Полная очистка буфера
        const cleanBuffer = this.cleanString(this.buffer);

        const results = [];

        // Разделяем по строкам, но сохраняем структуру
        const lines = cleanBuffer.split(/\r?\n/);

        // Последняя строка может быть неполной
        this.buffer = lines.pop() || "";

        for (let line of lines) {
            line = line.trimEnd();
            if (!line && !this.inMultiLine) continue;

            // Проверяем, начинается ли строка с временной метки TTS
            const ttsTimestampMatch = line.match(
                /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\s+\[(\w+)\]\s+(.*)$/,
            );

            if (ttsTimestampMatch) {
                // Если были в многострочном режиме, сохраняем предыдущее сообщение
                if (this.inMultiLine && this.currentMessage) {
                    results.push(this.currentMessage);
                    this.inMultiLine = false;
                    this.currentMessage = null;
                }

                // Новое сообщение (уже очищенное)
                this.currentMessage = {
                    timestamp: ttsTimestampMatch[1],
                    event: `[${ttsTimestampMatch[2]}]`,
                    message: ttsTimestampMatch[3].trim(),
                };
                this.inMultiLine = true;
            } else if (this.inMultiLine && this.currentMessage) {
                // Продолжение предыдущего сообщения (уже очищенное)
                if (this.currentMessage.message) {
                    this.currentMessage.message += "\n" + line;
                } else {
                    this.currentMessage.message = line;
                }
            } else if (!this.inMultiLine && line) {
                // Строки без TTS формата (очищаем их тоже)
                results.push({
                    timestamp: null,
                    event: "[SYSTEM]",
                    message: this.cleanString(line),
                    isSystem: true,
                });
            }
        }

        // Не забываем последнее сообщение
        if (this.inMultiLine && this.currentMessage) {
            results.push(this.currentMessage);
            this.inMultiLine = false;
            this.currentMessage = null;
        }

        return results;
    }

    // Сброс состояния (если нужно начать заново)
    reset() {
        this.buffer = "";
        this.inMultiLine = false;
        this.currentMessage = null;
    }
}
