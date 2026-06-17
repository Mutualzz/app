import type { ProfileDividerBlock } from "@mutualzz/types";
import { Box } from "@mutualzz/ui-web";

interface Props {
  block: ProfileDividerBlock;
}

export const ProfileDividerBlockView = ({ block }: Props) => {
  const style = block.style ?? "line";

  if (style === "space") {
    return <Box width="100%" height="100%" />;
  }

  return (
    <Box
      width="100%"
      height="100%"
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Box
        width="100%"
        css={{
          height: style === "dotted" ? 0 : 2,
          borderTop:
            style === "dotted"
              ? "2px dotted rgba(255,255,255,0.35)"
              : undefined,
          background:
            style === "line" ? "rgba(255,255,255,0.28)" : undefined,
          borderRadius: 999
        }}
      />
    </Box>
  );
};
