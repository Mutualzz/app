import { observer } from "mobx-react-lite";
import { Space } from "@stores/objects/Space";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Paper } from "@components/Paper";
import { SpaceBan } from "@stores/objects/SpaceBan";
import { useState } from "react";
import { UserAvatar } from "@components/User/UserAvatar";
import { InputWithLabel } from "@components/InputWithLabel";
import { useModal } from "@contexts/Modal.context";
import { SpaceMemberUnban } from "@components/SpaceSettings/pages/moderation/bans/SpaceMemberUnban";
import { useAppStore } from "@hooks/useStores";

interface Props {
  space: Space;
}

interface BanItemProps {
  ban: SpaceBan;
}

const BanItem = observer(({ ban }: BanItemProps) => {
  const app = useAppStore();
  const [hover, setHover] = useState(false);
  const { openModal } = useModal();

  return (
    <Paper
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      key={ban.userId}
      p={2.5}
      elevation={hover ? 2 : 4}
      boxShadow="none !important"
      variant="elevation"
      css={{
        cursor: "pointer"
      }}
      onClick={() => {
        openModal(`space-ban-${ban.userId}`, <SpaceMemberUnban ban={ban} />);
      }}
    >
      <Stack direction="row" spacing={2.5}>
        <UserAvatar
          user={ban.user}
          member={app.spaces.active?.members.get(ban.userId)}
        />
        <Stack direction="column">
          {ban.user?.globalName && (
            <Typography fontWeight={500}>{ban.user.globalName}</Typography>
          )}
          <Typography textColor="muted">{ban.user?.username}</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
});

export const SpaceBansSettings = observer(({ space }: Props) => {
  const { t } = useTranslation("space");
  const [search, setSearch] = useState<string | null>(null);

  const data = space.banList;

  useQuery({
    queryKey: ["space-bans", space.id],
    queryFn: () => space.fetchBans()
  });

  const bans = search
    ? data.filter(
        (ban) =>
          ban.user?.username.includes(search) ||
          ban.user?.globalName?.includes(search) ||
          ban.userId.includes(search)
      )
    : data;

  return (
    <Paper mt={2.5} p={2} spacing={2.5} direction="column">
      <Stack direction="column" spacing={1.25}>
        <Typography level="h5">{t("bans.title")}</Typography>
        <Typography textColor="muted" mb={2.5}>
          {t("bans.description")}
        </Typography>
      </Stack>
      <InputWithLabel
        placeholder={t("bans.searchPlaceholder")}
        name="search"
        onChange={(e) => setSearch(e.target.value)}
        value={search || ""}
        type="text"
      />
      {bans.length === 0 && (
        <Stack justifyContent="center" alignItems="center" py="4rem">
          <Typography textAlign="center" textColor="muted">
            {t("bans.empty")}
          </Typography>
        </Stack>
      )}
      {bans.length > 0 &&
        bans.map((ban) => <BanItem ban={ban} key={ban.userId} />)}
    </Paper>
  );
});
