import { isSSR } from "@utils/index";

export const usePrefersDark = () => {
    if (isSSR) return true;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
};
