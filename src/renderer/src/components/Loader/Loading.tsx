import { AnimatedLogo } from "@components/Animated/AnimatedLogo";
import { Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

const Loading = () => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      height="100%"
      justifyContent="center"
    >
      <AnimatedLogo
        css={{
          width: 256,
          maxWidth: 256,
          minWidth: 64,
          height: "auto"
        }}
        animate={{ scale: [0.95, 1, 0.95] }}
        transition={{
          opacity: {
            duration: 2.5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }
        }}
      />
    </Stack>
  );
};

export default observer(Loading);
