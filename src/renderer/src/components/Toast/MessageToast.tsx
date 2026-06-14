import { observer } from "mobx-react-lite";
import type { ToastContentProps } from "react-toastify";
import { Message } from "@stores/objects/Message";
import { Stack, Typography } from "@mutualzz/ui-web";
import { UserAvatar } from "@components/User/UserAvatar";
import { useNavigate } from "@tanstack/react-router";
import { ChannelType } from "@mutualzz/types";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { Link } from "@components/Link";

export const MessageToast = observer(
  ({ data: message, closeToast }: ToastContentProps<Message>) => {
    const navigate = useNavigate();

    const contentWithoutMentions = message.content?.replace(
      /<@!?(\d+)>|<@&(\d+)>|@everyone|@here/g,
      ""
    );

    const MAX_CHARS = 400; // tweak this number if you want longer/shorter previews
    const plain = contentWithoutMentions ?? "";
    const isLong = plain.length > MAX_CHARS;
    const preview = isLong ? plain.slice(0, MAX_CHARS) + "…" : plain;

    const channel = message.channel;

    const navigateToChannel = () => {
      if (!channel) return;

      try {
        closeToast?.();
      } catch {
        /* ignore */
      }

      if (
        channel.type === ChannelType.DM ||
        channel.type === ChannelType.GroupDM
      ) {
        navigate({
          to: "/@me/$channelId",
          params: { channelId: channel.id }
        });
        return;
      }

      navigate({
        to: "/spaces/$spaceId/$channelId",
        params: { spaceId: channel.spaceId!, channelId: channel.id }
      });
    };

    return (
      <Stack
        direction="row"
        spacing={1.25}
        style={{
          width: "100%",
          maxWidth: "clamp(320px, 36vw, 520px)"
        }}
        alignItems="flex-start"
      >
        <Stack style={{ flex: "0 0 auto" }}>
          <UserAvatar user={message.author} size="lg" />
        </Stack>

        <Stack
          style={{ flex: 1, minWidth: 0 }}
          spacing={0.75}
          direction="column"
        >
          <Stack direction="row" alignItems="center">
            <Typography
              fontWeight="bold"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%"
              }}
            >
              {message.member?.displayName || message.author?.displayName}
            </Typography>
          </Stack>

          {plain.trim() === "" ? (
            <>
              <Typography
                textColor="muted"
                level="body-sm"
                style={{ marginTop: 6 }}
              >
                You were only mentioned in this message
              </Typography>
              <Stack direction="row" spacing={0.5} style={{ marginTop: 8 }}>
                <Link
                  textColor="accent"
                  onClick={navigateToChannel}
                  underline="always"
                >
                  Open channel
                </Link>
              </Stack>
            </>
          ) : isLong ? (
            <>
              <MarkdownRenderer
                value={preview}
                css={{
                  marginTop: 6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxWidth: "100%"
                }}
              />
              <Stack direction="row" spacing={0.5} style={{ marginTop: 8 }}>
                <Link
                  textColor="accent"
                  onClick={navigateToChannel}
                  underline="always"
                >
                  Open channel
                </Link>
              </Stack>
            </>
          ) : (
            <Stack direction="column" style={{ marginTop: 6 }}>
              <MarkdownRenderer value={contentWithoutMentions || ""} />
              <Stack direction="row" spacing={0.5} style={{ marginTop: 8 }}>
                <Link
                  textColor="accent"
                  onClick={navigateToChannel}
                  underline="always"
                >
                  Open channel
                </Link>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
    );
  }
);
