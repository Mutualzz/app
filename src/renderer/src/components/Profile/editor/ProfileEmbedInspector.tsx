import { Button } from "@components/Button";
import { ProfileInspectorField } from "@components/Profile/editor/ProfileInspectorField";
import {
  getEmbedKindForUrl,
  getIframeEmbedUrl
} from "@components/Profile/shared/profileEmbed.utils";
import {
  PROFILE_EMBED_IFRAME_KINDS,
  type APIProfileBlock,
  type ProfileEmbedBlock
} from "@mutualzz/types";
import { Input, Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  block: ProfileEmbedBlock;
  updateSelectedBlock: (patch: Partial<APIProfileBlock>) => void;
}

export const ProfileEmbedInspector = observer(
  ({ block, updateSelectedBlock }: Props) => {
    const { t } = useTranslation("settings");
    const url = block.url ?? "";
    const showMismatch =
      url.trim().length > 0 && !getIframeEmbedUrl(block.kind, url);

    return (
      <Stack direction="column" spacing={2}>
        <ProfileInspectorField label={t("profile.inspector.embed.kind")}>
          <div
            css={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 6
            }}
          >
            {PROFILE_EMBED_IFRAME_KINDS.map((kind) => {
              const selected = block.kind === kind;
              return (
                <Button
                  key={kind}
                  size="sm"
                  color={selected ? "primary" : "neutral"}
                  aria-pressed={selected}
                  onClick={() => updateSelectedBlock({ kind })}
                >
                  {t(`profile.embed.kinds.${kind}`)}
                </Button>
              );
            })}
          </div>
        </ProfileInspectorField>

        <ProfileInspectorField
          label={t("profile.inspector.embed.url")}
          hint={t("profile.inspector.embed.urlHint")}
        >
          <Input
            size="sm"
            value={url}
            placeholder="https://"
            onChange={(event) => {
              const nextUrl = event.target.value;
              const detectedKind = getEmbedKindForUrl(nextUrl.trim());
              updateSelectedBlock({
                url: nextUrl || null,
                ...(detectedKind ? { kind: detectedKind } : {})
              });
            }}
          />
          {showMismatch && (
            <Typography level="body-xs" color="danger">
              {t("profile.inspector.embed.mismatch", {
                kind: t(`profile.embed.kinds.${block.kind}`)
              })}
            </Typography>
          )}
        </ProfileInspectorField>
      </Stack>
    );
  }
);
