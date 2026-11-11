import { Button } from "@components/Button";
import { DownloadButton } from "@components/DownloadButton";
import { useWindowTitleBar } from "@contexts/WindowTitleBar.context";
import { useAppStore } from "@hooks/useStores";
import { Link, Stack, Typography } from "@mutualzz/ui-web";
import { Logo } from "@renderer/components/Logo";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { isElectron } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent
});

function RouteComponent() {
  if (isElectron) return <Navigate to="/app" replace />;
  return <Landing />;
}

const features = [
  {
    title: "Spaces",
    description: "Your own server with channels, roles, and voice chat."
  },
  {
    title: "Profiles that look like you",
    description: "Customize yours into your own corner of the internet."
  },
  {
    title: "Feed",
    description: "Post stuff and see what your mutuals are up to."
  },
  {
    title: "Themes",
    description: "Change how the whole app looks."
  },
  {
    title: "Bring your Discord server",
    description:
      "Import your channels, roles, and emojis instead of starting from scratch."
  }
];

const Landing = observer(() => {
  const app = useAppStore();
  const navigate = useNavigate();
  const { setConfig } = useWindowTitleBar();
  const isLoggedIn = Boolean(app.token);

  useEffect(() => {
    setConfig({
      title: "Mutualzz",
      hideModeLabel: true,
      end: (
        <Button
          size="lg"
          variant="soft"
          color="primary"
          onClick={() => navigate({ to: isLoggedIn ? "/app" : "/login" })}
        >
          {isLoggedIn ? "Open App" : "Log in"}
        </Button>
      )
    });
    return () => setConfig(null);
  }, [isLoggedIn, navigate, setConfig]);

  const copyrightYear = new Date().getFullYear();

  return (
    <Stack direction="column" width="100%" height="100%" overflow="auto">
      <Stack
        direction="column"
        alignItems="center"
        spacing={4}
        px={5}
        py={{ xs: 16, sm: 24 }}
        css={{ textAlign: "center" }}
      >
        <Typography
          level="label-sm"
          variant="soft"
          color="warning"
          px={2.5}
          py={0.75}
          css={{ borderRadius: 999 }}
        >
          Early access
        </Typography>
        <Typography level="h1">A home for the alt scene.</Typography>
        <Typography level="body-lg" maxWidth="560px">
          Chat, jump in voice, and hang out with people who get it. Punk, emo,
          scene, goth, metal, all of it.
        </Typography>
        <Stack direction="row" spacing={2} mt={4}>
          <Button
            size="lg"
            variant="solid"
            color="primary"
            onClick={() => navigate({ to: "/app" })}
          >
            Open App
          </Button>
          <DownloadButton size="lg" variant="outlined" color="success" />
        </Stack>
      </Stack>

      <Stack direction="column" alignItems="center" px={5} pb={24} spacing={24}>
        <Stack direction="column" width="100%" maxWidth="640px" spacing={6}>
          <Typography level="h3">What’s in it</Typography>
          {features.map((feature) => (
            <Stack key={feature.title} direction="column" spacing={1}>
              <Typography level="title-lg">{feature.title}</Typography>
              <Typography level="body-md">{feature.description}</Typography>
            </Stack>
          ))}
        </Stack>

        <Stack direction="column" width="100%" maxWidth="640px" spacing={4}>
          <Stack direction="row" alignItems="center" spacing={4}>
            <Logo style={{ width: 56, height: 56 }} />
            <Typography level="h3">About our logo</Typography>
          </Stack>
          <Typography>
            Yes, that’s an inverted pentagram. Here’s what it means to us.
          </Typography>
          <Typography>
            Mutualzz is built for the alternative scene: punk, emo, scene, goth,
            metal and everything in between. The anarchy symbol sits at the
            center, because so much of alt culture grew out of punk. Around it
            orbit the styles that came from it: the cathedral, scene and emo
            hair, the guitar, the microphone. The pentagram ties them all
            together.
          </Typography>
          <Typography>
            For us it stands for rebellion, individuality and refusing to fit
            in, not worship. You don’t have to share anyone’s beliefs to be
            here. Whatever you believe, or don’t, you’re welcome.
          </Typography>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={6}
        px={5}
        py={8}
        css={{ flexWrap: "wrap" }}
      >
        <Link href="/tos" underline="hover">
          Terms
        </Link>
        <Link href="/privacy" underline="hover">
          Privacy
        </Link>
        <Link href="/support" underline="hover">
          Support
        </Link>
        <Link
          href="https://status.mutualzz.com"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          Status
        </Link>
        <Typography level="body-sm">© {copyrightYear} Mutualzz</Typography>
      </Stack>
    </Stack>
  );
});
