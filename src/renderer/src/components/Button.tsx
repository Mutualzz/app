import { type ButtonProps, Button as MzButton } from "@mutualzz/ui-web";

export const Button = ({ color, ...props }: ButtonProps) => (
  <MzButton color={color ?? "text"} {...props} />
);
