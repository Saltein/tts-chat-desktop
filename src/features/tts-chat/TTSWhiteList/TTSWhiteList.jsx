import { useRef, useState } from "react";
import {
    DefaultButton,
    DefaultDivider,
    DefaultInput,
    DefaultSearch,
} from "../../../shared/ui";
import s from "./TTSWhiteList.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { addWhiteListItem, selectWhiteList } from "../model/slice";
import { WhiteListItem } from "./WhiteListItem/WhiteListItem";
import { genRandStr } from "../../../shared/lib/genRandStr";
import { addNotice } from "../../in-app-notices/model/slice";

export const TTSWhiteList = () => {
    const dispatch = useDispatch();
    const inputRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [nickname, setNickname] = useState("");
    const whiteList = useSelector(selectWhiteList);

    const whiteListFiltered = whiteList.filter((item) => {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleAdd = () => {
        if (whiteList.find((item) => item.name === nickname.trim())) {
            dispatch(
                addNotice({
                    id: genRandStr(),
                    type: "warning",
                    message: "Пользователь уже добавлен",
                }),
            );
            inputRef.current?.focus();
            return;
        }

        if (nickname.trim()) {
            // Проверка на пустое значение
            dispatch(addWhiteListItem(nickname.trim()));
            setNickname("");
            inputRef.current?.focus();
            console.log("[TTSWhiteList] Пользователь добавлен", nickname);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleAdd();
        }
    };

    return (
        <div className={s.wrapper_TTSWhiteList}>
            <div className={s.inputContainer}>
                <DefaultInput
                    ref={inputRef}
                    placeholder="Никнейм"
                    info={
                        <>
                            <span>Никнейм пользователя, которому</span>
                            <span>будут озвучиваться сообщения.</span>
                            <br />
                            <span>
                                Для Youtube - <b>@username</b>
                            </span>
                            <span>
                                Для остальных - <b>username</b>
                            </span>
                        </>
                    }
                    height="32px"
                    flex={1}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyPress={handleKeyPress} // Добавляем поддержку Enter
                />
                <DefaultButton
                    title={"Добавить"}
                    onClick={handleAdd}
                    height="32px"
                    width={"128px"}
                />
            </div>
            <DefaultDivider />
            <DefaultSearch
                height="32px"
                query={searchQuery}
                setQuery={setSearchQuery}
            />
            <div className={s.whiteListContainer}>
                {whiteListFiltered.length === 0 && (
                    <span style={{ alignSelf: "center" }}>
                        {searchQuery ? "Ничего не нашлось" : "Список пуст"}
                    </span>
                )}
                {whiteListFiltered.map((item) => {
                    return <WhiteListItem item={item} key={item.id} />;
                })}
            </div>
        </div>
    );
};
