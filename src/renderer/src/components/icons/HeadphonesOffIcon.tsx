import { HeadphonesIcon, IconProps } from "@phosphor-icons/react";

export const HeadphonesOffIcon = ({
  size = "1em",
  color = "currentColor",
  weight = "fill",
  ...props
}: IconProps) => (
  <span
    style={{
      position: "relative",
      display: "inline-flex",
      width: size,
      height: size,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center"
    }}
    {...(props as any)}
  >
    <HeadphonesIcon size={size} color={color} weight={weight} />
    <svg
      style={{ position: "absolute", top: 0, left: 0, display: "block" }}
      width={size}
      height={size}
      viewBox="0 0 256 256"
    >
      <line
        x1="40"
        y1="40"
        x2="216"
        y2="216"
        stroke={color}
        strokeWidth="24"
        strokeLinecap="round"
      />
    </svg>
  </span>
);
