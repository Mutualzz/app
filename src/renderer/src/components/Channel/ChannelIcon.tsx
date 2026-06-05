import { ChannelType } from "@mutualzz/types";
import {
  HashIcon,
  IconProps,
  SpeakerSimpleHighIcon,
  WaveformIcon
} from "@phosphor-icons/react";

interface Props extends Omit<IconProps, "type"> {
  voiceActive?: boolean;
  type: ChannelType;
}

export const ChannelIcon = ({ voiceActive, type, ...props }: Props) => {
  switch (type) {
    case ChannelType.Text:
      return <HashIcon size={16} {...props} />;
    case ChannelType.Voice:
      return voiceActive ? (
        <WaveformIcon size={16} {...props} />
      ) : (
        <SpeakerSimpleHighIcon weight="fill" size={16} {...props} />
      );

    default:
      return null;
  }
};
