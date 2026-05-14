import { useEffect, useState } from "react";

export const useChangeAfterButtonTitle = ({
    mainTitle,
    tempTitle,
    time = 3000,
}) => {
    const [title, setTitle] = useState(mainTitle);

    const changeTitle = () => {
        setTitle(tempTitle);
    };

    useEffect(() => {
        let timer = setTimeout(() => {
            setTitle(mainTitle);
        }, time);

        return () => {
            clearTimeout(timer);
        };
    }, [title, mainTitle, time]);

    return { title, changeTitle };
};
