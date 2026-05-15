import { ChannelType } from "@mutualzz/types";
import { FaHashtag, FaVolumeUp } from "react-icons/fa";
import type { IconBaseProps } from "react-icons/lib";
import { PiWaveformBold } from "react-icons/pi";

interface Props extends Omit<IconBaseProps, "type"> {
    voiceActive?: boolean;
    type: ChannelType;
}

export const ChannelIcon = ({ voiceActive, type, ...props }: Props) => {
    switch (type) {
        case ChannelType.Text:
            return <FaHashtag size={16} {...props} />;
        case ChannelType.Voice: {
            return voiceActive ? (
                <PiWaveformBold size={16} {...props} />
            ) : (
                <FaVolumeUp size={16} {...props} />
            );
        }
        default:
            return null;
    }
};
