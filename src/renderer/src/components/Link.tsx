import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
  Button,
  Checkbox,
  Link as MLink,
  type LinkProps,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import { useNavigate } from "@tanstack/react-router";
import { isElectron, toSpotifyUri } from "@utils/index";
import { type MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";

interface Props {
  url: URL;
  unsafe?: boolean;
}

async function openExternalUrl(url: URL) {
  const urlStr = url.toString();
  if (window.api) {
    await window.api.shell.openExternal(toSpotifyUri(url) ?? urlStr);
    return;
  }

  window.open(urlStr, "_blank", "noopener,noreferrer");
}

export const OpenLink = observer(({ url, unsafe }: Props) => {
  const { t } = useTranslation("common");
  const { closeModal } = useModal();
  const app = useAppStore();
  const [skipWarning, setSkipWarning] = useState(false);

  const handleProceed = async () => {
    if (skipWarning) app.setDontShowLinkWarning(true);
    await openExternalUrl(url);
    closeModal();
  };

  if (isElectron && unsafe)
    return (
      <AnimatedPaper
        width="35rem"
        justifyContent="space-between"
        direction="column"
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        height="15rem"
        alignItems="center"
        py={4}
      >
        <Typography mt={15} textAlign="center" color="warning">
          {t("externalLink.blockedInApp")}
        </Typography>
        <Stack width="80%" spacing={2}>
          <Button onClick={() => closeModal()} fullWidth>
            {t("externalLink.close")}
          </Button>
        </Stack>
      </AnimatedPaper>
    );

  return (
    <AnimatedPaper
      width="35rem"
      justifyContent="space-between"
      direction="column"
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      height="15rem"
      alignItems="center"
    >
      {unsafe && !isElectron && (
        <>
          <Typography
            color="danger"
            variant="plain"
            level="h5"
            fontWeight="bold"
            mt={7}
          >
            {t("externalLink.unsafeTitle")}
          </Typography>
          <Stack direction="column" alignItems="center" spacing={2}>
            <Typography mx={5} textAlign="center">
              {t("externalLink.unsafeHttpBody")}
            </Typography>
            <Typography fontWeight="bold">
              {t("externalLink.confirmProceed")}
            </Typography>
          </Stack>
        </>
      )}
      {!unsafe && (
        <>
          <Typography level="h5" fontWeight="bold" mt={7}>
            {t("externalLink.title")}
          </Typography>
          <Stack direction="column" alignItems="center" spacing={2}>
            <Typography mx={5} textAlign="center">
              {t("externalLink.aboutToOpen")}
            </Typography>
            <Typography fontWeight="bold" textAlign="center">
              {url.toString()}
            </Typography>
          </Stack>
        </>
      )}

      <Stack spacing={2.5} width="100%" mb={4} px={4}>
        <Checkbox
          label={t("externalLink.dontShowAgain")}
          value={skipWarning}
          onChange={() => setSkipWarning((prev) => !prev)}
        />
        <Button expand onClick={handleProceed} variant="soft" color="success">
          {t("externalLink.proceed")}
        </Button>
        <Button
          expand
          color="danger"
          onClick={() => closeModal(unsafe ? "open-link-unsafe" : "open-link")}
        >
          {t("cancel")}
        </Button>
      </Stack>
    </AnimatedPaper>
  );
});

export const Link = observer(({ href, onClick, ...props }: LinkProps) => {
  const { openModal } = useModal();
  const navigate = useNavigate();
  const app = useAppStore();
  const url = URL.parse(href || "");
  const isUnsafe =
    !!url && (url.protocol === "http:" || url.host.startsWith("localhost"));
  const isInternal = !!url && url.hostname.endsWith("mutualzz.com");

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!url) {
      onClick?.(e);
      return;
    }

    e.preventDefault();

    if (isInternal) {
      const path = url.pathname + url.search + url.hash;
      navigate({ to: path });
      return;
    }

    if (app.dontShowLinkWarning) {
      void openExternalUrl(url);
      onClick?.(e);
      return;
    }

    if (isUnsafe && !isInternal) {
      openModal("open-link-unsafe", <OpenLink url={url} unsafe />);
      return;
    }

    openModal("open-link", <OpenLink url={url} />);
    onClick?.(e);
  };

  return <MLink href={href} onClick={handleClick} {...props} />;
});
