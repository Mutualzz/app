import { observer } from "mobx-react-lite";
import { Divider, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { Button } from "@components/Button";
import { useAppStore } from "@hooks/useStores";
import { type ChangeEvent, useRef, useState } from "react";
import { Snowflake } from "@mutualzz/client";
import { ExpressionType } from "@mutualzz/types";
import { generateHash } from "@utils/index";
import { useModal } from "@contexts/Modal.context";
import { Paper } from "@components/Paper";
import type { Expression } from "@stores/objects/Expression";
import { AnimatedStack } from "@components/Animated/AnimatedStack";
import { dynamicElevation } from "@mutualzz/ui-core";
import { IconButton } from "@components/IconButton";
import { TrashIcon } from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";
import { ExpressionEditor } from "@renderer/components/Expression/ExpressionEditor";
import { useTranslation } from "react-i18next";

const StickerItem = observer(({ expression }: { expression: Expression }) => {
  const { t } = useTranslation("settings");
  const { theme } = useTheme();

  const [hover, setHover] = useState(false);

  return (
    <AnimatedStack
      flex={1}
      direction="row"
      alignItems="center"
      whileHover={{
        background: dynamicElevation(theme.colors.surface, 5)
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      p="1rem"
    >
      <Stack direction="row" spacing={6.5} alignItems="center">
        <img
          alt={expression.id}
          src={expression.url}
          css={{
            width: 32,
            height: 32
          }}
        />
        :{expression.name}:
      </Stack>

      <Stack flex={1} justifyContent="flex-end">
        {hover && (
          <Stack gap={1.25}>
            <Tooltip content={t("expressions.delete")}>
              <IconButton
                onClick={() => expression.delete()}
                size="sm"
                color="danger"
              >
                <TrashIcon weight="fill" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>
    </AnimatedStack>
  );
});

const UserStickersTab = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { openModal } = useModal();

  const stickers = app.expressions.stickers
    .filter((em) => em.authorId === app.account?.id)
    .filter((em) => !em.spaceId);

  const staticStickers = stickers.filter((e) => !e.animated);
  const animatedStickers = stickers.filter((e) => e.animated);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();

    const animated = file.type.includes("gif");
    const hash = await generateHash(buffer, animated);

    const sticker = {
      id: Snowflake.generate(),
      type: ExpressionType.Sticker,
      name: file.name.split(".")[0],
      assetHash: hash,
      spaceId: null,
      authorId: app.account!.id,
      animated,
      flags: 0n,
      createdAt: new Date()
    };

    openModal(
      "expression-editor",
      <ExpressionEditor expression={sticker} file={file} />
    );
  };

  return (
    <Stack direction="column" spacing={2.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="column">
          <Typography color="warning" variant="plain">
            {t("expressions.stickerLimitDesktop")}
          </Typography>
          <Typography textColor="muted" level="body-sm" mb={1.25}>
            {t("expressions.slotsAvailable", { count: 100 - stickers.length })}
          </Typography>
        </Stack>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/gif,image/png,image/jpeg,image/webp"
          onChange={handleUpload}
          multiple={false}
          css={{
            display: "none"
          }}
        />
        <Button
          color="success"
          onClick={() => fileInputRef.current?.click()}
          css={{
            marginRight: 16
          }}
          disabled={stickers.length === 100}
        >
          {t("expressions.uploadSticker")}
        </Button>
      </Stack>

      {staticStickers.length > 0 && (
        <Paper
          borderRadius={12}
          variant="outlined"
          direction="column"
          maxHeight={300}
          overflowY="auto"
          width={600}
        >
          <Typography level="body-lg" ml={2.5} my={2.5}>
            {t("expressions.stickers")}
          </Typography>

          <Divider
            lineColor="muted"
            css={{
              opacity: 0.5
            }}
          />

          <Stack mb={2.5} spacing={5} direction="row" mt={2.5} pl={2.5}>
            <Typography>{t("expressions.image")}</Typography>
            <Typography flex={1}>{t("expressions.name")}</Typography>
          </Stack>
          <Stack direction="column">
            {staticStickers.map((expression) => (
              <StickerItem key={expression.id} expression={expression} />
            ))}
          </Stack>
        </Paper>
      )}

      {animatedStickers.length > 0 && (
        <Paper
          borderRadius={12}
          variant="outlined"
          direction="column"
          maxHeight={300}
          overflowY="auto"
          width={600}
        >
          <Typography level="body-lg" ml={2.5} my={2.5}>
            {t("expressions.animatedStickers")}
          </Typography>

          <Divider
            lineColor="muted"
            css={{
              opacity: 0.5
            }}
          />

          <Stack mb={2.5} spacing={5} direction="row" mt={2.5} pl={2.5}>
            <Typography>{t("expressions.image")}</Typography>
            <Typography flex={1}>{t("expressions.name")}</Typography>
          </Stack>
          <Stack direction="column">
            {animatedStickers.map((expression) => (
              <StickerItem key={expression.id} expression={expression} />
            ))}
          </Stack>
        </Paper>
      )}

      {stickers.length === 0 && (
        <Stack justifyContent="center" alignItems="center" py="4rem">
          <Typography textAlign="center" textColor="muted">
            {t("expressions.noStickers")}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
});

export default UserStickersTab;
