export const getPrefersDark = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const usePrefersDark = getPrefersDark;
