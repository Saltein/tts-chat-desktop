import { useLocation } from "react-router-dom";

export const useStartsWith = () => {
    const location = useLocation();
    const starts = (path) => location.pathname.startsWith(path);
    const isWidget = starts("/widget");

    return { isWidget, starts };
};
