import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import type { AvatarEditorContentProps } from "@components/Avatar/avatarEditor.types";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import type { ColorLike } from "@mutualzz/ui-core";
import {
  Button,
  ButtonGroup,
  Divider,
  InputColor,
  InputNumber,
  Option,
  Select,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { EraserIcon, PaintBrushIcon } from "@phosphor-icons/react";
import { useMediaQuery } from "@react-hookz/web";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef
} from "react-sketch-canvas";

const EMBEDDED_CANVAS_PX = 360;

export const AvatarDraw = observer(
  ({ variant = "modal", onSuccess }: AvatarEditorContentProps) => {
    const { t } = useTranslation("settings");
    const { t: tCommon } = useTranslation("common");
    const { theme } = useTheme();
    const app = useAppStore();
    const { closeModal, closeAllModals } = useModal();
    const isEmbedded = variant === "embedded";
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const [brushColor, setBrushColor] = useState<ColorLike>("#000000");
    const [backgroundColor, setBackgroundColor] =
      useState<ColorLike>("#ffffff");

    const isMobile = useMediaQuery(
      theme.breakpoints.down("md").replace("@media", "")
    );

    const [eraserMode, setEraserMode] = useState(false);
    const [emptyCanvas, setEmptyCanvas] = useState(true);

    const [selectedAvatarValue, setSelectedAvatarValue] = useState("");
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(
      null
    );

    const [size, setSize] = useState(6);

    const { mutate: uploadAvatar, isPending } = useMutation({
      mutationKey: ["upload-avatar"],
      mutationFn: async (avatar: string) => {
        const blob = await (await fetch(avatar)).blob();
        const file = new File([blob], "new-avatar.png", {
          type: "image/png"
        });

        const formData = new FormData();
        formData.append("avatar", file);
        return app.rest.patchFormData("@me", formData);
      },
      onSuccess: () => {
        setSelectedAvatarValue("");
        canvasRef.current?.clearCanvas();
        setBrushColor("#000000");
        setBackgroundColor("#ffffff");
        setSize(6);
        setEraserMode(false);
        setEmptyCanvas(true);
        if (selectedAvatarId) app.drafts.deleteAvatarDraft(selectedAvatarId);

        if (isEmbedded) {
          onSuccess?.();
          return;
        }
        closeAllModals();
      }
    });

    const onChange = async () => {
      const time = await canvasRef.current?.getSketchingTime();
      if (!time) return;
      setEmptyCanvas(time === 0);
    };

    const toggleEraser = () => {
      setEraserMode(!eraserMode);
      canvasRef.current?.eraseMode(!eraserMode);
    };

    const save = async () => {
      const pngImage = await canvasRef.current?.exportImage("png");
      if (!pngImage) return;

      uploadAvatar(pngImage);
    };

    const saveDraft = async () => {
      const paths = await canvasRef.current?.exportPaths();
      const image = await canvasRef.current?.exportSvg();
      if (!paths || !image) return;

      app.drafts.saveAvatarDraft(image, paths);
    };

    const selectAvatar = (id: string) => {
      const avatar = app.drafts.getAvatarDraft(id);
      if (!avatar) return;

      canvasRef.current?.clearCanvas();
      canvasRef.current?.loadPaths(avatar.paths);
      setSelectedAvatarId(id);
      setSelectedAvatarValue("");
    };

    const onClose = () => {
      setSelectedAvatarId(null);
      setSelectedAvatarValue("");
      canvasRef.current?.clearCanvas();
      setBrushColor("#000000");
      setBackgroundColor("#ffffff");
      setSize(6);
      setEraserMode(false);
      setEmptyCanvas(true);
      closeModal();
    };

    const clearCanvas = () => {
      setEmptyCanvas(true);
      canvasRef.current?.clearCanvas();
    };

    const savedDraftSelect = (
      <Stack direction="column" spacing={1} width="100%">
        <Typography level="body-xs" fontWeight={600}>
          {t("profile.avatar.draw.savedDrafts")}
        </Typography>
        <Select
          disabled={app.drafts.avatars.size === 0 || isPending}
          placeholder={
            app.drafts.avatars.size > 0
              ? t("profile.avatar.draw.draftsPlaceholder", {
                  count: app.drafts.avatars.size
                })
              : t("profile.avatar.draw.noSavedDrafts")
          }
          onValueChange={(value) => selectAvatar(value.toString())}
          value={selectedAvatarValue}
          size="sm"
        >
          {Array.from(app.drafts.avatars.values()).map((avatar) => (
            <Option variant="plain" key={avatar.id} value={avatar.id}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
              >
                <Typography level="body-sm">{avatar.id}</Typography>
                <img
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(avatar.image)}`}
                  alt={`Avatar ${avatar.id}`}
                  css={{
                    width: 40,
                    height: 40,
                    maxWidth: 40,
                    maxHeight: 40
                  }}
                />
              </Stack>
            </Option>
          ))}
        </Select>
        {selectedAvatarId !== null && (
          <Button
            color="danger"
            variant="outlined"
            size="sm"
            onClick={() => {
              if (selectedAvatarId === null) return;
              app.drafts.deleteAvatarDraft(selectedAvatarId);
              setSelectedAvatarId(null);
              canvasRef.current?.clearCanvas();
            }}
          >
            {t("profile.avatar.draw.deleteDraft")}
          </Button>
        )}
      </Stack>
    );

    const controls = (compact = false) => (
      <Stack direction="column" spacing={1.25} width="100%">
        <Button
          fullWidth
          startDecorator={
            eraserMode ? (
              <EraserIcon weight="fill" />
            ) : (
              <PaintBrushIcon weight="fill" />
            )
          }
          onClick={toggleEraser}
          color="neutral"
          disabled={isPending}
          size={compact ? "sm" : "md"}
        >
          {eraserMode
            ? t("profile.avatar.draw.eraser")
            : t("profile.avatar.draw.brush")}
        </Button>
        <Stack direction="column" spacing={0.5}>
          <Typography level="body-xs">
            {eraserMode
              ? t("profile.avatar.draw.eraserSize")
              : t("profile.avatar.draw.brushSize")}
          </Typography>
          <InputNumber
            disabled={isPending}
            onChange={(e) => setSize(e.target.valueAsNumber)}
            fullWidth
            value={String(size)}
            size={compact ? "sm" : "md"}
          />
        </Stack>
        {!eraserMode && (
          <Stack direction="column" spacing={0.5}>
            <Typography level="body-xs">
              {t("profile.avatar.draw.brushColor")}
            </Typography>
            <InputColor
              disabled={isPending}
              size={compact ? "sm" : "md"}
              value={brushColor}
              fullWidth
              onChange={(color) => setBrushColor(color)}
              showRandom
            />
          </Stack>
        )}
        <Stack direction="column" spacing={0.5}>
          <Typography level="body-sm">
            {t("profile.avatar.draw.backgroundColor")}
          </Typography>
          <InputColor
            size={compact ? "sm" : "md"}
            value={backgroundColor}
            onChange={(color) => setBackgroundColor(color)}
            allowAlpha
            showRandom
            disabled={isPending}
          />
        </Stack>
      </Stack>
    );

    const actionButtons = (orientation: "horizontal" | "vertical") => (
      <ButtonGroup
        spacing={orientation === "horizontal" ? 1 : 10}
        orientation={orientation}
        size={isMobile ? "sm" : "md"}
      >
        <Button
          onClick={clearCanvas}
          color="danger"
          disabled={emptyCanvas || isPending}
        >
          {t("profile.avatar.draw.clear")}
        </Button>
        <ButtonGroup
          disabled={emptyCanvas || isPending}
          color="warning"
          orientation={orientation}
          size={isMobile ? "sm" : "md"}
        >
          <Button onClick={() => canvasRef.current?.undo()}>
            {t("profile.avatar.draw.undo")}
          </Button>
          <Button onClick={() => canvasRef.current?.redo()}>
            {t("profile.avatar.draw.redo")}
          </Button>
        </ButtonGroup>
        <Button
          disabled={emptyCanvas || isPending}
          color="success"
          onClick={() => save()}
        >
          {tCommon("save")}
        </Button>
        <Button
          disabled={emptyCanvas || isPending}
          color="success"
          onClick={() => saveDraft()}
        >
          {t("profile.avatar.draw.saveDraft")}
        </Button>
        {!isEmbedded && (
          <Button color="danger" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
        )}
      </ButtonGroup>
    );

    const sketchCanvas = (canvasSize: string | number) => {
      const canvasDimension =
        typeof canvasSize === "number" ? `${canvasSize}px` : canvasSize;

      return (
        <ReactSketchCanvas
          ref={canvasRef}
          strokeColor={brushColor}
          strokeWidth={size}
          eraserWidth={size}
          canvasColor={backgroundColor}
          onStroke={onChange}
          width={canvasDimension}
          height={canvasDimension}
          svgStyle={{
            borderRadius: "50%"
          }}
          style={{
            borderRadius: "50%"
          }}
          withTimestamp
          readOnly={isPending}
          exportWithBackgroundImage
        />
      );
    };

    if (isEmbedded) {
      return (
        <Stack
          direction="column"
          width="100%"
          height="100%"
          minHeight={0}
          overflow="hidden"
        >
          <Stack direction="row" flex={1} minHeight={0} overflow="hidden">
            <Stack
              width={168}
              minWidth={168}
              flexShrink={0}
              direction="column"
              spacing={1.5}
              p={1.5}
              css={{
                overflowY: "auto",
                borderRight: `1px solid ${theme.colors.neutral}22`
              }}
            >
              {savedDraftSelect}
              <Divider css={{ opacity: 0.25 }} />
              {controls(true)}
            </Stack>

            <Stack
              flex={1}
              minWidth={0}
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              p={2}
            >
              <Stack
                alignItems="center"
                justifyContent="center"
                css={{
                  pointerEvents: isPending ? "none" : "all",
                  filter: isPending ? "blur(4px)" : "none",
                  maxWidth: "100%"
                }}
              >
                {sketchCanvas(EMBEDDED_CANVAS_PX)}
              </Stack>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            p={1.5}
            justifyContent="space-between"
            alignItems="center"
            flexShrink={0}
            css={{
              borderTop: `1px solid ${theme.colors.neutral}22`
            }}
          >
            {actionButtons("horizontal")}
          </Stack>
        </Stack>
      );
    }

    const canvasSize = isMobile ? "256px" : "512px";

    return (
      <AnimatedPaper
        direction={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems="center"
        spacing={5}
        elevation={3}
        width="60vw"
        position="relative"
        p={{ xs: "0.5rem", sm: "1rem", md: "2rem" }}
        borderRadius={{ xs: "1rem", sm: "1.5rem" }}
        overflow="hidden"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <Stack
          direction="column"
          spacing={2.5}
          justifyContent="center"
          alignItems="center"
          minWidth={isMobile ? 200 : 250}
          position={isMobile ? "static" : "absolute"}
          left={isMobile ? undefined : 5}
          top={isMobile ? undefined : 5}
        >
          <Typography>{t("profile.avatar.draw.savedAvatars")}</Typography>
          <Select
            disabled={app.drafts.avatars.size === 0 || isPending}
            placeholder={
              app.drafts.avatars.size > 0
                ? t("profile.avatar.draw.avatarsPlaceholder", {
                    count: app.drafts.avatars.size
                  })
                : t("profile.avatar.draw.noSavedAvatars")
            }
            onValueChange={(value) => selectAvatar(value.toString())}
            value={selectedAvatarValue}
            size={isMobile ? "sm" : "md"}
          >
            {Array.from(app.drafts.avatars.values()).map((avatar) => (
              <Option variant="plain" key={avatar.id} value={avatar.id}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography level="body-sm">{avatar.id}</Typography>
                  <img
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(avatar.image)}`}
                    alt={`Avatar ${avatar.id}`}
                    css={{
                      width: isMobile ? 48 : "100%",
                      height: isMobile ? 48 : "100%",
                      maxWidth: 64,
                      maxHeight: 64
                    }}
                  />
                </Stack>
              </Option>
            ))}
          </Select>
          {selectedAvatarId !== null && (
            <Button
              color="danger"
              variant="outlined"
              onClick={() => {
                if (selectedAvatarId === null) return;
                app.drafts.deleteAvatarDraft(selectedAvatarId);
                setSelectedAvatarId(null);
                canvasRef.current?.clearCanvas();
              }}
              size={isMobile ? "sm" : "md"}
            >
              {t("profile.avatar.draw.deleteSelectedAvatar")}
            </Button>
          )}
        </Stack>
        {!isMobile && (
          <Stack direction="column" alignItems="center" justifyContent="center">
            {controls()}
          </Stack>
        )}
        {isMobile && (
          <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            width="100%"
          >
            {controls(true)}
          </Stack>
        )}
        <Stack position="relative" spacing={2.5} direction="column">
          {sketchCanvas(canvasSize)}
        </Stack>
        {actionButtons(isMobile ? "horizontal" : "vertical")}
      </AnimatedPaper>
    );
  }
);
