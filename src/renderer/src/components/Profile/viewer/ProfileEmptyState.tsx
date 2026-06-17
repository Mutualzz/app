import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";

interface Props {
  isSelf?: boolean;
}

export const ProfileEmptyState = observer(({ isSelf }: Props) => {
  const navigate = useNavigate();

  return (
    <Stack
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Paper
        variant="outlined"
        borderRadius={12}
        p={4}
        maxWidth={480}
        direction="column"
        spacing={1.5}
        alignItems="center"
      >
        <Typography level="title-md" textAlign="center">
          {isSelf
            ? "You haven't set up your profile yet"
            : "User hasn't setup their profile yet"}
        </Typography>
        <Typography level="body-sm" textAlign="center" css={{ opacity: 0.75 }}>
          {isSelf
            ? "Customize your profile with blocks, a banner, bio, and more."
            : "Check back later to see their customized profile page."}
        </Typography>
        {isSelf && (
          <Button color="primary" onClick={() => navigate({ to: "/profile" })}>
            Customize Profile
          </Button>
        )}
      </Paper>
    </Stack>
  );
});
