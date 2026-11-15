import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { Tooltip } from "@components/Tooltip";
import type {
  BlockAlignment,
  BlockDistribution
} from "@components/Profile/editor/utils/profileBlockArrange.utils";
import { Stack, Typography } from "@mutualzz/ui-web";
import {
  AlignBottomIcon,
  AlignCenterHorizontalIcon,
  AlignCenterVerticalIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
  ArrowsHorizontalIcon,
  ArrowsVerticalIcon,
  BoundingBoxIcon,
  SelectionSlashIcon,
  type Icon
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export const ALIGNMENT_OPTIONS: {
  alignment: BlockAlignment;
  IconComponent: Icon;
}[] = [
  { alignment: "left", IconComponent: AlignLeftIcon },
  { alignment: "center", IconComponent: AlignCenterHorizontalIcon },
  { alignment: "right", IconComponent: AlignRightIcon },
  { alignment: "top", IconComponent: AlignTopIcon },
  { alignment: "middle", IconComponent: AlignCenterVerticalIcon },
  { alignment: "bottom", IconComponent: AlignBottomIcon }
];

export const DISTRIBUTION_OPTIONS: {
  distribution: BlockDistribution;
  IconComponent: Icon;
}[] = [
  { distribution: "horizontal", IconComponent: ArrowsHorizontalIcon },
  { distribution: "vertical", IconComponent: ArrowsVerticalIcon }
];

interface Props {
  selectedCount: number;
  onAlign: (alignment: BlockAlignment) => void;
  onDistribute: (distribution: BlockDistribution) => void;
  canGroup?: boolean;
  canUngroup?: boolean;
  onGroup?: () => void;
  onUngroup?: () => void;
  styleSection?: ReactNode;
}

export const ProfileMultiSelectPanel = ({
  selectedCount,
  onAlign,
  onDistribute,
  canGroup = false,
  canUngroup = false,
  onGroup,
  onUngroup,
  styleSection
}: Props) => {
  const { t } = useTranslation("settings");
  const canDistribute = selectedCount >= 3;

  return (
    <Paper
      variant="soft"
      borderRadius={10}
      p={1.5}
      direction="column"
      spacing={1.25}
    >
      <Stack direction="row" spacing={0.5} css={{ flexWrap: "wrap" }}>
        {ALIGNMENT_OPTIONS.map(({ alignment, IconComponent }) => (
          <Tooltip
            key={alignment}
            content={t(`profile.inspector.arrange.${alignment}`)}
          >
            <IconButton
              size="sm"
              variant="plain"
              onClick={() => onAlign(alignment)}
              title={t(`profile.inspector.arrange.${alignment}`)}
            >
              <IconComponent />
            </IconButton>
          </Tooltip>
        ))}
      </Stack>

      <Stack direction="row" spacing={0.5}>
        {DISTRIBUTION_OPTIONS.map(({ distribution, IconComponent }) => (
          <Tooltip
            key={distribution}
            content={t(`profile.inspector.arrange.${distribution}`)}
          >
            <IconButton
              size="sm"
              variant="plain"
              disabled={!canDistribute}
              onClick={() => onDistribute(distribution)}
              title={t(`profile.inspector.arrange.${distribution}`)}
            >
              <IconComponent />
            </IconButton>
          </Tooltip>
        ))}
      </Stack>

      {!canDistribute && (
        <Typography level="body-xs" css={{ opacity: 0.6 }}>
          {t("profile.inspector.arrange.distributeHint")}
        </Typography>
      )}

      {(onGroup || onUngroup) && (
        <Stack direction="column" spacing={0.75}>
          <Stack direction="row" spacing={0.5}>
            {onGroup && (
              <Button
                size="sm"
                color="neutral"
                disabled={!canGroup}
                startDecorator={<BoundingBoxIcon />}
                onClick={onGroup}
              >
                {t("profile.blocks.group")}
              </Button>
            )}
            {onUngroup && (
              <Button
                size="sm"
                color="neutral"
                disabled={!canUngroup}
                startDecorator={<SelectionSlashIcon />}
                onClick={onUngroup}
              >
                {t("profile.blocks.ungroup")}
              </Button>
            )}
          </Stack>
          <Typography level="body-xs" css={{ opacity: 0.6, lineHeight: 1.4 }}>
            {t("profile.blocks.groupHint")}
          </Typography>
        </Stack>
      )}
      {styleSection && (
        <Stack direction="column" spacing={1} pt={0.5}>
          <Typography level="body-sm" fontWeight={700}>
            {t("profile.inspector.blockStyle.title")}
          </Typography>
          <Typography level="body-xs" css={{ opacity: 0.6, lineHeight: 1.4 }}>
            {t("profile.inspector.blockStyle.multipleHint")}
          </Typography>
          {styleSection}
        </Stack>
      )}
    </Paper>
  );
};
