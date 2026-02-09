import { useMemo } from 'react';
import { useDuckDbQuery } from '@sdk-repo/sdk/duck-db';
import type { User } from '@sdk-repo/sdk/api';



export function useUserAnalytics(users: User[]) {
  // Create SQL query with user data
  const sql = useMemo(() => {
    if (users.length === 0) return undefined;

    const values = users.map(u =>
      `('${u.role.replace(/'/g, "''")}', '${u.name.replace(/'/g, "''")}')`
    ).join(',');

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
  const stats = useMemo(() => {
    if (!arrow) return [];

    return arrow.toArray().map((row: any) => ({
      role: row.role,
      count: Number(row.count),
      avg_name_length: Number(row.avg_name_length),
    }));
  }, [arrow]);

  return { stats, loading, error };
}
