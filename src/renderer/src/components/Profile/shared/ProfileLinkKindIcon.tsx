import type { ProfileLinkKind } from "@components/Profile/shared/profileLink.utils";
import {
  AppleLogoIcon,
  DiscordLogoIcon,
  GithubLogoIcon,
  GlobeIcon,
  InstagramLogoIcon,
  LinkIcon,
  LinkedinLogoIcon,
  MusicNotesIcon,
  RedditLogoIcon,
  SoundcloudLogoIcon,
  SpotifyLogoIcon,
  TiktokLogoIcon,
  TwitchLogoIcon,
  TwitterLogoIcon,
  YoutubeLogoIcon
} from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";

interface Props extends IconProps {
  kind: ProfileLinkKind;
}

export const ProfileLinkKindIcon = ({ kind, ...props }: Props) => {
  switch (kind) {
    case "youtube":
      return <YoutubeLogoIcon weight="fill" {...props} />;
    case "twitch":
      return <TwitchLogoIcon weight="fill" {...props} />;
    case "spotify":
      return <SpotifyLogoIcon weight="fill" {...props} />;
    case "soundcloud":
      return <SoundcloudLogoIcon weight="fill" {...props} />;
    case "apple":
      return <AppleLogoIcon weight="fill" {...props} />;
    case "deezer":
    case "bandcamp":
      return <MusicNotesIcon weight="fill" {...props} />;
    case "github":
      return <GithubLogoIcon weight="fill" {...props} />;
    case "discord":
      return <DiscordLogoIcon weight="fill" {...props} />;
    case "twitter":
      return <TwitterLogoIcon weight="fill" {...props} />;
    case "instagram":
      return <InstagramLogoIcon weight="fill" {...props} />;
    case "tiktok":
      return <TiktokLogoIcon weight="fill" {...props} />;
    case "linkedin":
      return <LinkedinLogoIcon weight="fill" {...props} />;
    case "reddit":
      return <RedditLogoIcon weight="fill" {...props} />;
    case "website":
      return <GlobeIcon weight="fill" {...props} />;
    default:
      return <LinkIcon weight="bold" {...props} />;
  }
};
