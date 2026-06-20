import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

const PREVIEWS = [
  { label: "Member list", size: 32 },
  { label: "Sidebar", size: 48 },
  { label: "Messages", size: 40 },
  { label: "Profile", size: 72 }
];

export const AvatarPreviewPanel = observer(() => {
  const app = useAppStore();
  const account = app.account;
  const embossed = app.settings?.preferEmbossed;

  if (!account) return null;

  return (
    <Paper
      width={168}
      minWidth={168}
      flexShrink={0}
      height="100%"
      direction="column"
      spacing={1.25}
      p={1.25}
      borderRadius={12}
      variant="plain"
      elevation={embossed ? 4 : 0}
      boxShadow="none !important"
    >
      <Typography level="body-sm" fontWeight={600} px={0.5}>
        Preview
      </Typography>
      <Typography level="body-xs" px={0.5} css={{ opacity: 0.7 }}>
        How your avatar appears across Mutualzz.
      </Typography>
      <Stack direction="column" spacing={1.5} flex={1}>
        {PREVIEWS.map((preview) => (
          <Stack
            key={preview.label}
            direction="row"
            spacing={1.25}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography level="body-xs" css={{ opacity: 0.75 }}>
              {preview.label}
            </Typography>
            <UserAvatar user={account} size={preview.size} />
          </Stack>
        ))}
      </Stack>
      <Paper
        variant="soft"
        borderRadius={10}
        p={1.25}
        direction="column"
        spacing={1}
        alignItems="center"
      >
        <UserAvatar user={account} size={128} badge />
        <Typography level="body-xs" textAlign="center" css={{ opacity: 0.75 }}>
          {account.displayName}
        </Typography>
      </Paper>
    </Paper>
  );
});
