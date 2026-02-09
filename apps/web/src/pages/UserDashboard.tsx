import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useUsers, useNats, useAuth, useEventBus } from '@sdk-repo/sdk/hooks';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Button,
    Badge,
    Input,
    Avatar,
    Skeleton,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    useToast,
    Toaster,
} from '@sdk-repo/sdk/components';
import { UserForm } from '../components/UserForm';
import { useUserAnalytics } from '../hooks/useUserAnalytics';
import type { User } from '@sdk-repo/sdk/api';

type SortField = 'name' | 'email' | 'role' | 'createdAt';
type SortOrder = 'asc' | 'desc';

// ─── Memoized Stat Card ────────────────────────────────────────────────────────

const StatCard = memo(function StatCard({
    title,
    value,
    subtitle,
    color = 'text-foreground',
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium">{title}</CardDescription>
                <CardTitle className={`text-3xl font-bold ${color}`}>{value}</CardTitle>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                )}
            </CardHeader>
        </Card>
    );
});

// ─── Memoized User Row ─────────────────────────────────────────────────────────

const ROLE_BADGE_VARIANT: Record<string, 'error' | 'success' | 'warning' | 'default'> = {
    Admin: 'error',
    Developer: 'success',
    Designer: 'warning',
    Manager: 'default',
    Viewer: 'default',
};

const UserRow = memo(function UserRow({
    user,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
}: {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
    canEdit: boolean;
    canDelete: boolean;
}) {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="sm" />
                    <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell text-foreground">
                {user.email}
            </TableCell>
            <TableCell>
                <Badge variant={ROLE_BADGE_VARIANT[user.role] || 'default'}>
                    {user.role}
                </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                })}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    {canEdit && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                            Edit
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(user.id)}
                        >
                            Delete
                        </Button>
                    )}
                    {!canEdit && !canDelete && (
                        <span className="text-xs text-muted-foreground italic">View only</span>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
});

// ─── Sort Indicator ─────────────────────────────────────────────────────────────

function SortIcon({
    field,
    currentField,
    order,
}: {
    field: string;
    currentField: string;
    order: SortOrder;
}) {
    if (field !== currentField)
        return <span className="text-muted-foreground/30 ml-1">↕</span>;
    return <span className="ml-1">{order === 'asc' ? '↑' : '↓'}</span>;
}

// ─── Main Dashboard Component ───────────────────────────────────────────────────

export function UserDashboard() {
    const { users, loading, error, createUser, updateUser, deleteUser, refetch } =
        useUsers();
    const { subscribe, unsubscribe, publish, status, connected } = useNats({
        autoConnect: true,
    });
    const { user: authUser, hasPermission } = useAuth();
    const { emit } = useEventBus();
    const { stats, loading: analyticsLoading } = useUserAnalytics(users);
    const { toasts, toast, dismiss } = useToast();

    // Local state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // ─── NATS Real-time Subscription ───────────────────────────────────────────

    useEffect(() => {
        const handleEvent = (data: any) => {
            toast({
                message: `Real-time: ${data.action || 'update'} — ${data.name || 'User'}`,
                type: 'info',
                duration: 3000,
            });
            refetch();
        };

        subscribe('user.created', handleEvent);
        subscribe('user.updated', handleEvent);
        subscribe('user.deleted', handleEvent);

        return () => {
            unsubscribe('user.created');
            unsubscribe('user.updated');
            unsubscribe('user.deleted');
        };
    }, [subscribe, unsubscribe, refetch, toast]);

    // ─── Filtered & Sorted Users ───────────────────────────────────────────────

    const filteredUsers = useMemo(() => {
        let result = [...users];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (u) =>
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q)
            );
        }

        if (roleFilter !== 'all') {
            result = result.filter((u) => u.role === roleFilter);
        }

        result.sort((a, b) => {
            const aVal = a[sortField] || '';
            const bVal = b[sortField] || '';
            const cmp = String(aVal).localeCompare(String(bVal));
            return sortOrder === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [users, searchQuery, roleFilter, sortField, sortOrder]);

    const uniqueRoles = useMemo(
        () => [...new Set(users.map((u) => u.role))],
        [users]
    );

    // ─── Handlers ──────────────────────────────────────────────────────────────

    const handleSort = useCallback((field: SortField) => {
        setSortField((prev) => {
            if (prev === field) {
                setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                return field;
            }
            setSortOrder('asc');
            return field;
        });
    }, []);

    const handleCreate = useCallback(
        async (data: { name: string; email: string; role: string }) => {
            try {
                const newUser = await createUser(data);
                setIsFormOpen(false);
                toast({ message: `User "${data.name}" created`, type: 'success' });
                publish('user.created', {
                    ...data,
                    id: newUser?.id,
                    action: 'created',
                });
                emit('user:created', {
                    id: newUser?.id,
                    name: data.name,
                    email: data.email,
                });
            } catch {
                toast({ message: 'Failed to create user', type: 'error' });
            }
        },
        [createUser, toast, publish, emit]
    );

    const handleUpdate = useCallback(
        async (data: { name: string; email: string; role: string }) => {
            if (!editingUser) return;
            try {
                await updateUser(editingUser.id, data);
                setEditingUser(null);
                setIsFormOpen(false);
                toast({ message: `User "${data.name}" updated`, type: 'success' });
                publish('user.updated', {
                    ...data,
                    id: editingUser.id,
                    action: 'updated',
                });
                emit('user:updated', {
                    id: editingUser.id,
                    name: data.name,
                    email: data.email,
                });
            } catch {
                toast({ message: 'Failed to update user', type: 'error' });
            }
        },
        [editingUser, updateUser, toast, publish, emit]
    );

    const handleDelete = useCallback(async () => {
        if (!deleteConfirmId) return;
        const user = users.find((u) => u.id === deleteConfirmId);
        try {
            await deleteUser(deleteConfirmId);
            setDeleteConfirmId(null);
            toast({ message: `User "${user?.name}" deleted`, type: 'success' });
            publish('user.deleted', {
                id: deleteConfirmId,
                name: user?.name,
                action: 'deleted',
            });
            emit('user:deleted', { id: deleteConfirmId });
        } catch {
            toast({ message: 'Failed to delete user', type: 'error' });
        }
    }, [deleteConfirmId, users, deleteUser, toast, publish, emit]);

    const handleEdit = useCallback((user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    }, []);

    const handleCloseForm = useCallback(() => {
        setIsFormOpen(false);
        setEditingUser(null);
    }, []);

    // ─── Loading State ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-7xl space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-96" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                </div>
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-96 rounded-lg" />
            </div>
        );
    }

    // ─── Error State ───────────────────────────────────────────────────────────

    if (error) {
        return (
            <div className="container mx-auto p-6 max-w-7xl">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">
                            Something went wrong
                        </CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={refetch}>Try Again</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ─── Main Render ───────────────────────────────────────────────────────────

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-6">
            <Toaster toasts={toasts} onDismiss={dismiss} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        User Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage users across the platform
                        {authUser && (
                            <span className="ml-2 text-xs">
                                · Logged in as{' '}
                                <strong>{authUser.name}</strong> ({authUser.role})
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* NATS Status Indicator */}
                    <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border border-border bg-card">
                        <span
                            className={`h-2 w-2 rounded-full ${
                                connected
                                    ? 'bg-green-500 animate-pulse'
                                    : status.reconnecting
                                    ? 'bg-yellow-500 animate-pulse'
                                    : 'bg-red-500'
                            }`}
                        />
                        <span className="text-muted-foreground text-xs">
                            {connected
                                ? 'Live'
                                : status.reconnecting
                                ? `Reconnecting (${status.reconnectAttempt})`
                                : 'Offline'}
                        </span>
                    </div>

                    {hasPermission('canCreate') && (
                        <Button
                            onClick={() => {
                                setEditingUser(null);
                                setIsFormOpen(true);
                            }}
                        >
                            + Add User
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={users.length}
                    color="text-blue-600"
                />
                <StatCard
                    title="Admins"
                    value={users.filter((u) => u.role === 'Admin').length}
                    color="text-red-600"
                />
                <StatCard
                    title="Developers"
                    value={users.filter((u) => u.role === 'Developer').length}
                    color="text-green-600"
                />
                <StatCard
                    title="Real-time"
                    value={connected ? 'Live' : 'Offline'}
                    subtitle={status.error || undefined}
                    color={connected ? 'text-green-600' : 'text-red-600'}
                />
            </div>

            {/* DuckDB Analytics */}
            {!analyticsLoading && stats.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                            Role Distribution — DuckDB Analytics
                        </CardTitle>
                        <CardDescription>
                            Real-time analytics powered by DuckDB WASM
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {stats.map((stat) => (
                                <div
                                    key={stat.role}
                                    className="bg-muted/50 rounded-lg p-3 border border-border"
                                >
                                    <p className="text-sm text-muted-foreground">
                                        {stat.role}
                                    </p>
                                    <p className="text-xl font-bold text-foreground">
                                        {stat.count}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Avg name: {stat.avg_name_length.toFixed(1)} chars
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background text-foreground px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <option value="all">All Roles</option>
                    {uniqueRoles.map((role) => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </select>
            </div>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-4xl mb-4">👥</p>
                            <p className="text-lg font-medium text-foreground">
                                {users.length === 0
                                    ? 'No users yet'
                                    : 'No users match your filters'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 mb-4">
                                {users.length === 0
                                    ? 'Get started by adding the first user'
                                    : 'Try adjusting your search or filters'}
                            </p>
                            {users.length === 0 && hasPermission('canCreate') && (
                                <Button onClick={() => setIsFormOpen(true)}>
                                    Create First User
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="cursor-pointer select-none"
                                        onClick={() => handleSort('name')}
                                    >
                                        User
                                        <SortIcon
                                            field="name"
                                            currentField={sortField}
                                            order={sortOrder}
                                        />
                                    </TableHead>
                                    <TableHead
                                        className="hidden md:table-cell cursor-pointer select-none"
                                        onClick={() => handleSort('email')}
                                    >
                                        Email
                                        <SortIcon
                                            field="email"
                                            currentField={sortField}
                                            order={sortOrder}
                                        />
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer select-none"
                                        onClick={() => handleSort('role')}
                                    >
                                        Role
                                        <SortIcon
                                            field="role"
                                            currentField={sortField}
                                            order={sortOrder}
                                        />
                                    </TableHead>
                                    <TableHead
                                        className="hidden lg:table-cell cursor-pointer select-none"
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        Created
                                        <SortIcon
                                            field="createdAt"
                                            currentField={sortField}
                                            order={sortOrder}
                                        />
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <UserRow
                                        key={user.id}
                                        user={user}
                                        onEdit={handleEdit}
                                        onDelete={(id) => setDeleteConfirmId(id)}
                                        canEdit={hasPermission('canEdit')}
                                        canDelete={hasPermission('canDelete')}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                {filteredUsers.length > 0 && (
                    <CardFooter className="border-t border-border py-3 px-6">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredUsers.length} of {users.length} users
                        </p>
                    </CardFooter>
                )}
            </Card>

            {/* User Form Dialog */}
            <UserForm
                open={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={editingUser ? handleUpdate : handleCreate}
                initialData={editingUser}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!deleteConfirmId}
                onOpenChange={() => setDeleteConfirmId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "
                            {users.find((u) => u.id === deleteConfirmId)?.name}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmId(null)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
