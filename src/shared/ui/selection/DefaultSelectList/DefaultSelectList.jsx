/* eslint-disable react-hooks/purity */
import { useState } from "react";
import s from "./DefaultSelectList.module.scss";
import ChevronDown from "../../../assets/icons/chevron-down.svg?react";
import { useDispatch } from "react-redux";
import { setTwitchVoice } from "../../../../features/tts-chat/model/slice";
import { Skeleton } from "../../Skeleton/Skeleton";

export const DefaultSelectList = ({
    options = [],
    currentSelection,
    onSelect,
    onClick,
}) => {
    const dispatch = useDispatch();
    const [isSelectionOpen, setIsSelectionOpen] = useState(false);

    const handleOpenSelection = () => {
        if (isSelectionOpen) {
            setIsSelectionOpen(false);
        } else {
            setIsSelectionOpen(true);
            onClick && onClick();
        }
    };

    const handleSelect = (option) => {
        setIsSelectionOpen(false);
        dispatch(setTwitchVoice(option)); // Обновляем Redux
        if (onSelect) {
            onSelect(option); // Дополнительный callback если нужен
        }
    };

    return (
        <div className={s.wrapper}>
            <div
                className={`${s.selectedOption} ${isSelectionOpen ? s.open : ""}`}
                onClick={handleOpenSelection}
            >
                <span className={s.option}>{currentSelection}</span>
                <ChevronDown
                    className={`${s.icon} ${isSelectionOpen ? s.open : ""}`}
                    color="var(--color-text)"
                />
            </div>
            {isSelectionOpen && (
                <div className={s.selectionList}>
                    {options.length === 0
                        ? [
                              Math.random(),
                              Math.random(),
                              Math.random(),
                              Math.random(),
                              Math.random(),
                              Math.random(),
                          ].map((option, index) => {
                              return (
                                  <div
                                      className={`${s.option}`}
                                      key={index + option}
                                  >
                                      <div
                                          className={s.skeletonSpan}
                                          style={{
                                              width: option * 100 + 80 + "px",
                                          }}
                                      >
                                          <Skeleton />
                                      </div>
                                  </div>
                              );
                          })
                        : options.map((option, index) => {
                              return (
                                  <div
                                      className={`${s.option} ${currentSelection === option ? s.current : ""}`}
                                      key={index + option}
                                      onClick={() => handleSelect(option)}
                                  >
                                      <span>{option}</span>
                                  </div>
                              );
                          })}
                </div>
            )}
        </div>
    );
};
