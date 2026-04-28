import fs from "fs";
import path from "path";
import os from "os";

/**
 * Удаляет все папки _MEI* из временной директории
 * @param {number} maxAgeHours - максимальный возраст папок в часах (по умолчанию 1 час)
 * @param {boolean} forceDeleteAll - принудительно удалить все папки независимо от возраста
 * @returns {Promise<{deleted: number, failed: number, folders: string[]}>}
 */
async function cleanupMeiFolders(maxAgeHours = 1, forceDeleteAll = false) {
    const tempDir = os.tmpdir(); // Получаем системную Temp папку
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

    const result = {
        deleted: 0,
        failed: 0,
        folders: [],
        errors: [],
    };

    try {
        // Читаем все файлы/папки в Temp
        const items = await fs.promises.readdir(tempDir);

        // Фильтруем только папки, начинающиеся с _MEI
        const meiFolders = items.filter((item) => {
            const fullPath = path.join(tempDir, item);
            try {
                const stats = fs.statSync(fullPath);
                return stats.isDirectory() && item.startsWith("_MEI");
            } catch (err) {
                return false;
            }
        });

        if (meiFolders.length === 0) {
            console.log("No _MEI* folders found in temp directory");
            return result;
        }

        console.log(`Found ${meiFolders.length} _MEI* folder(s) in ${tempDir}`);

        // Удаляем каждую папку
        for (const folder of meiFolders) {
            const folderPath = path.join(tempDir, folder);

            try {
                const stats = await fs.promises.stat(folderPath);
                const folderAge = now - stats.mtimeMs;

                // Проверяем возраст папки
                if (forceDeleteAll || folderAge > maxAgeMs) {
                    // Рекурсивно удаляем папку
                    await fs.promises.rm(folderPath, {
                        recursive: true,
                        force: true,
                    });
                    result.deleted++;
                    result.folders.push(folder);
                    console.log(
                        `Deleted: ${folder} (age: ${Math.round(folderAge / 1000 / 60)} minutes)`,
                    );
                } else {
                    console.log(
                        `Skipped: ${folder} (age: ${Math.round(folderAge / 1000 / 60)} minutes, younger than ${maxAgeHours} hour(s))`,
                    );
                }
            } catch (err) {
                result.failed++;
                result.errors.push({ folder, error: err.message });
                console.error(`Failed to delete ${folder}:`, err.message);
            }
        }

        console.log(
            `Cleanup complete: ${result.deleted} deleted, ${result.failed} failed`,
        );
    } catch (err) {
        console.error("Error reading temp directory:", err);
        result.errors.push({ error: err.message });
    }

    return result;
}

/**
 * Удаляет папки _MEI* асинхронно без ожидания результата (fire and forget)
 * @param {number} maxAgeHours
 */
export function cleanupMeiFoldersAsync(maxAgeHours = 1) {
    cleanupMeiFolders(maxAgeHours, false)
        .then((result) => {
            if (result.deleted > 0) {
                console.log(`Cleaned up ${result.deleted} old _MEI* folders`);
            }
        })
        .catch((err) => console.error("Cleanup error:", err));
}

/**
 * Запускает периодическую очистку _MEI папок
 * @param {number} intervalHours - интервал очистки в часах
 * @param {number} maxAgeHours - максимальный возраст папок в часах
 */
export function startPeriodicMeiCleanup(intervalHours = 6, maxAgeHours = 1) {
    // Первая очистка через 30 секунд после запуска
    setTimeout(() => {
        cleanupMeiFoldersAsync(maxAgeHours);
    }, 30000);

    // Затем периодическая очистка
    const intervalMs = intervalHours * 60 * 60 * 1000;
    setInterval(() => {
        cleanupMeiFoldersAsync(maxAgeHours);
    }, intervalMs);

    console.log(
        `Periodic _MEI* cleanup started (interval: ${intervalHours}h, max age: ${maxAgeHours}h)`,
    );
}

/**
 * Очищает папки _MEI* при завершении приложения
 */
export function cleanupMeiOnExit() {
    process.on("exit", () => {
        console.log("Cleaning up _MEI* folders on exit...");
        cleanupMeiFolders(0, true).catch(console.error);
    });

    // Обработка Ctrl+C
    process.on("SIGINT", () => {
        console.log("Received SIGINT, cleaning up...");
        cleanupMeiFolders(0, true).then(() => process.exit(0));
    });

    // Обработка завершения процесса
    process.on("SIGTERM", () => {
        console.log("Received SIGTERM, cleaning up...");
        cleanupMeiFolders(0, true).then(() => process.exit(0));
    });
}
