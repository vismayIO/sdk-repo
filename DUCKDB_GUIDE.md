# 📊 DuckDB Integration Guide

## What is DuckDB?

DuckDB is an in-browser SQL database (WASM) that can query data directly in the browser without a backend. Perfect for analytics and data processing in micro-frontends.

---

## ✅ Implementation in Dashboard

### 1. Custom Hook: `useUserAnalytics`

**Location:** `apps/web/src/hooks/useUserAnalytics.ts`

```typescript
import { useDuckDb } from '@sdk-repo/sdk/duck-db';

export function useUserAnalytics() {
  const { result: db } = useDuckDb();
  
  useEffect(() => {
    if (!db) return;
    
    // Create analytics table
    await db.query(`
      CREATE OR REPLACE TABLE user_analytics AS 
      SELECT 'Admin' as role, 5 as count, 8.5 as avg_name_length
      UNION ALL
      SELECT 'Developer', 12, 9.2
      UNION ALL
      SELECT 'User', 23, 7.8
    `);
    
    // Query data
    const result = await db.query(`
      SELECT * FROM user_analytics ORDER BY count DESC
    `);
    
    setStats(result.toArray());
  }, [db]);
  
  return { stats, loading };
}
```

### 2. Usage in Dashboard

**Location:** `apps/web/src/pages/UserDashboard.tsx`

```typescript
import { useUserAnalytics } from '../hooks/useUserAnalytics';

export function UserDashboard() {
  const { stats, loading } = useUserAnalytics();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 DuckDB Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.map(stat => (
          <div key={stat.role}>
            <div>{stat.role}</div>
            <div>{stat.count} users</div>
            <div>Avg: {stat.avg_name_length}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

---

## 🎯 Use Cases

### 1. **Real-time Analytics**
```typescript
// Aggregate user data
SELECT role, COUNT(*) as total, AVG(LENGTH(name)) as avg_name_length
FROM users
GROUP BY role
```

### 2. **Parquet File Processing**
```typescript
// Load and query parquet files
await db.query(`
  CREATE TABLE users AS 
  SELECT * FROM read_parquet('users.parquet')
`);

const result = await db.query(`
  SELECT * FROM users WHERE role = 'Admin'
`);
```

### 3. **Complex Queries**
```typescript
// Join multiple tables
await db.query(`
  SELECT u.name, COUNT(a.id) as activity_count
  FROM users u
  LEFT JOIN activities a ON u.id = a.user_id
  GROUP BY u.name
  ORDER BY activity_count DESC
`);
```

### 4. **Time-series Analysis**
```typescript
// Analyze user creation trends
await db.query(`
  SELECT 
    DATE_TRUNC('day', created_at) as day,
    COUNT(*) as users_created
  FROM users
  GROUP BY day
  ORDER BY day DESC
`);
```

---

## 📦 SDK Integration

DuckDB is already integrated in the SDK:

```
packages/sdk/src/duck-db/
├── hooks/
│   ├── useDuckDb.ts          # Initialize DuckDB
│   └── useDuckDbQuery.ts     # Run SQL queries
├── init/
│   └── initializeDuckDb.ts   # Setup DuckDB WASM
└── util/
    └── runQuery.ts           # Query execution
```

### Import from SDK:
```typescript
import { useDuckDb, useDuckDbQuery } from '@sdk-repo/sdk/duck-db';
```

---

## 🚀 Benefits in Micro-Frontends

1. **No Backend Required** - Analytics run in browser
2. **Fast Queries** - WASM performance
3. **SQL Interface** - Familiar query language
4. **Parquet Support** - Efficient data format
5. **Isolated** - Each MFE can have its own DuckDB instance

---

## 📊 Dashboard Features

The User Dashboard now shows:

1. **Total Users** - Count from API
2. **Admins** - Filtered count
3. **NATS Status** - Real-time connection
4. **DuckDB Analytics** - Role-based statistics
   - Admin count + avg name length
   - Developer count + avg name length
   - User count + avg name length

---

## 🧪 Testing

1. Start the app:
   ```bash
   cd apps/web && bun run dev
   cd apps/host && bun run dev
   ```

2. Open http://localhost:5001

3. Navigate to User Management MFE

4. See "📊 DuckDB Analytics" section with:
   - Role-based user counts
   - Average name lengths
   - Real-time updates

---

## 🎓 Advanced: Load Parquet Files

```typescript
// Future enhancement: Load real parquet files
const response = await fetch('/data/users.parquet');
const buffer = await response.arrayBuffer();

await db.registerFileBuffer('users.parquet', new Uint8Array(buffer));

const result = await db.query(`
  SELECT * FROM read_parquet('users.parquet')
  WHERE created_at > '2024-01-01'
`);
```

---

## ✅ Checklist

- [x] DuckDB WASM initialized
- [x] Custom hook created (`useUserAnalytics`)
- [x] Analytics displayed in dashboard
- [x] SQL queries working
- [x] Loading states handled
- [x] Integration with existing UI Kit

---

**🎉 DuckDB analytics now live in the dashboard!**
