import {
  SidebarRailDivider,
  SidebarRailIconItem,
  SidebarRailLogo,
  SidebarRailPaper,
  SidebarRailScroll
} from "@components/Navigation/SidebarRail";
import { useAppStore } from "@hooks/useStores";
import {
  BookmarkSimpleIcon,
  ScribbleIcon,
  UsersIcon
} from "@phosphor-icons/react";
import { navigateToMode } from "@utils/index";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const FeedSidebar = observer(() => {
  const { t } = useTranslation("chat");
  const { t: tSpace } = useTranslation("space");
  const app = useAppStore();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname
  });

  const onFeedHome = pathname === "/feed" || pathname === "/feed/";
  const onFeedFriends = pathname.startsWith("/feed/friends");
  const onFeedSaved = pathname.startsWith("/feed/saved");

  const chatMode =
    app.settings?.preferredMode === "feed" || !app.settings?.preferredMode
      ? "@me"
      : app.settings.preferredMode;

  const chatLabel =
    chatMode === "@me"
      ? tSpace("sidebar.directMessages")
      : tSpace("sidebar.spaces");

  return (
    <SidebarRailPaper>
      <SidebarRailLogo
        tooltip={chatLabel}
        onClick={() => navigateToMode(app, navigate, chatMode)}
      />

      <SidebarRailDivider />

      <SidebarRailScroll>
        <SidebarRailIconItem
          label={t("feed.sidebar.explore")}
          active={onFeedHome}
          onClick={() => navigate({ to: "/feed", replace: true })}
        >
          <ScribbleIcon weight="fill" />
        </SidebarRailIconItem>

        <SidebarRailIconItem
          label={t("feed.sidebar.friends")}
          active={onFeedFriends}
          onClick={() => navigate({ to: "/feed/friends", replace: true })}
        >
          <UsersIcon weight="fill" />
        </SidebarRailIconItem>

        <SidebarRailIconItem
          label={t("feed.sidebar.saves")}
          active={onFeedSaved}
          onClick={() => navigate({ to: "/feed/saved", replace: true })}
        >
          <BookmarkSimpleIcon weight="fill" />
        </SidebarRailIconItem>
      </SidebarRailScroll>
    </SidebarRailPaper>
  );
});
