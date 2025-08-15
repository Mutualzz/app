import { isSSR } from "@utils/index";

export const usePrefersDark = () => {
    if (isSSR) return;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
};
