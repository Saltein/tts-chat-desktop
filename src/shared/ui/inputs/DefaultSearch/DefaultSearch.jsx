import s from "./DefaultSearch.module.scss";
import { DefaultInput } from "../DefaultInput/DefaultInput";
import SearchIcon from "../../../assets/icons/search.svg?react";
import ClearIcon from "../../../assets/icons/close.svg?react";
import { useState } from "react";

export const DefaultSearch = ({
    placeholder = "Поиск",
    height,
    query,
    setQuery,
}) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleClear = () => {
        setQuery ? setQuery("") : setSearchQuery("");
    };

    return (
        <div className={s.wrapper_DefaultSearch}>
            <div className={s.searchIcon}>
                <SearchIcon className={s.icon} />
            </div>
            <DefaultInput
                type="text"
                placeholder={placeholder}
                height={height}
                width={"100%"}
                padding={"0 32px 0 32px"}
                value={query ? query : searchQuery}
                onChange={(e) =>
                    setQuery
                        ? setQuery(e.target.value)
                        : setSearchQuery(e.target.value)
                }
            />
            <div className={s.clearButton} onClick={handleClear}>
                <ClearIcon className={s.icon} />
            </div>
        </div>
    );
};
