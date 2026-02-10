import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import * as arrow from "apache-arrow";

import { logElapsedTime } from "./perf";
import { DEBUG } from "../init/initializeDuckDb";

/**
 * Execute a SQL query, and return the result as an Apache Arrow table.
 */
export const runQuery = async <
  T extends {
    [key: string]: arrow.DataType;
  },
>(
  db: AsyncDuckDB,
  sql: string,
) => {
  const start = performance.now();
  const conn = await db.connect();
  const arrow = await conn.query<T>(sql);
  await conn.close();

  DEBUG && logElapsedTime(`Run query: ${sql}`, start);
  return arrow;
};
