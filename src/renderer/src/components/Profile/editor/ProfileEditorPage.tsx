import { Button } from "@components/Button";
import { ProfileBlockInspector } from "@components/Profile/editor/ProfileBlockInspector";
import { ProfileBlockPalette } from "@components/Profile/editor/ProfileBlockPalette";
import { getDraftIntroMusic } from "@components/Profile/shared/profileIntroMusic.utils";
import { ProfileIntroMusic } from "@components/Profile/shared/ProfileIntroMusic";
import { ProfileResetConfirm } from "@components/Profile/editor/ProfileResetConfirm";
import {
  addBlockAtPoint,
  ProfileEditorCanvas
} from "@components/Profile/editor/ProfileEditorCanvas";
import { ProfileLayout } from "@components/Profile/viewer/ProfileLayout";
import {
  computeProfileEditorFitZoom,
  ProfileEditorZoomControls
} from "@components/Profile/editor/ProfileEditorZoomControls";
import {
  createDraftFromProfile,
  createEmptyDraft,
  getApiErrorMessage,
  getDropPoint,
  isEditableInputFocused,
  prepareBlocksForSave,
  validateDraftForSave,
  type ProfileDraftState
} from "@components/Profile/editor/profileEditor.utils";
import type { CanvasRect } from "@components/Profile/viewer/profileLayout.utils";
import { useAppStore } from "@hooks/useStores";
import type { ProfileBlockType } from "@mutualzz/types";
import { Box, Stack } from "@mutualzz/ui-web";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { navigateToPreferredMode } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import Loading from "@components/Loader/Loading";
import { useModal } from "@contexts/Modal.context";

export const ProfileEditorPage = observer(() => {
  const app = useAppStore();
  const account = app.account;
  const navigate = useNavigate();
  const { openModal } = useModal();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedZoom = useRef(false);

  const { data: fetchedProfile, isLoading } = useQuery({
    queryKey: ["profile", account?.id, "edit"],
    enabled: !!account?.id,
    queryFn: () => app.profiles.resolve(account!.id, true)
  });

  const profile = account?.id
    ? (app.profiles.get(account.id) ?? fetchedProfile)
    : undefined;

  const [draft, setDraft] = useState<ProfileDraftState | null>(() => {
    if (!profile) return null;
    return (
      app.profiles.getPreviewDraft(profile.userId) ??
      createDraftFromProfile(profile)
    );
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [canvasRect, setCanvasRect] = useState<CanvasRect>({
    width: 800,
    height: 600
  });
  const [zoom, setZoom] = useState(0.88);
  const [fitZoom, setFitZoom] = useState(0.88);

  useEffect(() => {
    if (!profile) return;
    const preview = app.profiles.getPreviewDraft(profile.userId);
    setDraft(preview ?? createDraftFromProfile(profile));
    setSelectedBlockId(null);
  }, [profile?.userId]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateFitZoom = () => {
      const { width, height } = el.getBoundingClientRect();
      const nextFit = computeProfileEditorFitZoom(width, height);
      setFitZoom(nextFit);

      if (!hasInitializedZoom.current) {
        hasInitializedZoom.current = true;
        setZoom(nextFit);
      }
    };

    updateFitZoom();
    const observer = new ResizeObserver(updateFitZoom);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const selectedBlock = useMemo(
    () => draft?.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [draft?.blocks, selectedBlockId]
  );

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationKey: ["save-profile", account?.id],
    mutationFn: async () => {
      if (!draft) return;

      const validationError = validateDraftForSave(draft);
      if (validationError) {
        throw new Error(validationError);
      }

      const blocks = prepareBlocksForSave(draft.blocks);

      return app.profiles.save({
        bio: draft.bio.trim() || null,
        banner: draft.banner,
        backgroundColor: draft.backgroundColor,
        backgroundImage: draft.backgroundImage,
        introMusicUrl: draft.introMusicTrackId ? null : draft.introMusicUrl,
        introMusicTrackId: draft.introMusicTrackId,
        introMusicTrackSource: draft.introMusicTrackId
          ? draft.introMusicTrackSource
          : null,
        blocks
      });
    },
    onSuccess: (result) => {
      if (result) {
        setDraft(createDraftFromProfile(result));
      }
      toast.success("Profile saved");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Failed to save profile"))
  });

  const handleProfileReset = useCallback(() => {
    setDraft(createEmptyDraft());
    setSelectedBlockId(null);
  }, []);

  const openResetModal = useCallback(() => {
    openModal(
      "profile-reset",
      <ProfileResetConfirm onSuccess={handleProfileReset} />
    );
  }, [openModal, handleProfileReset]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" || !selectedBlockId || !draft) return;
      if (isEditableInputFocused()) return;

      setDraft({
        ...draft,
        blocks: draft.blocks.filter((block) => block.id !== selectedBlockId)
      });
      setSelectedBlockId(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [draft, selectedBlockId]);

  const addBlock = (
    type: ProfileBlockType,
    point?: { x: number; y: number }
  ) => {
    if (!draft) return;
    const nextBlocks = addBlockAtPoint(draft.blocks, type, canvasRect, point);
    const added = nextBlocks[nextBlocks.length - 1];
    setDraft({ ...draft, blocks: nextBlocks });
    setSelectedBlockId(added.id);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const type = event.active.data.current?.type as
      | ProfileBlockType
      | undefined;
    if (!type || event.over?.id !== "profile-editor-canvas") return;

    const translated = event.active.rect.current.translated;
    const point = translated
      ? getDropPoint(translated, event.over.rect)
      : undefined;

    addBlock(type, point);
  };

  if (!account || isLoading || !profile || !draft) {
    return <Loading />;
  }

  const draftIntroMusic = getDraftIntroMusic(draft, profile);

  const titleBarActions = (
    <Stack direction="row" spacing={1}>
      <Button
        color="neutral"
        size="sm"
        onClick={() => {
          app.profiles.setPreviewDraft(account.id, draft);
          navigate({
            to: "/users/$username",
            params: { username: account.username },
            state: { profilePreview: true }
          });
        }}
      >
        Preview
      </Button>
      <Button
        color="neutral"
        size="sm"
        onClick={() => {
          app.profiles.clearPreviewDraft();
          setDraft(createDraftFromProfile(profile));
          setSelectedBlockId(null);
        }}
      >
        Discard
      </Button>
      <Button color="danger" size="sm" onClick={openResetModal}>
        Reset to empty
      </Button>
      <Button
        color="primary"
        size="sm"
        loading={saving}
        onClick={() => saveProfile()}
      >
        Save
      </Button>
    </Stack>
  );

  return (
    <ProfileLayout
      title="Customize Profile"
      actions={titleBarActions}
      backLabel="Close"
      onBack={() => navigateToPreferredMode(app, navigate)}
    >
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
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
          <ProfileBlockPalette onDoubleClickAdd={(type) => addBlock(type)} />
          <Stack
            ref={viewportRef}
            flex={1}
            height="100%"
            minWidth={0}
            minHeight={0}
            position="relative"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <Box
              width={`${zoom * 100}%`}
              height={`${zoom * 100}%`}
              minWidth={0}
              minHeight={0}
              css={{ flexShrink: 0 }}
            >
              <ProfileEditorCanvas
                profile={profile}
                user={account}
                blocks={draft.blocks}
                selectedBlockId={selectedBlockId}
                backgroundColorOverride={draft.backgroundColor}
                backgroundImageOverride={draft.backgroundImage}
                bioOverride={draft.bio}
                bannerOverride={draft.banner}
                onCanvasRectChange={setCanvasRect}
                onBlocksChange={(blocks) => setDraft({ ...draft, blocks })}
                onSelectBlock={setSelectedBlockId}
              />
            </Box>
            <ProfileEditorZoomControls
              zoom={zoom}
              fitZoom={fitZoom}
              onZoomChange={setZoom}
            />
            {draftIntroMusic && (
              <ProfileIntroMusic
                floating
                introMusic={draftIntroMusic}
                profile={profile}
              />
            )}
          </Stack>
          <ProfileBlockInspector
            profile={profile}
            draft={draft}
            selectedBlock={selectedBlock}
            onDraftChange={(patch) => setDraft({ ...draft, ...patch })}
            onBlocksChange={(blocks) => setDraft({ ...draft, blocks })}
            onSelectBlock={setSelectedBlockId}
          />
        </Stack>
      </DndContext>
    </ProfileLayout>
  );
});
