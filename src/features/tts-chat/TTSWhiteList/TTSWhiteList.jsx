import { useRef, useState } from "react";
import {
    DefaultButton,
    DefaultDivider,
    DefaultInput,
    DefaultSearch,
} from "../../../shared/ui";
import s from "./TTSWhiteList.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
    addBlackListItem,
    addWhiteListItem,
    selectBlackList,
    selectWhiteList,
} from "../model/slice";
import { WhiteListItem } from "./WhiteListItem/WhiteListItem";
import { genRandStr } from "../../../shared/lib/genRandStr";
import { addNotice } from "../../in-app-notices/model/slice";

export const TTSWhiteList = ({ black = false }) => {
    const dispatch = useDispatch();
    const inputRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [nickname, setNickname] = useState("");
    const whiteList = useSelector(selectWhiteList);
    const blackList = useSelector(selectBlackList);

    const blackListFiltered = blackList.filter((item) => {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const whiteListFiltered = whiteList.filter((item) => {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const list = black ? blackListFiltered : whiteListFiltered;

    const handleAdd = () => {
        if (list.find((item) => item.name === nickname.trim())) {
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
            dispatch(
                black
                    ? addBlackListItem(nickname.trim())
                    : addWhiteListItem(nickname.trim()),
            );
            setNickname("");
            inputRef.current?.focus();
            console.log(
                "[TTSWhiteList] Пользователь добавлен",
                nickname,
                "black:",
                black,
            );
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
                            <span>
                                {black ? "НЕ" : ""}будут озвучиваться сообщения.
                            </span>
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
            {list.length !== 0 && <DefaultDivider margin="128px" />}
            <div className={s.whiteListContainer}>
                {list.length === 0 && (
                    <span style={{ alignSelf: "center" }}>
                        {searchQuery ? "Ничего не нашлось" : "Список пуст"}
                    </span>
                )}
                {list.map((item) => {
                    return (
                        <WhiteListItem
                            item={item}
                            key={item.id}
                            black={black}
                        />
                    );
                })}
            </div>
        </div>
    );
};
