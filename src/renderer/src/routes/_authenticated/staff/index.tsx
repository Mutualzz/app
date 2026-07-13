import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { StaffPanelHeader } from "@components/Staff/StaffPanelHeader";
import {
  buildProfileAvatarUrl,
  getUserDisplayName
} from "@utils/profileRoute.utils";
import { useAppStore } from "@hooks/useStores";
import { userFlags } from "@mutualzz/bitfield";
import type { APIUser } from "@mutualzz/types";
import {
  Avatar,
  Input,
  Option,
  Select,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import {
  ClockCounterClockwiseIcon,
  GavelIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  ShieldIcon,
  WarningIcon
} from "@phosphor-icons/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/staff/")({
  component: StaffIndexRoute
});

const ANY_FLAG = "any";
const UNVERIFIED_FLAG = "Unverified";
const flagOptions = [UNVERIFIED_FLAG, ...Object.keys(userFlags)];
const PAGE_LIMIT = 25;

interface UserRowProps {
  avatarSrc?: string;
  primary: string;
  secondary: string;
  onClick: () => void;
}

const UserRow = ({ avatarSrc, primary, secondary, onClick }: UserRowProps) => {
  const app = useAppStore();
  const [hover, setHover] = useState(false);

  return (
    <Paper
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      p={1.5}
      borderRadius={10}
      variant="elevation"
      elevation={hover ? (app.settings?.preferEmbossed ? 3 : 1) : 0}
      boxShadow="none !important"
      css={{ cursor: "pointer", transition: "all 0.15s ease" }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        {avatarSrc ? (
          <Avatar src={avatarSrc} size={36} />
        ) : (
          <Paper
            variant="soft"
            color="primary"
            borderRadius="50%"
            width={36}
            height={36}
            justifyContent="center"
            alignItems="center"
          >
            <MagnifyingGlassIcon size={16} />
          </Paper>
        )}
        <Stack direction="column" spacing={0.1}>
          <Typography fontWeight={600}>{primary}</Typography>
          <Typography level="body-xs" textColor="muted">
            {secondary}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

function StaffIndexRoute() {
  const app = useAppStore();
  const navigate = useNavigate();
  const { t } = useTranslation("staff");
  const embossed = app.settings?.preferEmbossed;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [flag, setFlag] = useState<string>(ANY_FLAG);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const trimmedQuery = debouncedQuery.trim();
  const effectiveFlag = flag === ANY_FLAG ? undefined : flag;
  const isSnowflake = /^\d{5,}$/.test(trimmedQuery);

  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["staff-user-search", trimmedQuery, effectiveFlag],
      queryFn: ({ pageParam }) =>
        app.rest.get<APIUser[]>("/staff/users", {
          ...(trimmedQuery ? { query: trimmedQuery } : {}),
          ...(effectiveFlag ? { flag: effectiveFlag } : {}),
          ...(pageParam ? { after: pageParam } : {}),
          limit: PAGE_LIMIT
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length === PAGE_LIMIT
          ? lastPage[lastPage.length - 1].username
          : undefined,
      enabled: !!trimmedQuery || !!effectiveFlag
    });

  const results = data?.pages.flat() ?? [];

  const goToUser = (userId: string) =>
    navigate({ to: "/staff/users/$userId", params: { userId } });

  return (
    <Stack
      flex={1}
      height="100%"
      overflow="auto"
      width="100%"
      direction="column"
    >
      <StaffPanelHeader
        title={t("title")}
        backTo="home"
        backLabel={t("exit")}
        icon={<ShieldIcon size={22} weight="fill" />}
        trailing={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              size="sm"
              variant="soft"
              startDecorator={<WarningIcon />}
              onClick={() => navigate({ to: "/staff/reports" })}
            >
              {t("nav.reports")}
            </Button>
            <Button
              size="sm"
              variant="soft"
              startDecorator={<ClockCounterClockwiseIcon />}
              onClick={() => navigate({ to: "/staff/activity" })}
            >
              {t("nav.activity")}
            </Button>
            <Button
              size="sm"
              variant="soft"
              startDecorator={<GavelIcon />}
              onClick={() => navigate({ to: "/staff/appeals" })}
            >
              {t("nav.appeals")}
            </Button>
            <Button
              size="sm"
              variant="soft"
              startDecorator={<LifebuoyIcon />}
              onClick={() => navigate({ to: "/staff/support" })}
            >
              {t("nav.support")}
            </Button>
            {app.account?.isDeveloper ? (
              <Button
                size="sm"
                variant="soft"
                startDecorator={<NewspaperIcon />}
                onClick={() => navigate({ to: "/staff/changelogs" })}
              >
                {t("nav.changelogs")}
              </Button>
            ) : null}
          </Stack>
        }
      />

      <Paper
        flex={1}
        height="100%"
        overflow="auto"
        width="100%"
        spacing={1.25}
        alignItems="center"
        borderTopRightRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
        borderBottomRightRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
        elevation={embossed ? 2 : 0}
        direction="column"
        px={{ xs: "0.5rem", sm: 3 }}
        py={{ xs: "0.5rem", sm: 3 }}
        borderTop="0 !important"
        borderLeft="0 !important"
        borderBottom="0 !important"
      >
        <Stack direction="column" spacing={1.5} width="100%" maxWidth={520}>
          <Paper
            variant="soft"
            borderRadius={12}
            p={2}
            direction="column"
            spacing={1.25}
            elevation={embossed ? 2 : 0}
            boxShadow="none !important"
          >
            <Stack direction="column" spacing={0.5}>
              <Typography level="title-sm" fontWeight={600}>
                {t("home.findUser")}
              </Typography>
              <Typography level="body-sm" css={{ opacity: 0.75 }}>
                {t("home.findUserDescription")}
              </Typography>
            </Stack>
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("home.searchPlaceholder")}
              startDecorator={<MagnifyingGlassIcon />}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isSnowflake) goToUser(trimmedQuery);
              }}
            />
            <Select value={flag} onValueChange={(v) => setFlag(String(v))}>
              <Option value={ANY_FLAG}>{t("home.anyFlag")}</Option>
              {flagOptions.map((f) => (
                <Option key={f} value={f}>
                  {f}
                </Option>
              ))}
            </Select>
          </Paper>

          {isFetching && !isFetchingNextPage && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              {t("home.searching")}
            </Typography>
          )}

          {!isFetching &&
            (trimmedQuery || effectiveFlag) &&
            results.length === 0 &&
            !isSnowflake && (
              <Typography level="body-sm" textColor="muted" textAlign="center">
                {t("home.noUsers")}
              </Typography>
            )}

          {(isSnowflake || results.length > 0) && (
            <Stack direction="column" spacing={0.5}>
              {isSnowflake && (
                <UserRow
                  primary={t("home.goToUserId", { id: trimmedQuery })}
                  secondary={t("home.exactIdLookup")}
                  onClick={() => goToUser(trimmedQuery)}
                />
              )}
              {results.map((user) => (
                <UserRow
                  key={user.id}
                  avatarSrc={buildProfileAvatarUrl(user)}
                  primary={getUserDisplayName(user)}
                  secondary={`@${user.username}`}
                  onClick={() => goToUser(user.id)}
                />
              ))}
              {hasNextPage && (
                <Button
                  color="neutral"
                  variant="soft"
                  disabled={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                  css={{ alignSelf: "center", marginTop: "0.5rem" }}
                >
                  {isFetchingNextPage ? t("home.loading") : t("home.loadMore")}
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
