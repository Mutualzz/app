import { Button } from "@components/Button";
import { ProfileBlockInspector } from "@components/Profile/editor/ProfileBlockInspector";
import { ProfileBlockPalette } from "@components/Profile/editor/ProfileBlockPalette";
import { getDraftIntroMusic } from "@components/Profile/shared/profileIntroMusic.utils";
import { ProfileResetConfirm } from "@components/Profile/editor/ProfileResetConfirm";
import {
  addBlockAtPoint,
  ProfileEditorCanvas
} from "@components/Profile/editor/ProfileEditorCanvas";
import {
  PROFILE_BLOCK_MENU_ID,
  ProfileBlockContextMenu
} from "@components/Profile/editor/ProfileBlockContextMenu";
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
  isProfileBlockDeleteKey,
  prepareBlocksForSave,
  validateDraftForSave,
  type ProfileDraftState
} from "@components/Profile/editor/profileEditor.utils";
import type { CanvasRect } from "@components/Profile/viewer/profileLayout.utils";
import {
  alignBlockHorizontally,
  alignBlockVertically,
  snapBlockToGrid
} from "@components/Profile/viewer/profileLayout.utils";
import { useAppStore } from "@hooks/useStores";
import type { ProfileBlockType, APIProfileBlock } from "@mutualzz/types";
import { Stack } from "@mutualzz/ui-web";
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
import { useMenu } from "@contexts/ContextMenu.context";

export const ProfileEditorPage = observer(() => {
  const app = useAppStore();
  const account = app.account;
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { openContextMenu } = useMenu();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedZoom = useRef(false);
  const blockMenuTargetRef = useRef<string | null>(null);

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
  const viewportScaleRef = useRef(1);
  const [canvasRect, setCanvasRect] = useState<CanvasRect>({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(0.88);
  const [fitZoom, setFitZoom] = useState(0.88);
  const [snapToGrid, setSnapToGrid] = useState(false);

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
        pageFontFamily: draft.pageFontFamily,
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
      if (!isProfileBlockDeleteKey(event) || !selectedBlockId) return;
      if (isEditableInputFocused()) return;

      event.preventDefault();

      setDraft((current) => {
        if (!current) return current;
        return {
          ...current,
          blocks: current.blocks.filter((block) => block.id !== selectedBlockId)
        };
      });
      setSelectedBlockId(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedBlockId]);

  const updateBlock = useCallback(
    (blockId: string, updater: (block: APIProfileBlock) => APIProfileBlock) => {
      setDraft((current) => {
        if (!current) return current;
        return {
          ...current,
          blocks: current.blocks.map((block) =>
            block.id === blockId ? updater(block) : block
          )
        };
      });
    },
    []
  );

  const openBlockContextMenu = useCallback(
    (event: React.MouseEvent, blockId: string) => {
      blockMenuTargetRef.current = blockId;
      setSelectedBlockId(blockId);
      openContextMenu(event, { type: "custom", id: PROFILE_BLOCK_MENU_ID });
    },
    [openContextMenu]
  );

  const alignMenuBlock = useCallback(
    (axis: "horizontal" | "vertical") => {
      const blockId = blockMenuTargetRef.current;
      if (!blockId) return;

      updateBlock(blockId, (block) =>
        axis === "horizontal"
          ? alignBlockHorizontally(block)
          : alignBlockVertically(block)
      );
    },
    [updateBlock]
  );

  const snapMenuBlock = useCallback(() => {
    const blockId = blockMenuTargetRef.current;
    if (!blockId) return;
    updateBlock(blockId, snapBlockToGrid);
  }, [updateBlock]);

  const addBlock = (
    type: ProfileBlockType,
    point?: { x: number; y: number }
  ) => {
    if (!draft) return;
    let nextBlocks = addBlockAtPoint(draft.blocks, type, canvasRect, point);
    if (snapToGrid) {
      const added = nextBlocks[nextBlocks.length - 1];
      nextBlocks = [
        ...nextBlocks.slice(0, -1),
        snapBlockToGrid(added)
      ];
    }
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
      ? getDropPoint(translated, event.over.rect, viewportScaleRef.current)
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
            overflow="hidden"
          >
            <ProfileEditorCanvas
                profile={profile}
                user={account}
                blocks={draft.blocks}
                selectedBlockId={selectedBlockId}
                backgroundColorOverride={draft.backgroundColor}
                backgroundImageOverride={draft.backgroundImage}
                pageFontFamilyOverride={draft.pageFontFamily}
                bioOverride={draft.bio}
                bannerOverride={draft.banner}
                snapToGrid={snapToGrid}
                zoom={zoom}
                onCanvasRectChange={setCanvasRect}
                onViewportScaleChange={(scale) => {
                  viewportScaleRef.current = scale;
                }}
                onBlocksChange={(blocks) => setDraft({ ...draft, blocks })}
                onSelectBlock={setSelectedBlockId}
                onBlockContextMenu={openBlockContextMenu}
                introMusic={draftIntroMusic}
              />
            <ProfileEditorZoomControls
              zoom={zoom}
              fitZoom={fitZoom}
              onZoomChange={setZoom}
              snapToGrid={snapToGrid}
              onSnapToGridChange={setSnapToGrid}
            />
            <ProfileBlockContextMenu
              onAlignHorizontal={() => alignMenuBlock("horizontal")}
              onAlignVertical={() => alignMenuBlock("vertical")}
              onSnapToGrid={snapMenuBlock}
            />
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
