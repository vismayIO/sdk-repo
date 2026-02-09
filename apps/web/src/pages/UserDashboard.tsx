import { useState, useEffect } from 'react';
import { useUsers, useNats } from '@sdk-repo/sdk/hooks';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Button,
    Badge,
} from '@sdk-repo/sdk/components';
import { UserForm } from '../components/UserForm';
import { useUserAnalytics } from '../hooks/useUserAnalytics';
import type { User } from '@sdk-repo/sdk/api';

export function UserDashboard() {
    const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
    const { subscribe, unsubscribe, publish, connected } = useNats({ autoConnect: true });
    const { stats, loading: analyticsLoading } = useUserAnalytics(users);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

    // NATS Real-time event subscription
    useEffect(() => {
        const handleUserCreated = (data: any) => {
            console.log('🔔 NATS Event: USER_CREATED', data);
            setRealtimeNotification(`New user created: ${data.name}`);
            setTimeout(() => setRealtimeNotification(null), 3000);
        };

        subscribe('user.created', handleUserCreated);

        return () => {
            unsubscribe('user.created');
        };
    }, [subscribe, unsubscribe]);

    const handleCreateUser = async (data: any) => {
        const newUser = await createUser(data);
        setIsFormOpen(false);

        // Publish NATS event
        publish('user.created', { ...data, id: newUser?.id || Date.now().toString() });
    };

    const handleUpdateUser = async (data: any) => {
        if (editingUser) {
            await updateUser(editingUser.id, data);
            setEditingUser(null);
            setIsFormOpen(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            await deleteUser(id);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingUser(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Real-time Notification */}
            {realtimeNotification && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in-right z-50">
                    🔔 {realtimeNotification}
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management MFE</h1>
                <p className="text-gray-600">Micro-frontend with NATS real-time + DuckDB analytics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Total Users</CardTitle>
                        <CardDescription className="text-3xl font-bold text-blue-600">
                            {users.length}
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Admins</CardTitle>
                        <CardDescription className="text-3xl font-bold text-green-600">
                            {users.filter(u => u.role === 'Admin').length}
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">NATS Status</CardTitle>
                        <CardDescription>
                            <Badge variant={connected ? "success" : "error"}>
                                {connected ? "Connected" : "Disconnected"}
                            </Badge>
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* DuckDB Analytics */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>📊 DuckDB Analytics</CardTitle>
                    <CardDescription>Real-time analytics powered by DuckDB WASM</CardDescription>
                </CardHeader>
                <CardContent>
                    {analyticsLoading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {stats.map((stat) => (
                                <div key={stat.role} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border">
                                    <div className="text-sm text-gray-600 mb-1">{stat.role}</div>
                                    <div className="text-2xl font-bold text-gray-900">{stat.count} users</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Avg name length: {stat.avg_name_length.toFixed(1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Users List</CardTitle>
                            <CardDescription>View and manage all users</CardDescription>
                        </div>
                        <Button onClick={() => setIsFormOpen(true)}>
                            + Add User
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No users found</p>
                            <Button onClick={() => setIsFormOpen(true)}>Create First User</Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    user.role === 'Admin'
                                                        ? 'error'
                                                        : user.role === 'Developer'
                                                            ? 'success'
                                                            : 'default'
                                                }
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(user)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* User Form Dialog */}
            <UserForm
                open={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                initialData={editingUser}
            />
        </div>
    );
}
