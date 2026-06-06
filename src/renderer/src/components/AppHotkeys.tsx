import { useEffect } from "react";
import { loadBlockers } from "@hooks/blockers/loadBlockers";

export const AppHotkeys = () => {
  useEffect(() => loadBlockers(), []);

  return null;
};
