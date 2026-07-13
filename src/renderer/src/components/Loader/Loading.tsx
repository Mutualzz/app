import { BrandLoader } from "@components/BrandLoader";
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
      <BrandLoader size={108} />
    </Stack>
  );
};

export default Loading;
