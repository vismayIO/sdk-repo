import { useAsync } from "react-async-hook";

import { getDuckDB } from "../init/initializeDuckDb";

/**
 * React hook to access a singleton DuckDb instance within components or other hooks.
 */
export const useDuckDb = () => {
  return useAsync(getDuckDB, []);
};
