import { useSelector } from "react-redux";
import { selectYoutubeStatus } from "../model/slice";

export const useInitYoutubeInfoListener = () => {
    const { likes, viewers } = useSelector(selectYoutubeStatus);
    return { likes, viewers };
};
