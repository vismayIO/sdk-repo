import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import "@sdk-repo/sdk/styles.css";

// Lazy load remote MFE
const UserDashboard = lazy(() =>
    import("userManagementMfe/UserDashboard")
        .then(module => ({ default: module.UserDashboard }))
        .catch(() => {
            console.error("Failed to load User Management MFE");
            return { default: ErrorFallback };
        })
);

function ErrorFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
                <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ MFE Load Error</h2>
                <p className="text-gray-700 mb-4">
                    Failed to load User Management Micro-Frontend.
                </p>
                <p className="text-sm text-gray-600 mb-4">
                    Make sure the remote app is running on <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5173</code>
                </p>
                <Link
                    to="/"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading Micro-Frontend...</p>
            </div>
        </div>
    );
}

function Navigation() {
    const location = useLocation();

    return (
        <nav className="bg-white shadow-md border-b">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="text-2xl font-bold text-blue-600">
                            🏠 Host App
                        </Link>
                        <div className="flex space-x-4">
                            <Link
                                to="/"
                                className={`px-4 py-2 rounded-lg transition ${location.pathname === "/"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/users"
                                className={`px-4 py-2 rounded-lg transition ${location.pathname === "/users"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                User Management (MFE)
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Port: 5001</span>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-10">
                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">
                            🎯 Host Application
                        </h1>
                        <p className="text-xl text-gray-600 mb-2">
                            Module Federation Demo - Platform Level
                        </p>
                        <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                            ✅ Host Running on Port 5001
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                            <h3 className="font-bold text-lg mb-3 text-blue-900">
                                🏗️ Architecture
                            </h3>
                            <ul className="text-sm space-y-2 text-gray-700">
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span><strong>Host App:</strong> Platform container (Port 5001)</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span><strong>Remote MFE:</strong> User Management (Port 5173)</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span><strong>Shared SDK:</strong> Common utilities & components</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span><strong>Federation:</strong> Runtime module loading</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
                            <h3 className="font-bold text-lg mb-3 text-green-900">
                                ✨ Key Features
                            </h3>
                            <ul className="text-sm space-y-2 text-gray-700">
                                <li className="flex items-start">
                                    <span className="mr-2">✓</span>
                                    <span>Independent deployment of MFEs</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">✓</span>
                                    <span>Shared React singleton</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">✓</span>
                                    <span>Lazy loading with Suspense</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">✓</span>
                                    <span>Error boundaries & fallbacks</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
                        <h3 className="font-bold text-lg mb-3 text-yellow-900">
                            🚀 How to Run
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="bg-white p-3 rounded border border-yellow-200">
                                <code className="text-gray-800">
                                    <strong>1.</strong> Terminal 1: <span className="text-blue-600">cd apps/web && bun run dev</span> (Port 5173)
                                </code>
                            </div>
                            <div className="bg-white p-3 rounded border border-yellow-200">
                                <code className="text-gray-800">
                                    <strong>2.</strong> Terminal 2: <span className="text-blue-600">cd apps/host && bun run dev</span> (Port 5001)
                                </code>
                            </div>
                            <div className="bg-white p-3 rounded border border-yellow-200">
                                <code className="text-gray-800">
                                    <strong>3.</strong> Open: <span className="text-blue-600">http://localhost:5001</span>
                                </code>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/users"
                            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
                        >
                            Load User Management MFE →
                        </Link>
                        <p className="text-sm text-gray-500 mt-3">
                            This will dynamically load the remote micro-frontend
                        </p>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-200">
                        <h3 className="font-semibold mb-3 text-center">📊 MFE Status</h3>
                        <div className="flex justify-center space-x-4">
                            <div className="bg-gray-50 px-4 py-2 rounded-lg">
                                <span className="text-xs text-gray-500">Host App</span>
                                <div className="flex items-center mt-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    <span className="text-sm font-semibold">Running</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-2 rounded-lg">
                                <span className="text-xs text-gray-500">Remote MFE</span>
                                <div className="flex items-center mt-1">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                                    <span className="text-sm font-semibold">Ready to Load</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
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
        </BrowserRouter>
    );
}

export default App;
