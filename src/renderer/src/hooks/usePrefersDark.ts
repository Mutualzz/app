export const usePrefersDark = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};
