import { useMemo } from "react";
import { useDuckDbQuery } from "@sdk-repo/sdk/duck-db";
import type { User } from "@sdk-repo/sdk/api";

interface AnalyticsRow {
  role: string;
  count: number;
  avg_name_length: number;
}

export function useUserAnalytics(users: User[]) {
  // Create SQL query with user data
  const sql = useMemo(() => {
    if (users.length === 0) {
      return undefined;
    }

    const values = users
      .map(
        (user) =>
          `('${user.role.replace(/'/g, "''")}', '${user.name.replace(/'/g, "''")}')`,
      )
      .join(",");

    return `
      SELECT
        role,
        COUNT(*) as count,
        AVG(LENGTH(name)) as avg_name_length
      FROM (VALUES ${values}) AS users(role, name)
      GROUP BY role
      ORDER BY count DESC
    `;
  }, [users]);

  // Use DuckDB query hook
  const { result: arrow, loading, error } = useDuckDbQuery(sql);

  // Convert Arrow result to stats
  const stats = useMemo<AnalyticsRow[]>(() => {
    if (!arrow) {
      return [];
    }

    return arrow.toArray().map((row) => {
      const value = row as {
        role?: unknown;
        count?: unknown;
        avg_name_length?: unknown;
      };

      return {
        role: String(value.role ?? ""),
        count: Number(value.count ?? 0),
        avg_name_length: Number(value.avg_name_length ?? 0),
      };
    });
  }, [arrow]);

  return { stats, loading, error };
}
