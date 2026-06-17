import { AvatarDraw } from "@components/Avatar/AvatarDraw";
import { AvatarMethodPalette } from "@components/Avatar/AvatarMethodPalette";
import { AvatarPreviewPanel } from "@components/Avatar/AvatarPreviewPanel";
import type { AvatarEditorMethod } from "@components/Avatar/avatarEditor.types";
import { AvatarUpload } from "@components/Avatar/AvatarUpload";
import { Avatars } from "@components/Avatar/Avatars";
import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { ProfileLayout } from "@components/Profile/viewer/ProfileLayout";
import { useAppStore } from "@hooks/useStores";
import { Stack } from "@mutualzz/ui-web";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { toast } from "react-toastify";
import { navigateToPreferredMode } from "@utils/index";

export const AvatarEditorPage = observer(() => {
  const app = useAppStore();
  const account = app.account;
  const navigate = useNavigate();
  const { method: searchMethod } = useSearch({
    from: "/_authenticated/avatar"
  });
  const method = searchMethod;

  const setMethod = (nextMethod: AvatarEditorMethod) => {
    navigate({ to: "/avatar", search: { method: nextMethod }, replace: true });
  };

  const { mutate: removeAvatar, isPending: removing } = useMutation({
    mutationKey: ["delete-avatar", account?.id],
    mutationFn: () => app.rest.patch("@me", { avatar: null }),
    onSuccess: () => toast.success("Avatar removed"),
    onError: () => toast.error("Failed to remove avatar")
  });

  if (!account) return null;

  const titleBarActions = (
    <Stack direction="row" spacing={1}>
      <Button
        color="neutral"
        size="sm"
        onClick={() => navigateToPreferredMode(app, navigate, false)}
      >
        Done
      </Button>
      <Button
        color="danger"
        size="sm"
        loading={removing}
        disabled={!account.avatar}
        onClick={() => removeAvatar()}
      >
        Remove
      </Button>
    </Stack>
  );

  return (
    <ProfileLayout
      title="Edit Avatar"
      actions={titleBarActions}
      backLabel="Close"
      onBack={() => navigateToPreferredMode(app, navigate)}
    >
      <Stack
        direction="row"
        spacing={1}
        width="100%"
        height="100%"
        px={1}
        py={0.5}
        minHeight={0}
        minWidth={0}
        overflow="hidden"
      >
        <AvatarMethodPalette method={method} onMethodChange={setMethod} />
        <Paper
          flex={1}
          height="100%"
          minWidth={0}
          minHeight={0}
          borderRadius={12}
          variant="plain"
          elevation={app.settings?.preferEmbossed ? 2 : 0}
          boxShadow="none !important"
          overflow="hidden"
        >
          {method === "upload" && <AvatarUpload variant="embedded" />}
          {method === "draw" && <AvatarDraw variant="embedded" />}
          {method === "avatars" && <Avatars variant="embedded" />}
        </Paper>
        <AvatarPreviewPanel />
      </Stack>
    </ProfileLayout>
  );
});
