import { useLocation } from "react-router-dom";

export const useStartsWith = () => {
    const location = useLocation();

    // Получаем путь из хеша (если есть) или из pathname
    const getPath = () => {
        if (location.hash && location.hash.startsWith("#")) {
            // Убираем # и обрезаем всё после ? (query string внутри хеша)
            const hashPath = location.hash.slice(1).split("?")[0];
            return hashPath || "/";
        }
        return location.pathname;
    };

    const currentPath = getPath();
    const starts = (path) => currentPath.startsWith(path);
    const isWidget = starts("/widget");

    return { isWidget, starts };
};
