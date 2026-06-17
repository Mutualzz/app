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
    switch (block.type) {
      case "links": {
        const linksBlock = block as ProfileLinksBlock;
        const links = linksBlock.links.length
          ? linksBlock.links
          : [{ label: "", url: "" }];

        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>Links</FieldLabel>
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
                  placeholder="Label"
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
                    placeholder="https://"
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
                    Detected: {formatProfileUrlLabel(resolved)}
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
                    links: [...links, { label: "New link", url: "https://example.com" }]
                  })
                }
              >
                Add link
              </Button>
            )}
          </Stack>
        );
      }

      case "activity":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>Activity</FieldLabel>
            <FieldHint>
              Shows live presence and current activity from the user&apos;s
              status. No configuration needed — updates automatically.
            </FieldHint>
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
              <Option value="show">Show custom status</Option>
              <Option value="hide">Hide custom status</Option>
            </Select>
          </Stack>
        );

      case "roles":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>Max roles</FieldLabel>
            <Slider
              min={1}
              max={12}
              value={(block as ProfileRolesBlock).maxRoles ?? 6}
              onChange={(_, value) =>
                updateSelectedBlock({ maxRoles: value as number })
              }
              valueLabelDisplay="auto"
            />
            <FieldHint>
              Displays roles from a shared space. Viewers see roles from spaces
              they share with this user.
            </FieldHint>
          </Stack>
        );

      case "mutual":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>Mutual card type</FieldLabel>
            <Select
              value={(block as ProfileMutualBlock).mode}
              onValueChange={(value) =>
                updateSelectedBlock({
                  mode: (value ?? "spaces") as "spaces" | "friends"
                })
              }
              size="sm"
            >
              <Option value="spaces">Mutual spaces</Option>
              <Option value="friends">Friends status</Option>
            </Select>
            <FieldLabel>Max items</FieldLabel>
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
            <FieldLabel>Divider style</FieldLabel>
            <Select
              value={(block as ProfileDividerBlock).style ?? "line"}
              onValueChange={(value) =>
                updateSelectedBlock({
                  style: (value ?? "line") as ProfileDividerBlock["style"]
                })
              }
              size="sm"
            >
              <Option value="line">Line</Option>
              <Option value="dotted">Dotted</Option>
              <Option value="space">Spacer</Option>
            </Select>
          </Stack>
        );

      case "quote":
        return (
          <Stack direction="column" spacing={1}>
            <FieldLabel>Quote</FieldLabel>
            <ProfileMarkdownField
              value={(block as ProfileQuoteBlock).content}
              maxLength={1000}
              minHeight={100}
              onChange={(content) => updateSelectedBlock({ content })}
              placeholder="Write a quote…"
            />
            <FieldLabel>Style</FieldLabel>
            <Select
              value={(block as ProfileQuoteBlock).variant ?? "default"}
              onValueChange={(value) =>
                updateSelectedBlock({
                  variant: (value ?? "default") as ProfileQuoteBlock["variant"]
                })
              }
              size="sm"
            >
              <Option value="default">Default</Option>
              <Option value="accent">Accent</Option>
              <Option value="warning">Warning</Option>
            </Select>
            <FieldLabel>Attribution</FieldLabel>
            <Input
              value={(block as ProfileQuoteBlock).attribution ?? ""}
              onChange={(event) =>
                updateSelectedBlock({
                  attribution: event.target.value || null
                })
              }
              placeholder="Optional — who said it"
            />
          </Stack>
        );

      default:
        return null;
    }
  }
);
