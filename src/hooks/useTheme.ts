import { ThemeContext } from "@contexts/ThemeManager";
import { useContext } from "react";

export const useTheme = () => useContext(ThemeContext);
