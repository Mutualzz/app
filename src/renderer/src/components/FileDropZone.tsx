import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { ComponentProps } from "react";
import { DragEvent, ReactNode, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type StackProps = ComponentProps<typeof Stack>;

interface Props extends Omit<StackProps, "onDrop" | "onDragEnter" | "onDragLeave" | "onDragOver" | "children"> {
  enabled?: boolean;
  onDropFiles: (files: FileList | File[]) => void;
  children: ReactNode;
}

export function FileDropZone({
  enabled = true,
  onDropFiles,
  children,
  ...stackProps
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation("chat");
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragCounterRef = useRef(0);

  const onDragEnter = (e: DragEvent) => {
    if (!enabled) return;
    if (![...e.dataTransfer.types].includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDraggingFiles(true);
  };

  const onDragLeave = (e: DragEvent) => {
    if (!enabled) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingFiles(false);
    }
  };

  const onDragOver = (e: DragEvent) => {
    if (!enabled) return;
    if (![...e.dataTransfer.types].includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (e: DragEvent) => {
    if (!enabled) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDraggingFiles(false);
    onDropFiles(e.dataTransfer.files);
  };

  return (
    <Stack
      position="relative"
      {...stackProps}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
      {isDraggingFiles && (
        <Stack
          alignItems="center"
          justifyContent="center"
          css={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            borderRadius: 6,
            border: `2px dashed ${theme.typography.colors.accent}`,
            background: `${theme.colors.background}cc`,
            pointerEvents: "none"
          }}
        >
          <Typography level="body-md" fontWeight="semiBold" textColor="accent">
            {t("composer.dropFiles")}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
