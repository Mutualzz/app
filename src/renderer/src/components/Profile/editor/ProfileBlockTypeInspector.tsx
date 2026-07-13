import type { APIProfileBlock } from "@mutualzz/types";
import { Input, Option, Select, Slider, Stack, Typography } from "@mutualzz/ui-web";
import { Button } from "@components/Button";
import { ProfileMarkdownField } from "@components/Profile/editor/ProfileMarkdownField";
import {
  formatProfileUrlLabel,
  resolveProfileUrl,
  shouldAutoUpdateLinkLabel
} from "@components/Profile/shared/profileLink.utils";
import type {
  ProfileActivityBlock,
  ProfileDividerBlock,
  ProfileLinksBlock,
  ProfileMutualBlock,
  ProfileQuoteBlock,
  ProfileRolesBlock
} from "@mutualzz/types";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  block: APIProfileBlock;
  updateSelectedBlock: (patch: Partial<APIProfileBlock>) => void;
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography level="body-xs" fontWeight={700} css={{ opacity: 0.65 }}>
    {children}
  </Typography>
);

const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <Typography level="body-xs" css={{ opacity: 0.55 }}>
    {children}
  </Typography>
);

export const ProfileBlockTypeInspector = observer(
  ({ block, updateSelectedBlock }: Props) => {
    const { t } = useTranslation("settings");

    switch (block.type) {
      case "links": {
        const linksBlock = block as ProfileLinksBlock;
        const links = linksBlock.links.length
          ? linksBlock.links
          : [{ label: "", url: "" }];

        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>{t("profile.blocks.links")}</FieldLabel>
            {links.map((link, index) => {
              const resolved = resolveProfileUrl(link.url);

              return (
              <Stack key={index} direction="column" spacing={0.75}>
                <Input
                  value={link.label}
                  onChange={(event) => {
                    const next = [...links];
                    next[index] = { ...next[index], label: event.target.value };
                    updateSelectedBlock({ links: next });
                  }}
                  placeholder={t("profile.inspector.linkLabel")}
                />
                <Stack direction="row" spacing={0.75}>
                  <Input
                    value={link.url}
                    onChange={(event) => {
                      const url = event.target.value;
                      const detected = resolveProfileUrl(url);
                      const previousUrl = links[index]?.url;
                      const next = [...links];
                      next[index] = {
                        ...next[index],
                        url,
                        label:
                          detected &&
                          shouldAutoUpdateLinkLabel(next[index].label, previousUrl)
                            ? formatProfileUrlLabel(detected)
                            : next[index].label
                      };
                      updateSelectedBlock({ links: next });
                    }}
                    placeholder={t("profile.editor.urlPlaceholder")}
                    css={{ flex: 1 }}
                  />
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => {
                      const next = links.filter((_, i) => i !== index);
                      updateSelectedBlock({
                        links: next.length ? next : [{ label: "", url: "" }]
                      });
                    }}
                  >
                    <TrashIcon />
                  </Button>
                </Stack>
                {resolved && (
                  <Typography level="body-xs" css={{ opacity: 0.6 }}>
                    {t("profile.inspector.detected", {
                      label: formatProfileUrlLabel(resolved),
                    })}
                  </Typography>
                )}
              </Stack>
            );
            })}
            {links.length < 8 && (
              <Button
                size="sm"
                color="neutral"
                startDecorator={<PlusIcon />}
                onClick={() =>
                  updateSelectedBlock({
                    links: [
                      ...links,
                      {
                        label: t("profile.blocks.newLink"),
                        url: "https://example.com"
                      }
                    ]
                  })
                }
              >
                {t("profile.blocks.addLink")}
              </Button>
            )}
          </Stack>
        );
      }

      case "activity":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>{t("profile.blocks.activity")}</FieldLabel>
            <FieldHint>{t("profile.inspector.activityHint")}</FieldHint>
            <Select
              value={
                (block as ProfileActivityBlock).showCustomStatus === false
                  ? "hide"
                  : "show"
              }
              onValueChange={(value) =>
                updateSelectedBlock({
                  showCustomStatus: value !== "hide"
                })
              }
              size="sm"
            >
              <Option value="show">{t("profile.blocks.showCustomStatus")}</Option>
              <Option value="hide">{t("profile.blocks.hideCustomStatus")}</Option>
            </Select>
          </Stack>
        );

      case "roles":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>{t("profile.inspector.maxRoles")}</FieldLabel>
            <Slider
              min={1}
              max={12}
              value={(block as ProfileRolesBlock).maxRoles ?? 6}
              onChange={(_, value) =>
                updateSelectedBlock({ maxRoles: value as number })
              }
              valueLabelDisplay="auto"
            />
            <FieldHint>{t("profile.inspector.rolesHint")}</FieldHint>
          </Stack>
        );

      case "connections":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>{t("profile.blocks.connections")}</FieldLabel>
            <FieldHint>{t("profile.inspector.connectionsHint")}</FieldHint>
          </Stack>
        );

      case "mutual":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>{t("profile.inspector.mutualCardType")}</FieldLabel>
            <Select
              value={(block as ProfileMutualBlock).mode}
              onValueChange={(value) =>
                updateSelectedBlock({
                  mode: (value ?? "spaces") as "spaces" | "friends"
                })
              }
              size="sm"
            >
              <Option value="spaces">{t("profile.blocks.mutualSpaces")}</Option>
              <Option value="friends">{t("profile.blocks.friendsStatus")}</Option>
            </Select>
            <FieldLabel>{t("profile.inspector.maxItems")}</FieldLabel>
            <Slider
              min={1}
              max={12}
              value={(block as ProfileMutualBlock).maxItems ?? 6}
              onChange={(_, value) =>
                updateSelectedBlock({ maxItems: value as number })
              }
              valueLabelDisplay="auto"
            />
          </Stack>
        );

      case "divider":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>{t("profile.inspector.dividerStyle")}</FieldLabel>
            <Select
              value={(block as ProfileDividerBlock).style ?? "line"}
              onValueChange={(value) =>
                updateSelectedBlock({
                  style: (value ?? "line") as ProfileDividerBlock["style"]
                })
              }
              size="sm"
            >
              <Option value="line">{t("profile.blocks.dividerLine")}</Option>
              <Option value="dotted">{t("profile.blocks.dividerDotted")}</Option>
              <Option value="space">{t("profile.blocks.dividerSpacer")}</Option>
            </Select>
          </Stack>
        );

      case "quote":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>{t("profile.blocks.quote")}</FieldLabel>
            <ProfileMarkdownField
              value={(block as ProfileQuoteBlock).content}
              maxLength={1000}
              minHeight={100}
              onChange={(content) => updateSelectedBlock({ content })}
              placeholder={t("profile.widgets.defaults.quoteContent")}
            />
            <FieldLabel>{t("profile.inspector.style")}</FieldLabel>
            <Select
              value={(block as ProfileQuoteBlock).variant ?? "default"}
              onValueChange={(value) =>
                updateSelectedBlock({
                  variant: (value ?? "default") as ProfileQuoteBlock["variant"]
                })
              }
              size="sm"
            >
              <Option value="default">{t("profile.blocks.quoteDefault")}</Option>
              <Option value="accent">{t("profile.blocks.quoteAccent")}</Option>
              <Option value="warning">{t("profile.blocks.quoteWarning")}</Option>
            </Select>
            <FieldLabel>{t("profile.inspector.attribution")}</FieldLabel>
            <Input
              value={(block as ProfileQuoteBlock).attribution ?? ""}
              onChange={(event) =>
                updateSelectedBlock({
                  attribution: event.target.value || null
                })
              }
              placeholder={t("profile.inspector.attributionPlaceholder")}
            />
          </Stack>
        );

      default:
        return null;
    }
  }
);
