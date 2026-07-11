import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { UserItem } from "./UserItem";
import { useAppStore } from "@renderer/hooks/useStores";
import { useTranslation } from "react-i18next";

export const AllTab = observer(() => {
  const app = useAppStore();
  const { t } = useTranslation("chat");
  const relationships = app.relationships.friends;

  return (
    <Stack direction="column" flex={1} spacing={2.5}>
      {relationships.length === 0 && (
        <Stack
          direction="column"
          flex={1}
          justifyContent="center"
          alignItems="center"
          spacing={2.5}
        >
          <Typography textColor="muted" level="body-lg">
            {t("friends.emptyAll")}
          </Typography>
        </Stack>
      )}
      {relationships.length > 0 && (
        <>
          <Typography>
            {t("friends.allCount", { count: relationships.length })}
          </Typography>
          <Stack direction="column" flex={1} spacing={2.5}>
            {relationships.map((relationship) => (
              <UserItem key={relationship.id} relationship={relationship} />
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
});
