import { Button } from "@components/Button";
import { ProfileBlockRenderer } from "@components/Profile/viewer/ProfileBlockRenderer";
import { ProfileCanvas } from "@components/Profile/shared/ProfileCanvas";
import { ProfileEmptyState } from "@components/Profile/viewer/ProfileEmptyState";
import { ProfileNotFoundState } from "@components/Profile/viewer/ProfileNotFoundState";
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
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  username: string;
  initialUser?: APIUser;
  initialProfile?: APIUserProfile;
}

export const ProfileViewerPage = observer(
  ({ username, initialUser, initialProfile }: Props) => {
    const { t } = useTranslation("settings");
    const { t: tCommon } = useTranslation("common");
    const app = useAppStore();
    const navigate = useNavigate();
    const isPreviewMode = useRouterState({
      select: (state) =>
        (state.location.state as { profilePreview?: boolean } | undefined)
          ?.profilePreview === true
    });
    const identifier = username.trim().toLowerCase();

    const accountMatches =
      app.account?.username.toLowerCase() === identifier;

    const viewerUser = (() => {
      const cached = app.users.all.find(
        (user) =>
          user.username.toLowerCase() === identifier || user.id === identifier
      );
      if (cached) return cached;
      if (initialUser) return app.users.add(initialUser);
      if (accountMatches && app.account) {
        const existing = app.users.get(app.account.id);
        if (existing) return existing;
        return app.users.add(app.account.raw as APIUser);
      }
      return undefined;
    })();

    const userId = viewerUser?.id;

    const isSelf =
      app.account?.id != null &&
      userId != null &&
      String(app.account.id) === String(userId);

    const { isLoading: userLoading, isError: userError } = useQuery({
      queryKey: ["user", identifier, app.account?.id],
      queryFn: () => app.users.resolveByIdentifier(identifier, true),
      enabled: !viewerUser,
      retry: false
    });

    const { isLoading: profileLoading, isError: profileError } = useQuery({
      queryKey: ["profile", userId, app.account?.id],
      enabled: !!userId && !userError && (!initialProfile || isSelf),
      queryFn: () => app.profiles.resolve(userId!, true),
      retry: false
    });

    const cachedProfile = userId ? app.profiles.get(userId) : undefined;
    const profile =
      cachedProfile ??
      (userId && initialProfile && initialProfile.userId === userId
        ? app.profiles.add(initialProfile)
        : undefined);

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

    const displayBlocks =
      previewDraft?.blocks ?? (profile ? profile.blocks : []);

    const previewProfileMusic =
      previewDraft && profile
        ? getDraftProfileMusic(previewDraft, profile)
        : null;

    if ((userLoading || profileLoading) && !viewerUser) return <Loading />;

    if (userError || !viewerUser) {
      return (
        <ProfileLayout
          title={t("profile.viewer.title")}
          backLabel={tCommon("close")}
          onBack={() => navigateToPreferredMode(app, navigate)}
        >
          <ProfileNotFoundState
            onBack={() => navigateToPreferredMode(app, navigate)}
          />
        </ProfileLayout>
      );
    }

    if ((profileError || !profile) && !isSelf) {
      return (
        <ProfileLayout
          title={t("profile.viewer.title")}
          backLabel={tCommon("close")}
          onBack={() => navigateToPreferredMode(app, navigate)}
        >
          <ProfileNotFoundState
            onBack={() => navigateToPreferredMode(app, navigate)}
          />
        </ProfileLayout>
      );
    }

    if (!profile) {
      if (profileLoading) return <Loading />;
      if (isSelf) {
        return (
          <ProfileLayout
            title={t("profile.viewer.yourProfile")}
            backLabel={tCommon("close")}
            onBack={() => navigateToPreferredMode(app, navigate)}
            actions={
              <Button
                color="primary"
                size="sm"
                onClick={() => navigate({ to: "/profile" })}
              >
                {t("profile.customizeProfile")}
              </Button>
            }
          >
            <ProfileEmptyState isSelf />
          </ProfileLayout>
        );
      }
      return <Loading />;
    }

    if (isPreviewMode && isSelf && !previewDraft) {
      return (
        <ProfileLayout
          title={t("profile.preview")}
          onBack={() => navigate({ to: "/profile" })}
        >
          <Stack
            width="100%"
            height="100%"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <Typography level="title-md">{t("profile.viewer.previewExpired")}</Typography>
            <Typography level="body-sm" css={{ opacity: 0.75 }}>
              {t("profile.viewer.previewExpiredHint")}
            </Typography>
            <Button
              color="primary"
              onClick={() => navigate({ to: "/profile" })}
            >
              {t("profile.editor.backToEditing")}
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
        {t("profile.editor.keepEditing")}
      </Button>
    ) : isSelf ? (
      <Button
        color="primary"
        size="sm"
        onClick={() => navigate({ to: "/profile" })}
      >
        {t("profile.customizeProfile")}
      </Button>
    ) : undefined;

    const pageTitle = isPreviewing
      ? t("profile.preview")
      : isSelf
        ? t("profile.viewer.yourProfile")
        : t("profile.viewer.userProfile", {
            name: getUserDisplayName(viewerUser.raw)
          });

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
        backLabel={isPreviewing ? tCommon("back") : tCommon("close")}
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
                  {t("profile.viewer.previewingUnsaved")}
                </Typography>
                <Typography level="body-xs" css={{ opacity: 0.65 }}>
                  {t("profile.viewer.nothingPublishedUntilSave")}
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
