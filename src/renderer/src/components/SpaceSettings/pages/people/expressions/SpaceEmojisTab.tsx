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
import { dynamicElevation, formatColor } from "@mutualzz/ui-core";
import { IconButton } from "@components/IconButton";
import type { Space } from "@stores/objects/Space";
import { TrashIcon } from "@phosphor-icons/react";
import { ExpressionEditor } from "@renderer/components/Expression/ExpressionEditor";
import { useTranslation } from "react-i18next";

const EmojiItem = observer(({ expression }: { expression: Expression }) => {
  const app = useAppStore();
  const { theme } = useTheme();

  const [hover, setHover] = useState(false);

  const canManage =
    expression.space?.members.me?.hasPermission("ManageExpressions");
  const ownIt = expression.authorId === app.account?.id;

  return (
    <AnimatedStack
      flex={1}
      direction="row"
      alignItems="center"
      whileHover={{
        background: formatColor(dynamicElevation(theme.colors.surface, 5), {
          alpha: 0.5
        })
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
        <Typography level="label-sm">:{expression.name}:</Typography>
      </Stack>

      <Stack flex={1} justifyContent="flex-end">
        {hover && (canManage || ownIt) && (
          <IconButton
            onClick={() => expression.delete()}
            size="sm"
            color="danger"
          >
            <TrashIcon weight="fill" />
          </IconButton>
        )}
      </Stack>
    </AnimatedStack>
  );
});

interface Props {
  space: Space;
}

const SpaceEmojisTab = observer(({ space }: Props) => {
  const { t } = useTranslation("settings");
  const { t: tSpace } = useTranslation("space");
  const app = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { openModal } = useModal();

  const emojis = Array.from(space.expressions.values()).filter(
    (exp) => exp.type === ExpressionType.Emoji
  );

  const staticEmojis = emojis.filter((e) => !e.animated);
  const animatedEmojis = emojis.filter((e) => e.animated);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();

    const animated = file.type.includes("gif");
    const hash = await generateHash(buffer, animated);

    const emoji = {
      id: Snowflake.generate(),
      type: ExpressionType.Emoji,
      name: file.name.split(".")[0],
      assetHash: hash,
      spaceId: space.id,
      authorId: app.account!.id,
      animated,
      flags: 0n,
      createdAt: new Date()
    };

    openModal(
      "expression-editor",
      <ExpressionEditor expression={emoji} file={file} />
    );
  };

  return (
    <Stack direction="column" spacing={2.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography color="warning" variant="plain">
          {tSpace("expressions.emojiLimit")}
        </Typography>
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
        >
          {t("expressions.uploadEmoji")}
        </Button>
      </Stack>

      {staticEmojis.length > 0 && (
        <Paper
          borderRadius={12}
          variant="outlined"
          direction="column"
          maxHeight={300}
          overflowY="auto"
          width={600}
        >
          <Typography level="body-lg" ml={2.5} my={2.5}>
            {t("expressions.emojis")}
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
            {staticEmojis.map((expression) => (
              <EmojiItem expression={expression} />
            ))}
          </Stack>
        </Paper>
      )}

      {animatedEmojis.length > 0 && (
        <Paper
          borderRadius={12}
          variant="outlined"
          direction="column"
          maxHeight={300}
          overflowY="auto"
          width={600}
        >
          <Typography level="body-lg" ml={2.5} my={2.5}>
            {t("expressions.animatedEmojis")}
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
            {animatedEmojis.map((expression) => (
              <EmojiItem expression={expression} />
            ))}
          </Stack>
        </Paper>
      )}

      {emojis.length === 0 && (
        <Stack justifyContent="center" alignItems="center" py="4rem">
          <Typography textAlign="center" textColor="muted">
            {tSpace("expressions.emptyEmojis")}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
});
export default SpaceEmojisTab;
