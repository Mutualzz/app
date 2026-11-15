import { InputWithLabel } from "@components/InputWithLabel";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import {
  SPACE_BIO_MAX_LENGTH,
  SPACE_NICKNAME_MAX_LENGTH,
  SPACE_PRONOUNS_MAX_LENGTH
} from "@mutualzz/validators";
import { CDNRoutes, ImageFormat } from "@mutualzz/types";
import type { Space } from "@stores/objects/Space";
import { REST } from "@stores/REST.store";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  space: Space;
  onSaved?: () => void;
}

export const SpaceProfileEditor = observer(({ space, onSaved }: Props) => {
  const { t } = useTranslation("space");
  const app = useAppStore();
  const me = space.members.me;
  const canChangeNickname =
    !!me &&
    (me.hasPermission("ChangeNickname") || me.hasPermission("ManageNicknames"));

  const [nickname, setNickname] = useState(me?.nickname ?? "");
  const [pronouns, setPronouns] = useState(me?.pronouns ?? "");
  const [bio, setBio] = useState(me?.bio ?? "");
  const [avatar, setAvatar] = useState<string | null>(me?.avatar ?? null);
  const [banner, setBanner] = useState<string | null>(me?.banner ?? null);
  const [uploadingKind, setUploadingKind] = useState<
    "avatar" | "banner" | null
  >(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const imagePreviewUrl = (hash: string | null, kind: "avatar" | "banner") =>
    hash && me
      ? REST.makeCDNUrl(
          kind === "avatar"
            ? CDNRoutes.profileImage(me.userId, hash, ImageFormat.WebP, 128)
            : CDNRoutes.profileBanner(me.userId, hash, ImageFormat.WebP, 512)
        )
      : null;

  const uploadImage = async (file: File, kind: "avatar" | "banner") => {
    setUploadingKind(kind);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await app.rest.postFormData<{ hash: string }>(
        "/@me/profile/assets",
        formData,
        { type: "image" }
      );
      if (!result?.hash) throw new Error();
      if (kind === "avatar") setAvatar(result.hash);
      else setBanner(result.hash);
    } catch {
      toast.error(t("spaceProfile.uploadFailed"));
    } finally {
      setUploadingKind(null);
    }
  };

  useEffect(() => {
    setNickname(me?.nickname ?? "");
    setPronouns(me?.pronouns ?? "");
    setBio(me?.bio ?? "");
    setAvatar(me?.avatar ?? null);
    setBanner(me?.banner ?? null);
  }, [space.id, me?.nickname, me?.pronouns, me?.bio, me?.avatar, me?.banner]);

  const { mutate: save, isPending: saving } = useMutation({
    mutationKey: ["space-profile", space.id],
    mutationFn: async () => {
      const ack = await app.gateway.updateSpaceMemberProfile(space.id, {
        ...(canChangeNickname ? { nickname } : {}),
        pronouns,
        bio,
        avatar,
        banner
      });
      if (!ack.ok) throw new Error(ack.message);
      return ack;
    },
    onSuccess: () => {
      toast.success(t("spaceProfile.saved"));
      onSaved?.();
    },
    onError: (error) =>
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : t("spaceProfile.failed")
      )
  });

  const imageControl = (
    kind: "avatar" | "banner",
    hash: string | null,
    inputRef: React.RefObject<HTMLInputElement | null>,
    clear: () => void
  ) => {
    const previewUrl = imagePreviewUrl(hash, kind);
    return (
      <Stack direction="column" spacing={0.75}>
        <Typography fontWeight={500} level="body-md">
          {t(`spaceProfile.${kind}`)}
        </Typography>
        <Typography level="body-sm" textColor="muted">
          {t(`spaceProfile.${kind}Description`)}
        </Typography>
        {previewUrl && (
          <img
            src={previewUrl}
            alt=""
            css={{
              width: kind === "avatar" ? 72 : "100%",
              height: 72,
              objectFit: "cover",
              borderRadius: kind === "avatar" ? "50%" : 8
            }}
          />
        )}
        <Stack direction="row" spacing={1}>
          <Button
            size="sm"
            color="neutral"
            loading={uploadingKind === kind}
            onClick={() => inputRef.current?.click()}
          >
            {t("spaceProfile.upload")}
          </Button>
          {hash && (
            <Button size="sm" color="neutral" onClick={clear}>
              {t("spaceProfile.remove")}
            </Button>
          )}
        </Stack>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void uploadImage(file, kind);
          }}
        />
      </Stack>
    );
  };

  return (
    <Stack direction="column" spacing={2}>
      {imageControl("avatar", avatar, avatarInputRef, () => setAvatar(null))}
      {imageControl("banner", banner, bannerInputRef, () => setBanner(null))}

      <Stack direction="column" spacing={0.5}>
        <InputWithLabel
          name="spaceNickname"
          label={t("spaceProfile.nickname")}
          description={
            canChangeNickname
              ? t("spaceProfile.nicknameDescription")
              : t("spaceProfile.nicknameNoPermission")
          }
          value={nickname}
          maxLength={SPACE_NICKNAME_MAX_LENGTH}
          disabled={!canChangeNickname}
          placeholder={app.account?.displayName ?? ""}
          onChange={(event) => setNickname(event.target.value)}
        />
      </Stack>

      <InputWithLabel
        name="spacePronouns"
        label={t("spaceProfile.pronouns")}
        description={t("spaceProfile.pronounsDescription")}
        value={pronouns}
        maxLength={SPACE_PRONOUNS_MAX_LENGTH}
        onChange={(event) => setPronouns(event.target.value)}
      />

      <Stack direction="column" spacing={0.5}>
        <Typography fontWeight={500} level="body-md">
          {t("spaceProfile.bio")}
        </Typography>
        <Typography level="body-sm" textColor="muted">
          {t("spaceProfile.bioDescription")}
        </Typography>
        <Textarea
          value={bio}
          rows={4}
          maxLength={SPACE_BIO_MAX_LENGTH}
          onChange={(event) => setBio(event.target.value)}
        />
      </Stack>

      <Button
        color="primary"
        loading={saving}
        onClick={() => save()}
        css={{ alignSelf: "flex-start" }}
      >
        {t("spaceProfile.save")}
      </Button>
    </Stack>
  );
});
