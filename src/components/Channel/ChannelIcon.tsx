import { ChannelType } from "@mutualzz/types";
import { FaHashtag, FaVolumeUp } from "react-icons/fa";
import type { IconBaseProps } from "react-icons/lib";

interface Props extends Omit<IconBaseProps, "type"> {
    type: ChannelType;
}

export const ChannelIcon = ({ type, ...props }: Props) => {
    switch (type) {
        case ChannelType.Text:
            return <FaHashtag size={14} {...props} />;
        case ChannelType.Voice:
            return <FaVolumeUp size={14} {...props} />;
        default:
            return null;
    }
};
