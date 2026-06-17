import { ProfileViewerPage } from "@components/Profile/viewer/ProfileViewerPage";
import { seo } from "@seo";
import {
  buildProfileSeo,
  fetchUserByIdentifier,
  fetchUserProfileByIdentifier
} from "@utils/profileRoute.utils";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";

export const Route = createFileRoute("/users/$username")({
  beforeLoad: async ({ params }) => {
    const user = await fetchUserByIdentifier(params.username);
    if (!user) throw notFound();

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

    if (!user || !profile) throw notFound();

    return { user, profile };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};

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
      initialUser={loaderData.user}
      initialProfile={loaderData.profile}
    />
  );
}
