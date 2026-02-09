import { lazy, Suspense, useEffect, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    useLocation,
} from "react-router-dom";
import {
    AuthProvider,
    useAuth,
    ThemeProvider,
    useTheme,
    useEventBus,
} from "@sdk-repo/sdk/hooks";
import type { AuthUser } from "@sdk-repo/sdk/hooks";
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    Avatar,
    Badge,
    useToast,
    Toaster,
} from "@sdk-repo/sdk/components";
import { initializeDuckDb } from "@sdk-repo/sdk/duck-db";
import "@sdk-repo/sdk/styles.css";
import "./index.css";

// ─── Lazy load Remote MFE ──────────────────────────────────────────────────────

const UserDashboard = lazy(() =>
    import("userManagementMfe/UserDashboard")
        .then((module) => ({ default: module.UserDashboard }))
        .catch(() => ({ default: ErrorFallback }))
);

// ─── Error Fallback ─────────────────────────────────────────────────────────────

function ErrorFallback() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-destructive">
                        MFE Load Failed
                    </CardTitle>
                    <CardDescription>
                        Could not load the User Management micro-frontend. Make sure
                        the remote app is running on{" "}
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                            http://localhost:5173
                        </code>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                        <Link to="/">
                            <Button variant="outline">Go Home</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Loading Fallback ───────────────────────────────────────────────────────────

function LoadingFallback() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                    Loading Micro-Frontend...
                </p>
            </div>
        </div>
    );
}

// ─── Login Screen ───────────────────────────────────────────────────────────────

const DEMO_USERS: {
    role: AuthUser["role"];
    name: string;
    email: string;
    desc: string;
    icon: string;
    permissions: string[];
    color: string;
}[] = [
    {
        role: "Admin",
        name: "Rahul Kumar",
        email: "rahul@company.com",
        desc: "Full platform access",
        icon: "👑",
        permissions: ["Create", "Edit", "Delete", "Export", "Manage Roles"],
        color: "border-red-200 hover:border-red-400 dark:border-red-800 dark:hover:border-red-600",
    },
    {
        role: "Manager",
        name: "Neha Singh",
        email: "neha@company.com",
        desc: "Team management access",
        icon: "📊",
        permissions: ["Create", "Edit", "Export"],
        color: "border-blue-200 hover:border-blue-400 dark:border-blue-800 dark:hover:border-blue-600",
    },
    {
        role: "Developer",
        name: "Priya Sharma",
        email: "priya@company.com",
        desc: "Development access",
        icon: "💻",
        permissions: ["Create", "Edit"],
        color: "border-green-200 hover:border-green-400 dark:border-green-800 dark:hover:border-green-600",
    },
    {
        role: "Designer",
        name: "Amit Patel",
        email: "amit@company.com",
        desc: "Design access only",
        icon: "🎨",
        permissions: ["Edit"],
        color: "border-purple-200 hover:border-purple-400 dark:border-purple-800 dark:hover:border-purple-600",
    },
    {
        role: "Viewer",
        name: "Vikram Joshi",
        email: "vikram@company.com",
        desc: "Read-only access",
        icon: "👁️",
        permissions: ["View only"],
        color: "border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500",
    },
];

function LoginScreen() {
    const { login } = useAuth();
    const { toggleTheme, resolvedTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                {/* Theme toggle */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition text-lg"
                        title="Toggle theme"
                    >
                        {resolvedTheme === "dark" ? "☀️" : "🌙"}
                    </button>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        Platform Login
                    </h1>
                    <p className="text-muted-foreground">
                        Select a role to explore different permission levels
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DEMO_USERS.map((u) => (
                        <button
                            key={u.role}
                            onClick={() =>
                                login({
                                    id: `user-${u.role.toLowerCase()}`,
                                    name: u.name,
                                    email: u.email,
                                    role: u.role,
                                })
                            }
                            className={`p-5 rounded-xl border-2 bg-card text-left transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${u.color}`}
                        >
                            <div className="text-3xl mb-3">{u.icon}</div>
                            <h3 className="font-bold text-lg text-foreground">
                                {u.role}
                            </h3>
                            <p className="text-sm text-foreground/80 mt-0.5">
                                {u.name}
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                                {u.desc}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {u.permissions.map((p) => (
                                    <span
                                        key={p}
                                        className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                                    >
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    This is a simulated login for demonstrating role-based access
                    control across micro-frontends.
                </p>
            </div>
        </div>
    );
}

// ─── Navigation ─────────────────────────────────────────────────────────────────

function Navigation() {
    const { user, logout, permissions } = useAuth();
    const { toggleTheme, resolvedTheme } = useTheme();
    const location = useLocation();
    const { on, off } = useEventBus();
    const { toasts, toast, dismiss } = useToast();
    const [mfeNotification, setMfeNotification] = useState<string | null>(null);

    // Listen for cross-MFE events from the remote MFE
    useEffect(() => {
        on("user:created", (data: any) => {
            setMfeNotification(`New user: ${data.name}`);
            toast({ message: `MFE Event: User "${data.name}" created`, type: "info", duration: 3000 });
            setTimeout(() => setMfeNotification(null), 4000);
        });
        on("user:updated", (data: any) => {
            toast({ message: `MFE Event: User "${data.name}" updated`, type: "info", duration: 3000 });
        });
        on("user:deleted", () => {
            toast({ message: "MFE Event: User deleted", type: "warning", duration: 3000 });
        });

        return () => {
            off("user:created");
            off("user:updated");
            off("user:deleted");
        };
    }, [on, off, toast]);

    const navLinks = [
        { path: "/", label: "Home" },
        { path: "/users", label: "User Management" },
    ];

    const permissionCount = Object.values(permissions).filter(Boolean).length;

    return (
        <>
            <Toaster toasts={toasts} onDismiss={dismiss} />
            <nav className="bg-card border-b border-border sticky top-0 z-40">
                <div className="container mx-auto px-6 py-3">
                    <div className="flex items-center justify-between">
                        {/* Left: Logo + Nav */}
                        <div className="flex items-center gap-6">
                            <Link
                                to="/"
                                className="text-lg font-bold text-foreground"
                            >
                                Platform
                            </Link>
                            <div className="flex gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                                            location.pathname === link.path
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right: Notification + Theme + User */}
                        <div className="flex items-center gap-3">
                            {/* MFE Notification Badge */}
                            {mfeNotification && (
                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full animate-pulse">
                                    {mfeNotification}
                                </span>
                            )}

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-muted transition"
                                title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
                            >
                                {resolvedTheme === "dark" ? "☀️" : "🌙"}
                            </button>

                            {/* User Info */}
                            {user && (
                                <div className="flex items-center gap-3 pl-3 border-l border-border">
                                    <Avatar name={user.name} size="sm" />
                                    <div className="hidden md:block">
                                        <p className="text-sm font-medium text-foreground leading-tight">
                                            {user.name}
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <Badge
                                                variant={
                                                    user.role === "Admin"
                                                        ? "error"
                                                        : "default"
                                                }
                                            >
                                                {user.role}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground">
                                                {permissionCount}/5 perms
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={logout}
                                    >
                                        Logout
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

// ─── Home Page ──────────────────────────────────────────────────────────────────

function HomePage() {
    const { user, permissions } = useAuth();

    const permList = Object.entries(permissions)
        .map(([key, val]) => ({
            label: key
                .replace("can", "")
                .replace(/([A-Z])/g, " $1")
                .trim(),
            allowed: val,
        }));

    return (
        <div className="container mx-auto px-6 py-10">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        Host Application
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Module Federation Platform — {user?.role} Dashboard
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Architecture Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Architecture</CardTitle>
                            <CardDescription>
                                Micro-frontend platform overview
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                        Host App
                                    </span>
                                    <Badge variant="success">Port 5001</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                        Remote MFE
                                    </span>
                                    <Badge variant="default">Port 5173</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                        Shared SDK
                                    </span>
                                    <Badge variant="default">Singleton</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                        Federation
                                    </span>
                                    <Badge variant="default">Webpack 5</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Your Permissions
                            </CardTitle>
                            <CardDescription>
                                Logged in as {user?.name} ({user?.role})
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {permList.map(({ label, allowed }) => (
                                    <div
                                        key={label}
                                        className="flex justify-between items-center text-sm"
                                    >
                                        <span className="text-foreground">
                                            {label}
                                        </span>
                                        <span
                                            className={
                                                allowed
                                                    ? "text-green-600 font-medium"
                                                    : "text-red-500"
                                            }
                                        >
                                            {allowed ? "✓ Allowed" : "✕ Denied"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Features */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Platform Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                "Module Federation",
                                "Role-Based Access",
                                "Dark Mode",
                                "NATS Real-time",
                                "DuckDB Analytics",
                                "Cross-MFE Events",
                                "Shared SDK",
                                "UI Kit Components",
                                "CLI Tooling",
                            ].map((feature) => (
                                <div
                                    key={feature}
                                    className="flex items-center gap-2 text-sm text-foreground bg-muted/50 rounded-lg px-3 py-2"
                                >
                                    <span className="text-green-500">✓</span>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* CTA */}
                <div className="text-center">
                    <Link to="/users">
                        <Button size="lg" className="px-8">
                            Open User Management MFE →
                        </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-3">
                        The remote micro-frontend will be lazy loaded via Module
                        Federation
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── App Content (Authenticated) ────────────────────────────────────────────────

function AppContent() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                    path="/users"
                    element={
                        <Suspense fallback={<LoadingFallback />}>
                            <UserDashboard />
                        </Suspense>
                    }
                />
            </Routes>
        </div>
    );
}

// ─── Root App with Providers ────────────────────────────────────────────────────

function App() {
    // Initialize DuckDB for analytics
    useEffect(() => {
        initializeDuckDb({
            config: { query: { castBigIntToDouble: true } },
            debug: false,
        });
    }, []);

    return (
        <ThemeProvider defaultTheme="light">
            <AuthProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
