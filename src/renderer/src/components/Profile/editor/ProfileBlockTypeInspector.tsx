import type { APIProfileBlock } from "@mutualzz/types";
import {
  ProfileInspectorField,
  ProfileInspectorFieldLabel
} from "@components/Profile/editor/ProfileInspectorField";
import dayjs from "dayjs";
import {
  Input,
  Option,
  Select,
  Slider,
  Stack,
  Switch,
  Typography
} from "@mutualzz/ui-web";
import { Button } from "@components/Button";
import { ProfileMarkdownField } from "@components/Profile/editor/ProfileMarkdownField";
import {
  formatProfileUrlLabel,
  resolveProfileUrl,
  shouldAutoUpdateLinkLabel
} from "@components/Profile/shared/profileLink.utils";
import type { ProfileDividerBlock, ProfileQuoteBlock } from "@mutualzz/types";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  block: APIProfileBlock;
  updateSelectedBlock: (patch: Partial<APIProfileBlock>) => void;
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <ProfileInspectorFieldLabel>{children}</ProfileInspectorFieldLabel>
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
        const linksBlock = block;
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
                      next[index] = {
                        ...next[index],
                        label: event.target.value
                      };
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
                            shouldAutoUpdateLinkLabel(
                              next[index].label,
                              previousUrl
                            )
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
                        label: formatProfileUrlLabel(resolved)
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
              value={block.showCustomStatus === false ? "hide" : "show"}
              onValueChange={(value) =>
                updateSelectedBlock({
                  showCustomStatus: value !== "hide"
                })
              }
              size="sm"
            >
              <Option value="show">
                {t("profile.blocks.showCustomStatus")}
              </Option>
              <Option value="hide">
                {t("profile.blocks.hideCustomStatus")}
              </Option>
            </Select>
            <Switch
              checked={block.showPlaying !== false}
              onChange={(event) =>
                updateSelectedBlock({
                  showPlaying: event.target.checked ? undefined : false
                })
              }
              label={t("profile.inspector.activityTypes.playing")}
            />
            <Switch
              checked={block.showListening !== false}
              onChange={(event) =>
                updateSelectedBlock({
                  showListening: event.target.checked ? undefined : false
                })
              }
              label={t("profile.inspector.activityTypes.listening")}
            />
          </Stack>
        );

      case "roles":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>{t("profile.inspector.maxRoles")}</FieldLabel>
            <Slider
              min={1}
              max={12}
              value={block.maxRoles ?? 6}
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
              value={block.mode}
              onValueChange={(value) =>
                updateSelectedBlock({
                  mode: (value ?? "spaces") as "spaces" | "friends"
                })
              }
              size="sm"
            >
              <Option value="spaces">{t("profile.blocks.mutualSpaces")}</Option>
              <Option value="friends">
                {t("profile.blocks.friendsStatus")}
              </Option>
            </Select>
            <FieldLabel>{t("profile.inspector.maxItems")}</FieldLabel>
            <Slider
              min={1}
              max={12}
              value={block.maxItems ?? 6}
              onChange={(_, value) =>
                updateSelectedBlock({ maxItems: value as number })
              }
              valueLabelDisplay="auto"
            />
          </Stack>
        );

      case "nowPlaying":
        return (
          <ProfileInspectorField
            label={t("profile.inspector.nowPlayingHideWhenIdle")}
            hint={t("profile.inspector.nowPlayingHint")}
            value={
              <Switch
                size="sm"
                checked={!!block.hideWhenIdle}
                aria-label={t("profile.inspector.nowPlayingHideWhenIdle")}
                onChange={(event) =>
                  updateSelectedBlock({
                    hideWhenIdle: event.target.checked || undefined
                  })
                }
              />
            }
          />
        );

      case "countdown": {
        const target = dayjs(block.targetAt);
        return (
          <Stack direction="column" spacing={2}>
            <ProfileInspectorField
              label={t("profile.inspector.countdown.title")}
            >
              <Input
                size="sm"
                value={block.title ?? ""}
                maxLength={80}
                placeholder={t("profile.blocks.countdown")}
                onChange={(event) =>
                  updateSelectedBlock({
                    title: event.target.value || null
                  })
                }
              />
            </ProfileInspectorField>
            <ProfileInspectorField
              label={t("profile.inspector.countdown.date")}
              hint={t("profile.inspector.countdown.dateHint")}
            >
              <Input
                size="sm"
                type="datetime-local"
                value={
                  target.isValid() ? target.format("YYYY-MM-DDTHH:mm") : ""
                }
                onChange={(event) => {
                  const nextTarget = dayjs(event.target.value);
                  if (!nextTarget.isValid()) return;
                  updateSelectedBlock({ targetAt: nextTarget.toISOString() });
                }}
              />
            </ProfileInspectorField>
          </Stack>
        );
      }

      case "divider":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>{t("profile.inspector.dividerStyle")}</FieldLabel>
            <Select
              value={block.style ?? "line"}
              onValueChange={(value) =>
                updateSelectedBlock({
                  style: (value ?? "line") as ProfileDividerBlock["style"]
                })
              }
              size="sm"
            >
              <Option value="line">{t("profile.blocks.dividerLine")}</Option>
              <Option value="dotted">
                {t("profile.blocks.dividerDotted")}
              </Option>
              <Option value="space">{t("profile.blocks.dividerSpacer")}</Option>
            </Select>
          </Stack>
        );

      case "quote":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>{t("profile.blocks.quote")}</FieldLabel>
            <ProfileMarkdownField
              value={block.content}
              maxLength={1000}
              minHeight={100}
              onChange={(content) => updateSelectedBlock({ content })}
              placeholder={t("profile.widgets.defaults.quoteContent")}
            />
            <FieldLabel>{t("profile.inspector.style")}</FieldLabel>
            <Select
              value={block.variant ?? "default"}
              onValueChange={(value) =>
                updateSelectedBlock({
                  variant: (value ?? "default") as ProfileQuoteBlock["variant"]
                })
              }
              size="sm"
            >
              <Option value="default">
                {t("profile.blocks.quoteDefault")}
              </Option>
              <Option value="accent">{t("profile.blocks.quoteAccent")}</Option>
              <Option value="warning">
                {t("profile.blocks.quoteWarning")}
              </Option>
            </Select>
            <FieldLabel>{t("profile.inspector.attribution")}</FieldLabel>
            <Input
              value={block.attribution ?? ""}
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
