import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { Link } from "@components/Link";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { type APIInvite, type APISpaceMember, InviteType } from "@mutualzz/types";
import {
  Button,
  ButtonGroup,
  Input,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { type ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  setCreating: (creating: boolean) => void;
}

const exampleLink = "https://mutualzz.com/invite/fJ2XlEuD";

const regex = import.meta.env.DEV
  ? /^(?:(?:https?:\/\/)?(?:www\.)?localhost:1420\/invite\/)?([A-Za-z0-9_-]{8,})$/
  : /^(?:(?:https?:\/\/)?(?:www\.)?mutualzz\.com\/invite\/)?([A-Za-z0-9_-]{8,})$/;

export const SpaceJoin = observer(({ setCreating }: Props) => {
  const { t } = useTranslation("auth");
  const app = useAppStore();
  const navigate = useNavigate();
  const [inviteLink, setInviteLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { closeModal } = useModal();

  const { mutate: joinSpace, isPending: isJoining } = useMutation({
    mutationKey: ["join-space", inviteLink],
    mutationFn: async (invite: APIInvite) => {
      return {
        invite,
        member: await app.rest.put<APISpaceMember>(
          `/spaces/${invite.space?.id}/members`,
          {
            channelId: invite.channelId,
            code: invite.code
          }
        )
      };
    },
    onSuccess: ({ invite, member }) => {
      if (!member) return;

      if (invite.channelId) {
        navigate({
          to: "/spaces/$spaceId/$channelId",
          params: {
            spaceId: member.spaceId,
            channelId: invite.channelId
          },
          replace: true
        });
      } else {
        navigate({
          to: "/spaces/$spaceId",
          params: { spaceId: member.spaceId },
          replace: true
        });
      }

      closeModal();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const { mutate: getInvite, isPending: isGettingInvite } = useMutation({
    mutationKey: ["get-invite", inviteLink],
    mutationFn: async () => {
      const match = inviteLink.match(regex);
      if (!match) {
        setError(t("onboarding.joinSpace.inviteLinkInvalid"));
        return null;
      }

      const code = match[1];

      return app.rest.get<APIInvite>(`/invites/${code}`);
    },
    onSuccess: (invite) => {
      if (!invite) return;

      if (Number(invite.type) === InviteType.Friend) {
        navigate({
          to: "/invite/$code",
          params: { code: invite.code },
          replace: true
        });
        closeModal();
        return;
      }

      joinSpace(invite);
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const handleJoin = () => {
    if (inviteLink.trim() === "") {
      setError(t("onboarding.joinSpace.inviteLinkEmpty"));
      return;
    }

    getInvite();
  };

  const handleLink = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setInviteLink(e.target.value);
  };

  return (
    <AnimatedPaper
      borderRadius={12}
      minWidth={{ xs: "90vw", sm: 340, md: 420, lg: 400 }}
      maxWidth={500}
      direction="column"
      minHeight={300}
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      spacing={0}
      elevation={2}
      p={{ xs: "1rem", sm: "2rem" }}
      transparency={10}
      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
    >
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        mb={10}
      >
        <Typography level="h5" fontWeight="bold">
          {t("onboarding.joinSpace.title")}
        </Typography>
        <Typography level="body-sm">
          {t("onboarding.joinSpace.description")}
        </Typography>
      </Stack>

      <Stack
        direction="column"
        spacing={{ xs: 0.5, sm: 0.75, md: 0.875 }}
        width="100%"
      >
        <Typography fontWeight={500} level={{ xs: "body-sm", sm: "body-md" }}>
          {t("onboarding.joinSpace.inviteLink")}{" "}
          <Typography variant="plain" color="danger">
            *
          </Typography>
        </Typography>
        <Input type="text" fullWidth value={inviteLink} onChange={handleLink} />
        {error && (
          <Typography variant="plain" color="danger" level="body-sm">
            {error}
          </Typography>
        )}
      </Stack>
      <Stack direction="column" mt={5}>
        <Typography>{t("onboarding.joinSpace.examplesIntro")}</Typography>
        <Typography textColor="muted">fJ2XlEuD</Typography>{" "}
        {t("onboarding.joinSpace.or")}{" "}
        <Typography textColor="muted">{exampleLink}</Typography>
      </Stack>
      <Stack
        pt={{ xs: 6, sm: 8, md: 10 }}
        direction="row"
        justifyContent="space-between"
        width="100%"
        alignItems="flex-end"
      >
        <ButtonGroup fullWidth spacing={{ xs: 2, sm: 5 }}>
          <Button
            disabled={
              isGettingInvite ||
              isJoining ||
              inviteLink.trim() === "" ||
              !!error
            }
            onClick={() => handleJoin()}
            variant="solid"
            color="success"
          >
            {t("onboarding.joinSpace.joinSpace")}
          </Button>
        </ButtonGroup>
      </Stack>
      <Stack mt={2.5} alignItems="center" spacing={2}>
        <Typography>{t("onboarding.joinSpace.preferCreate")}</Typography>
        <Link
          variant="plain"
          color="success"
          onClick={() => setCreating(true)}
          underline="always"
          disabled={isGettingInvite || isJoining}
        >
          {t("onboarding.joinSpace.backToCreating")}
        </Link>
      </Stack>
    </AnimatedPaper>
  );
});
