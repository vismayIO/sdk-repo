import { initializeDuckDb } from "@sdk-repo/sdk/duck-db";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { UserDashboard } from "./pages/UserDashboard";
import { Button } from "@sdk-repo/sdk/components";

function Navigation() {
    const location = useLocation();

    return (
        <nav className="bg-card border-b border-border">
            <div className="container mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-lg font-bold text-foreground">
                            User MFE
                        </Link>
                        <div className="flex gap-1">
                            <Link
                                to="/"
                                className={`px-3 py-1.5 rounded-md text-sm transition ${
                                    location.pathname === "/"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted"
                                }`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/dashboard"
                                className={`px-3 py-1.5 rounded-md text-sm transition ${
                                    location.pathname === "/dashboard"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted"
                                }`}
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        Standalone MFE · Port 5173
                    </span>
                </div>
            </div>
        </nav>
    );
}

function Home() {
    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-3">
                        User Management MFE
                    </h1>
                    <p className="text-lg text-muted-foreground mb-1">
                        Micro-Frontend with Module Federation
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Standalone mode — also loadable via Host App
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-muted/50 p-5 rounded-lg border border-border">
                        <h3 className="font-semibold text-foreground mb-2">Features</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• CRUD with Frontend SDK</li>
                            <li>• Real-time via NATS (reconnect + dedup)</li>
                            <li>• DuckDB WASM analytics</li>
                            <li>• Role-based permissions</li>
                            <li>• Cross-MFE event bus</li>
                            <li>• Dark mode support</li>
                        </ul>
                    </div>
                    <div className="bg-muted/50 p-5 rounded-lg border border-border">
                        <h3 className="font-semibold text-foreground mb-2">Architecture</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Module Federation (Webpack 5)</li>
                            <li>• Shared SDK (singleton)</li>
                            <li>• UI Kit components</li>
                            <li>• Clean MFE boundaries</li>
                            <li>• Auth context via SDK</li>
                            <li>• Theme system with CSS vars</li>
                        </ul>
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/dashboard">
                        <Button size="lg" className="px-8">
                            Open User Dashboard →
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function App() {
    useEffect(() => {
        initializeDuckDb({
            config: { query: { castBigIntToDouble: true } },
            debug: false,
        });
    }, []);

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-background">
                <Navigation />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<UserDashboard />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
