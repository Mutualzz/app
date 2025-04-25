import { ThemeContext } from "@mutualzz/ui/ThemeManager";
import { useContext } from "react";

export const useTheme = () => useContext(ThemeContext);
