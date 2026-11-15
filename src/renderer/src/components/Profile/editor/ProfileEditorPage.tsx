import { Button } from "@components/Button";
import { ProfileBlockInspector } from "@components/Profile/editor/ProfileBlockInspector";
import {
  type ProfileEditorLeftPanel,
  ProfileEditorRail
} from "@components/Profile/editor/ProfileEditorRail";
import { ProfileEditorSidePanel } from "@components/Profile/editor/ProfileEditorSidePanel";
import { ProfileLayersPanel } from "@components/Profile/editor/ProfileLayersPanel";
import {
  PROFILE_VERSIONS_QUERY_KEY,
  ProfileVersionHistoryPanel
} from "@components/Profile/editor/ProfileVersionHistoryPanel";
import { ProfileBlockPalette } from "@components/Profile/editor/ProfileBlockPalette";
import { getDraftProfileMusic } from "@components/Profile/shared/profileMusicPlayer.utils";
import { ProfileLeaveConfirm } from "@components/Profile/editor/ProfileLeaveConfirm";
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
  ProfileEditorToolbar,
  type ProfileEditorViewMode
} from "@components/Profile/editor/ProfileEditorToolbar";
import { ProfileEditorPagePreview } from "@components/Profile/editor/ProfileEditorPagePreview";
import { UserProfilePopout } from "@components/Profile/popout/UserProfilePopout";
import {
  createDraftFromProfile,
  createEmptyDraft,
  getApiErrorMessage,
  getDropPoint,
  getNudgeDirection,
  isEditableInputFocused,
  isProfileBlockDeleteKey,
  isProfileCopyKey,
  isProfileDuplicateKey,
  isProfileGroupKey,
  isProfileUngroupKey,
  isProfilePasteKey,
  isProfileRedoKey,
  isProfileUndoKey,
  prepareBlocksForSave,
  validateDraftForSave,
  type ProfileDraftState
} from "@components/Profile/editor/utils/profileEditor.utils";
import type { CanvasRect } from "@components/Profile/viewer/profileLayout.utils";
import {
  canGroupSelection,
  canUngroupSelection,
  expandSelectionToGroups,
  groupBlocks,
  ungroupBlocks
} from "@components/Profile/editor/utils/profileBlockGroups.utils";
import {
  alignBlockHorizontally,
  alignBlockVertically,
  snapBlockToGrid
} from "@components/Profile/viewer/profileLayout.utils";
import { useAppStore } from "@hooks/useStores";
import type {
  ProfileBlockType,
  APIProfileBlock,
  APIUserProfileVersion
} from "@mutualzz/types";
import { Box, Stack } from "@mutualzz/ui-web";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { navigateToResumeRoute } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Loading from "@components/Loader/Loading";
import { useModal } from "@contexts/Modal.context";
import { useMenu } from "@contexts/ContextMenu.context";
import { useProfileDraftHistory } from "./utils/useProfileDraftHistory";
import {
  alignBlocks,
  createBlockCopies,
  distributeBlocks,
  nudgeBlocks,
  type BlockAlignment,
  type BlockDistribution
} from "./utils/profileBlockArrange.utils";
import { contextMenu } from "@mutualzz/contexify";

export const ProfileEditorPage = observer(() => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const account = app.account;
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { openModal } = useModal();
  const { openContextMenu, clearMenu } = useMenu();
  const queryClient = useQueryClient();
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

  const { draft, setDraft, resetDraft, undo, redo, canUndo, canRedo } =
    useProfileDraftHistory(() => {
      if (!profile) return null;
      return (
        app.profiles.getPreviewDraft(profile.userId) ??
        createDraftFromProfile(profile)
      );
    });
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const viewportScaleRef = useRef(1);
  const [canvasRect, setCanvasRect] = useState<CanvasRect>({
    width: 0,
    height: 0
  });
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(0.88);
  const fitZoomRef = useRef(0.88);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridStep, setGridStep] = useState(4);
  const [panelsVisible, setPanelsVisible] = useState(true);
  const [viewMode, setViewMode] = useState<ProfileEditorViewMode>("edit");
  const isEditing = viewMode === "edit";
  const showPanels = panelsVisible && isEditing;
  const [leftPanel, setLeftPanel] = useState<ProfileEditorLeftPanel | null>(
    null
  );
  const clipboardRef = useRef<APIProfileBlock[]>([]);

  useEffect(() => {
    if (!profile) return;
    const preview = app.profiles.getPreviewDraft(profile.userId);
    resetDraft(preview ?? createDraftFromProfile(profile));
    setSelectedBlockIds([]);
  }, [profile?.userId]);

  const isEditorReady = !!account && !isLoading && !!profile && !!draft;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateFitZoom = () => {
      const { width, height } = el.getBoundingClientRect();
      const nextFit = computeProfileEditorFitZoom(width, height);
      const previousFit = fitZoomRef.current;
      fitZoomRef.current = nextFit;
      setFitZoom(nextFit);

      if (!hasInitializedZoom.current) {
        hasInitializedZoom.current = true;
        setZoom(nextFit);
        return;
      }

      setZoom((current) => (current === previousFit ? nextFit : current));
    };

    updateFitZoom();
    const observer = new ResizeObserver(updateFitZoom);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isEditorReady]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const draftRef = useRef(draft);
  draftRef.current = draft;
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const leaveEditor = useCallback(() => {
    if (canGoBack) router.history.back();
    else navigateToResumeRoute(app, navigate);
  }, [canGoBack, router, app, navigate]);

  const handleBack = useCallback(() => {
    const d = draftRef.current;
    const p = profileRef.current;
    const isDirty =
      d && p
        ? JSON.stringify(d) !== JSON.stringify(createDraftFromProfile(p))
        : false;

    if (isDirty) {
      openModal(
        "profile-leave",
        <ProfileLeaveConfirm onConfirm={leaveEditor} />
      );
    } else {
      leaveEditor();
    }
  }, [openModal, leaveEditor]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      const d = draftRef.current;
      const p = profileRef.current;
      if (d && p) {
        const isDirty =
          JSON.stringify(d) !== JSON.stringify(createDraftFromProfile(p));
        if (isDirty) {
          e.preventDefault();
          e.returnValue = "";
        }
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const selectedBlock =
    selectedBlockIds.length === 1
      ? (draft?.blocks.find((block) => block.id === selectedBlockIds[0]) ??
        null)
      : null;

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
        pronouns: draft.pronouns.trim() || null,
        banner: draft.banner,
        backgroundColor: draft.backgroundColor,
        backgroundImage: draft.backgroundImage,
        backgroundImageFit: draft.backgroundImageFit,
        pageFontFamily: draft.pageFontFamily,
        theme: draft.theme,
        displayNameStyle: draft.displayNameStyle,
        profileMusicUrl: draft.profileMusicTrackId
          ? null
          : draft.profileMusicUrl,
        profileMusicTrackId: draft.profileMusicTrackId,
        profileMusicTrackSource: draft.profileMusicTrackId
          ? draft.profileMusicTrackSource
          : null,
        profileMusicTitle: draft.profileMusicTrackId
          ? null
          : draft.profileMusicTitle,
        profileMusicAuthorName: draft.profileMusicTrackId
          ? null
          : draft.profileMusicAuthorName,
        blocks,
        mobileBlocks: profileRef.current?.mobileBlocks ?? []
      });
    },
    onSuccess: (result) => {
      if (result) {
        resetDraft(createDraftFromProfile(result));
      }
      void queryClient.invalidateQueries({
        queryKey: [PROFILE_VERSIONS_QUERY_KEY, account?.id]
      });
      toast.success(t("profile.editor.profileSaved"));
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, t("profile.editor.failedSaveProfile"))
      )
  });

  const restoreVersion = useCallback(
    (version: APIUserProfileVersion) => {
      setDraft(createDraftFromProfile(version.profile));
      setSelectedBlockIds([]);
      toast.success(t("profile.history.restored"));
    },
    [setDraft, t]
  );

  const handleProfileReset = useCallback(() => {
    setDraft(createEmptyDraft());
    setSelectedBlockIds([]);
  }, []);

  const openResetModal = useCallback(() => {
    openModal(
      "profile-reset",
      <ProfileResetConfirm onSuccess={handleProfileReset} />
    );
  }, [openModal, handleProfileReset]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isProfileBlockDeleteKey(event) || selectedBlockIds.length === 0)
        return;
      if (!isEditing || isEditableInputFocused()) return;

      event.preventDefault();

      setDraft((current) => {
        if (!current) return current;
        return {
          ...current,
          blocks: current.blocks.filter(
            (block) => !selectedBlockIds.includes(block.id)
          )
        };
      });
      setSelectedBlockIds([]);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedBlockIds, setDraft, isEditing]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableInputFocused()) return;

      if (isProfileUndoKey(event)) {
        event.preventDefault();
        undo();
      } else if (isProfileRedoKey(event)) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  const insertBlockCopies = useCallback(
    (sourceBlocks: APIProfileBlock[]) => {
      if (!draft || sourceBlocks.length === 0) return [];

      const copies = createBlockCopies(draft.blocks, sourceBlocks);
      if (copies.length === 0) return [];

      setDraft({ ...draft, blocks: [...draft.blocks, ...copies] });
      setSelectedBlockIds(copies.map((block) => block.id));
      return copies;
    },
    [draft, setDraft]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!draft || !isEditing || isEditableInputFocused()) return;

      const selectedBlocks = draft.blocks.filter((block) =>
        selectedBlockIds.includes(block.id)
      );

      if (isProfileCopyKey(event)) {
        if (selectedBlocks.length === 0) return;
        event.preventDefault();
        clipboardRef.current = selectedBlocks;
        return;
      }

      if (isProfilePasteKey(event)) {
        if (clipboardRef.current.length === 0) return;
        event.preventDefault();
        const copies = insertBlockCopies(clipboardRef.current);
        if (copies.length > 0) clipboardRef.current = copies;
        return;
      }

      if (isProfileUngroupKey(event)) {
        if (selectedBlocks.length === 0) return;
        event.preventDefault();
        setDraft({
          ...draft,
          blocks: ungroupBlocks(draft.blocks, selectedBlockIds)
        });
        return;
      }

      if (isProfileGroupKey(event)) {
        if (selectedBlocks.length < 2) return;
        event.preventDefault();
        setDraft({
          ...draft,
          blocks: groupBlocks(draft.blocks, selectedBlockIds)
        });
        return;
      }

      if (isProfileDuplicateKey(event)) {
        if (selectedBlocks.length === 0) return;
        event.preventDefault();
        insertBlockCopies(selectedBlocks);
        return;
      }

      const direction = getNudgeDirection(event);
      if (!direction || selectedBlocks.length === 0 || canvasRect.width <= 0)
        return;

      event.preventDefault();
      const step = snapToGrid
        ? gridStep
        : ((event.shiftKey ? 20 : 4) / canvasRect.width) * 100;

      setDraft((current) => {
        if (!current) return current;
        const blocks = nudgeBlocks(
          current.blocks,
          selectedBlockIds,
          direction.x * step,
          direction.y * step
        );
        return blocks === current.blocks ? current : { ...current, blocks };
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    draft,
    selectedBlockIds,
    insertBlockCopies,
    snapToGrid,
    gridStep,
    canvasRect,
    setDraft,
    isEditing
  ]);

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

  const alignSelection = useCallback(
    (alignment: BlockAlignment) => {
      setDraft(
        (current) =>
          current && {
            ...current,
            blocks: alignBlocks(
              current.blocks,
              selectedBlockIds,
              alignment,
              canvasRect
            )
          }
      );
    },
    [setDraft, selectedBlockIds, canvasRect]
  );

  const distributeSelection = useCallback(
    (distribution: BlockDistribution) => {
      setDraft(
        (current) =>
          current && {
            ...current,
            blocks: distributeBlocks(
              current.blocks,
              selectedBlockIds,
              distribution,
              canvasRect
            )
          }
      );
    },
    [setDraft, selectedBlockIds, canvasRect]
  );

  const groupSelection = useCallback(() => {
    setDraft(
      (current) =>
        current && {
          ...current,
          blocks: groupBlocks(current.blocks, selectedBlockIds)
        }
    );
  }, [setDraft, selectedBlockIds]);

  const ungroupSelection = useCallback(() => {
    setDraft(
      (current) =>
        current && {
          ...current,
          blocks: ungroupBlocks(current.blocks, selectedBlockIds)
        }
    );
  }, [setDraft, selectedBlockIds]);

  const alignMenuSelection = useCallback(
    (alignment: BlockAlignment) => {
      alignSelection(alignment);
      clearMenu();
    },
    [alignSelection, clearMenu]
  );

  const distributeMenuSelection = useCallback(
    (distribution: BlockDistribution) => {
      distributeSelection(distribution);
      clearMenu();
    },
    [distributeSelection, clearMenu]
  );

  const openBlockContextMenu = useCallback(
    (event: React.MouseEvent, blockId: string) => {
      blockMenuTargetRef.current = blockId;
      setSelectedBlockIds((current) =>
        current.includes(blockId)
          ? current
          : expandSelectionToGroups([blockId], draft?.blocks ?? [])
      );
      openContextMenu(event, { type: "custom", id: PROFILE_BLOCK_MENU_ID });
    },
    [openContextMenu, draft]
  );

  const closeBlockMenu = useCallback(() => {
    contextMenu.hideAll();
    clearMenu();
  }, [clearMenu]);

  const groupMenuSelection = useCallback(() => {
    groupSelection();
    closeBlockMenu();
  }, [groupSelection, closeBlockMenu]);

  const ungroupMenuSelection = useCallback(() => {
    ungroupSelection();
    closeBlockMenu();
  }, [ungroupSelection, closeBlockMenu]);

  const alignMenuBlock = useCallback(
    (axis: "horizontal" | "vertical") => {
      const blockId = blockMenuTargetRef.current;
      if (!blockId) return;

      updateBlock(blockId, (block) =>
        axis === "horizontal"
          ? alignBlockHorizontally(block)
          : alignBlockVertically(block, canvasRect)
      );
      clearMenu();
    },
    [updateBlock, canvasRect]
  );

  const snapMenuBlock = useCallback(() => {
    const blockId = blockMenuTargetRef.current;
    if (!blockId) return;
    updateBlock(blockId, (block) => snapBlockToGrid(block, gridStep));
    closeBlockMenu();
  }, [updateBlock, gridStep, closeBlockMenu]);

  const deleteMenuBlock = useCallback(() => {
    const blockId = blockMenuTargetRef.current;
    if (!blockId) return;

    const idsToDelete = selectedBlockIds.includes(blockId)
      ? selectedBlockIds
      : [blockId];

    setDraft(
      (current) =>
        current && {
          ...current,
          blocks: current.blocks.filter(
            (block) => !idsToDelete.includes(block.id)
          )
        }
    );
    setSelectedBlockIds((current) =>
      current.filter((selectedId) => !idsToDelete.includes(selectedId))
    );
    blockMenuTargetRef.current = null;
    clearMenu();
  }, [selectedBlockIds, setDraft, clearMenu]);

  const duplicateMenuBlock = useCallback(() => {
    const blockId = blockMenuTargetRef.current;
    if (!blockId || !draft) return;

    const idsToCopy = selectedBlockIds.includes(blockId)
      ? selectedBlockIds
      : [blockId];

    insertBlockCopies(
      draft.blocks.filter((block) => idsToCopy.includes(block.id))
    );
    closeBlockMenu();
  }, [draft, selectedBlockIds, insertBlockCopies, closeBlockMenu]);

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
        snapBlockToGrid(added, gridStep)
      ];
    }
    const added = nextBlocks[nextBlocks.length - 1];
    setDraft({ ...draft, blocks: nextBlocks });
    setSelectedBlockIds([added.id]);
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

  if (!isEditorReady) {
    return <Loading />;
  }

  const draftProfileMusic = getDraftProfileMusic(draft, profile);

  const blockPanelTitle =
    selectedBlockIds.length > 1
      ? t("profile.inspector.arrange.selectedCount", {
          count: selectedBlockIds.length
        })
      : selectedBlock
        ? t(`profile.blocks.${selectedBlock.type}`)
        : t("profile.inspector.selectedBlock");

  const canGroup = canGroupSelection(draft.blocks, selectedBlockIds);
  const canUngroup = canUngroupSelection(draft.blocks, selectedBlockIds);

  const inspectorProps = {
    canGroup,
    canUngroup,
    onGroup: groupSelection,
    onUngroup: ungroupSelection,
    profile,
    draft,
    selectedBlock,
    selectedBlockCount: selectedBlockIds.length,
    selectedBlockIds,
    onAlignSelection: alignSelection,
    onDistributeSelection: distributeSelection,
    onDraftChange: (patch: Partial<ProfileDraftState>) =>
      setDraft({ ...draft, ...patch }),
    onBlocksChange: (blocks: APIProfileBlock[]) =>
      setDraft({ ...draft, blocks }),
    onSelectBlock: (blockId: string | null) =>
      setSelectedBlockIds(blockId ? [blockId] : [])
  };

  const titleBarActions = (
    <Stack direction="row" spacing={1}>
      <Button
        color="neutral"
        size="sm"
        onClick={() => {
          app.profiles.clearPreviewDraft();
          setDraft(createDraftFromProfile(profile));
          setSelectedBlockIds([]);
        }}
      >
        {t("profile.editor.discard")}
      </Button>
      <Button color="danger" size="sm" onClick={openResetModal}>
        {t("profile.editor.resetToEmpty")}
      </Button>
      <Button
        color="primary"
        size="sm"
        loading={saving}
        onClick={() => saveProfile()}
      >
        {tCommon("save")}
      </Button>
    </Stack>
  );

  return (
    <ProfileLayout
      title={t("profile.customizeProfile")}
      actions={titleBarActions}
      backLabel={t("profile.close")}
      onBack={handleBack}
      music={draftProfileMusic}
      musicProfile={profile}
    >
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <Stack
          direction="row"
          spacing={1}
          p={1}
          width="100%"
          height="100%"
          minHeight={0}
          minWidth={0}
        >
          {showPanels && (
            <ProfileEditorRail
              activePanel={leftPanel}
              onActivePanelChange={setLeftPanel}
            />
          )}

          {showPanels && leftPanel === "add" && (
            <ProfileEditorSidePanel
              title={t("profile.inspector.rail.add")}
              description={t("profile.inspector.rail.addHint")}
              onClose={() => setLeftPanel(null)}
            >
              <ProfileBlockPalette
                onDoubleClickAdd={(type) => addBlock(type)}
              />
            </ProfileEditorSidePanel>
          )}

          {showPanels && leftPanel === "layers" && (
            <ProfileEditorSidePanel
              title={t("profile.inspector.rail.layers")}
              description={t("profile.inspector.rail.layersHint")}
              onClose={() => setLeftPanel(null)}
            >
              <ProfileLayersPanel
                blocks={draft.blocks}
                selectedBlockIds={selectedBlockIds}
                onBlocksChange={(blocks) => setDraft({ ...draft, blocks })}
                onSelectionChange={setSelectedBlockIds}
              />
            </ProfileEditorSidePanel>
          )}

          {showPanels && leftPanel === "page" && (
            <ProfileEditorSidePanel
              title={t("profile.inspector.rail.page")}
              description={t("profile.inspector.rail.pageHint")}
              onClose={() => setLeftPanel(null)}
            >
              <ProfileBlockInspector mode="page" {...inspectorProps} />
            </ProfileEditorSidePanel>
          )}

          {showPanels && leftPanel === "history" && (
            <ProfileEditorSidePanel
              title={t("profile.inspector.rail.history")}
              description={t("profile.inspector.rail.historyHint")}
              onClose={() => setLeftPanel(null)}
            >
              <ProfileVersionHistoryPanel onRestore={restoreVersion} />
            </ProfileEditorSidePanel>
          )}

          <Stack
            direction="column"
            spacing={1}
            flex={1}
            height="100%"
            minHeight={0}
            minWidth={0}
          >
            <ProfileEditorToolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              panelsVisible={panelsVisible}
              setPanelsVisible={setPanelsVisible}
              zoom={zoom}
              fitZoom={fitZoom}
              onZoomChange={setZoom}
              snapToGrid={snapToGrid}
              onSnapToGridChange={setSnapToGrid}
              gridStep={gridStep}
              onGridStepChange={setGridStep}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
            />

            <Box
              ref={viewportRef}
              flex={1}
              minHeight={0}
              minWidth={0}
              position="relative"
              overflow="hidden"
            >
              {viewMode === "page" && (
                <ProfileEditorPagePreview
                  profile={profile}
                  user={account}
                  draft={draft}
                  zoom={zoom}
                />
              )}

              {viewMode === "popout" && (
                <Stack
                  width="100%"
                  height="100%"
                  p={2}
                  css={{ overflowY: "auto" }}
                >
                  <Box css={{ margin: "auto" }}>
                    <UserProfilePopout user={account} preview={draft} />
                  </Box>
                </Stack>
              )}

              {isEditing && (
                <ProfileEditorCanvas
                  profile={profile}
                  user={account}
                  blocks={draft.blocks}
                  selectedBlockIds={selectedBlockIds}
                  backgroundColorOverride={draft.backgroundColor}
                  backgroundImageOverride={draft.backgroundImage}
                  backgroundImageFitOverride={draft.backgroundImageFit}
                  pageFontFamilyOverride={draft.pageFontFamily}
                  themeOverride={draft.theme}
                  displayNameStyleOverride={draft.displayNameStyle}
                  bioOverride={draft.bio}
                  pronounsOverride={draft.pronouns}
                  bannerOverride={draft.banner}
                  snapToGrid={snapToGrid}
                  gridStep={gridStep}
                  zoom={zoom}
                  onCanvasRectChange={setCanvasRect}
                  onViewportScaleChange={(scale) => {
                    viewportScaleRef.current = scale;
                  }}
                  onBlocksChange={(blocks) => setDraft({ ...draft, blocks })}
                  onSelectionChange={setSelectedBlockIds}
                  onBlockContextMenu={openBlockContextMenu}
                />
              )}

              {showPanels && selectedBlockIds.length > 0 && (
                <Box
                  position="absolute"
                  top={8}
                  right={8}
                  bottom={8}
                  css={{ zIndex: 2 }}
                >
                  <ProfileEditorSidePanel
                    title={blockPanelTitle}
                    description={
                      selectedBlockIds.length > 1
                        ? t("profile.inspector.rail.multipleHint")
                        : t("profile.inspector.rail.blockHint")
                    }
                    onClose={() => setSelectedBlockIds([])}
                  >
                    <ProfileBlockInspector mode="block" {...inspectorProps} />
                  </ProfileEditorSidePanel>
                </Box>
              )}
            </Box>
          </Stack>
        </Stack>

        <ProfileBlockContextMenu
          selectedCount={selectedBlockIds.length}
          onAlignHorizontal={() => alignMenuBlock("horizontal")}
          onAlignVertical={() => alignMenuBlock("vertical")}
          onSnapToGrid={snapMenuBlock}
          onAlignSelection={alignMenuSelection}
          onDistributeSelection={distributeMenuSelection}
          canGroup={canGroup}
          canUngroup={canUngroup}
          onGroup={groupMenuSelection}
          onUngroup={ungroupMenuSelection}
          onDuplicate={duplicateMenuBlock}
          onDelete={deleteMenuBlock}
        />
      </DndContext>
    </ProfileLayout>
  );
});
