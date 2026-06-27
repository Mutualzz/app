import { Button } from "@components/Button";
import { ProfileBlockRenderer } from "@components/Profile/viewer/ProfileBlockRenderer";
import { ProfileCanvas } from "@components/Profile/shared/ProfileCanvas";
import { ProfileEmptyState } from "@components/Profile/viewer/ProfileEmptyState";
import { ProfileLayout } from "@components/Profile/viewer/ProfileLayout";
import { getDraftProfileMusic } from "@components/Profile/shared/profileMusicPlayer.utils";
import { hasProfileDraftContent } from "@components/Profile/editor/profileEditor.utils";
import { sortBlocksByZIndex } from "@components/Profile/viewer/profileLayout.utils";
import { ProfileCanvasBlocksLayer } from "@components/Profile/shared/ProfileCanvasBlocksLayer";
import { ProfileCanvasViewport } from "@components/Profile/shared/ProfileCanvasViewport";
import Loading from "@components/Loader/Loading";
import { useAppStore } from "@hooks/useStores";
import type { APIUser, APIUserProfile } from "@mutualzz/types";
import { Paper, Stack, Typography } from "@mutualzz/ui-web";
import { getUserDisplayName } from "@utils/profileRoute.utils";
import { navigateToPreferredMode } from "@utils/index";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";

interface Props {
  username: string;
  initialUser?: APIUser;
  initialProfile?: APIUserProfile;
}

export const ProfileViewerPage = observer(
  ({ username, initialUser, initialProfile }: Props) => {
    const app = useAppStore();
    const navigate = useNavigate();
    const isPreviewMode = useRouterState({
      select: (state) =>
        (state.location.state as { profilePreview?: boolean } | undefined)
          ?.profilePreview === true
    });
    const identifier = username.trim().toLowerCase();

    const { isLoading: userLoading } = useQuery({
      queryKey: ["user", identifier],
      queryFn: () => app.users.resolveByIdentifier(identifier),
      enabled: !initialUser
    });

    const viewerUser = useMemo(() => {
      const cached = app.users.all.find(
        (user) =>
          user.username.toLowerCase() === identifier || user.id === identifier
      );
      if (cached) return cached;
      if (initialUser) return app.users.add(initialUser);
      return undefined;
    }, [app.users, identifier, initialUser]);

    const userId = viewerUser?.id;

    const { isLoading: profileLoading } = useQuery({
      queryKey: ["profile", userId],
      enabled: !!userId && !initialProfile,
      queryFn: () => app.profiles.resolve(userId!, true)
    });

    const cachedProfile = userId ? app.profiles.get(userId) : undefined;
    const profile =
      cachedProfile ??
      (userId && initialProfile && initialProfile.userId === userId
        ? app.profiles.add(initialProfile)
        : undefined);
    void profile?.updatedAt;
    void viewerUser?.updatedAt;

    const isSelf = app.account?.id === viewerUser?.id;
    const previewDraft =
      isSelf && isPreviewMode && userId
        ? app.profiles.getPreviewDraft(userId)
        : null;
    const isPreviewing = !!previewDraft;

    useEffect(() => {
      if (!userId) return;
      app.gateway.subscribeUser(userId);
      return () => app.gateway.unsubscribeUser(userId);
    }, [userId, app]);

    useEffect(() => {
      if (!isSelf || isPreviewMode || !userId) return;
      app.profiles.clearPreviewDraft();
    }, [isSelf, isPreviewMode, userId, app.profiles]);

    const displayBlocks = useMemo(
      () => previewDraft?.blocks ?? (profile ? profile.blocks : []),
      [previewDraft?.blocks, profile?.blocks, profile?.updatedAt]
    );

    const previewProfileMusic = useMemo(
      () =>
        previewDraft && profile
          ? getDraftProfileMusic(previewDraft, profile)
          : null,
      [previewDraft, profile]
    );

    if ((userLoading || profileLoading) && !viewerUser) {
      return <Loading />;
    }

    if (!viewerUser || !profile) {
      return (
        <ProfileLayout
          title="Profile"
          backLabel="Close"
          onBack={() => navigateToPreferredMode(app, navigate)}
        >
          <Stack
            width="100%"
            height="100%"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <Typography level="title-md">User not found</Typography>
          </Stack>
        </ProfileLayout>
      );
    }

    if (isPreviewMode && isSelf && !previewDraft) {
      return (
        <ProfileLayout
          title="Preview"
          onBack={() => navigate({ to: "/profile" })}
        >
          <Stack
            width="100%"
            height="100%"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <Typography level="title-md">Preview expired</Typography>
            <Typography level="body-sm" css={{ opacity: 0.75 }}>
              Return to the editor and preview again.
            </Typography>
            <Button
              color="primary"
              onClick={() => navigate({ to: "/profile" })}
            >
              Back to editor
            </Button>
          </Stack>
        </ProfileLayout>
      );
    }

    const titleBarActions = isPreviewing ? (
      <Button
        color="primary"
        size="sm"
        onClick={() => navigate({ to: "/profile" })}
      >
        Keep editing
      </Button>
    ) : isSelf ? (
      <Button
        color="primary"
        size="sm"
        onClick={() => navigate({ to: "/profile" })}
      >
        Customize Profile
      </Button>
    ) : undefined;

    const pageTitle = isPreviewing
      ? "Preview"
      : isSelf
        ? "Your Profile"
        : `${getUserDisplayName(viewerUser.raw)}'s Profile`;

    const showCanvas =
      profile.configured ||
      (previewDraft ? hasProfileDraftContent(previewDraft) : false);

    return (
      <ProfileLayout
        title={pageTitle}
        actions={titleBarActions}
        onBack={() =>
          isPreviewing
            ? navigate({ to: "/profile" })
            : navigateToPreferredMode(app, navigate)
        }
        backLabel={isPreviewing ? "Back" : "Close"}
        music={previewProfileMusic ?? profile.profileMusic}
        musicProfile={profile}
        musicAutoPlay={!isPreviewing}
      >
        {!showCanvas ? (
          <ProfileEmptyState isSelf={isSelf} />
        ) : (
          <Stack
            flex={1}
            minHeight={0}
            width="100%"
            position="relative"
            direction="column"
          >
            {isPreviewing && (
              <Paper
                variant="soft"
                borderRadius={10}
                px={1.5}
                py={1}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                css={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  right: 6,
                  zIndex: 20
                }}
              >
                <Typography level="body-sm" css={{ opacity: 0.85 }}>
                  Previewing unsaved changes
                </Typography>
                <Typography level="body-xs" css={{ opacity: 0.65 }}>
                  Nothing is published until you save
                </Typography>
              </Paper>
            )}
            <ProfileCanvasViewport>
              <ProfileCanvas
                profile={profile}
                backgroundColorOverride={previewDraft?.backgroundColor}
                backgroundImageOverride={previewDraft?.backgroundImage}
                pageFontFamilyOverride={previewDraft?.pageFontFamily}
              >
                <ProfileCanvasBlocksLayer>
                  {({ canvasRect }) =>
                    sortBlocksByZIndex(displayBlocks).map((block) => (
                      <ProfileBlockRenderer
                        key={block.id}
                        block={block}
                        canvas={canvasRect}
                        profile={profile}
                        user={viewerUser}
                        bioOverride={previewDraft?.bio}
                        bannerOverride={previewDraft?.banner}
                        readOnly
                      />
                    ))
                  }
                </ProfileCanvasBlocksLayer>
              </ProfileCanvas>
            </ProfileCanvasViewport>
          </Stack>
        )}
      </ProfileLayout>
    );
  }
);
