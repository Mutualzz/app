import { ProfileViewerPage } from "@components/Profile/viewer/ProfileViewerPage";
import { ProfileLayout } from "@components/Profile/viewer/ProfileLayout";
import { ProfileNotFoundState } from "@components/Profile/viewer/ProfileNotFoundState";
import { useAppStore } from "@hooks/useStores";
import { seo } from "@seo";
import {
  buildProfileSeo,
  fetchUserByIdentifier,
  fetchUserProfileByIdentifier
} from "@utils/profileRoute.utils";
import { navigateToPreferredMode } from "@utils/index";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

function ProfileNotFoundRoute() {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const navigate = useNavigate();
  const goBack = () => navigateToPreferredMode(app, navigate);

  return (
    <ProfileLayout
      title={t("profile.viewer.title")}
      backLabel={tCommon("close")}
      onBack={goBack}
    >
      <ProfileNotFoundState onBack={goBack} />
    </ProfileLayout>
  );
}

export const Route = createFileRoute("/users/$username")({
  notFoundComponent: ProfileNotFoundRoute,
  beforeLoad: async ({ params }) => {
    const user = await fetchUserByIdentifier(params.username);
    if (!user) return;

    const canonical = user.username.toLowerCase();
    if (params.username.toLowerCase() !== canonical) {
      throw redirect({
        to: "/users/$username",
        params: { username: canonical },
        replace: true
      });
    }
  },
  loader: async ({ params }) => {
    const [user, profile] = await Promise.all([
      fetchUserByIdentifier(params.username),
      fetchUserProfileByIdentifier(params.username)
    ]);

    return {
      user: user ?? null,
      profile: profile ?? null
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.user || !loaderData.profile) return {};

    const meta = buildProfileSeo(loaderData.user, loaderData.profile);

    return {
      meta: [...seo(meta)],
      links: [{ rel: "canonical", href: meta.url }]
    };
  },
  component: observer(RouteComponent)
});

function RouteComponent() {
  const { username } = Route.useParams();
  const loaderData = Route.useLoaderData();

  return (
    <ProfileViewerPage
      username={username}
      initialUser={loaderData.user ?? undefined}
      initialProfile={loaderData.profile ?? undefined}
    />
  );
}
