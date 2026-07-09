import { CustomStatusCard } from "@components/CustomStatus/CustomStatusCard";
import { useAppStore } from "@hooks/useStores";
import type { PresenceActivityEmoji } from "@mutualzz/types";
import { observer } from "mobx-react-lite";

interface Props {
  text: string;
  emoji: PresenceActivityEmoji | null;
}

export const CustomStatusModalPreview = observer(({ text, emoji }: Props) => {
  const app = useAppStore();
  const account = app.account;

  if (!account) return null;

  return (
    <CustomStatusCard
      account={account}
      text={text}
      emoji={emoji}
      showName
    />
  );
});
