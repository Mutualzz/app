import { AnimatedLogo } from "@components/Animated/AnimatedLogo";
import { Stack } from "@mutualzz/ui-web";

const Loading = () => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height="100%"
      minHeight="100vh"
    >
      <AnimatedLogo
        css={{
          width: 72,
          height: "auto",
          display: "block"
        }}
        animate={{ scale: [0.95, 1, 0.95] }}
        transition={{
          scale: {
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

export default Loading;
