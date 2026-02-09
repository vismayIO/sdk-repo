import { initializeDuckDb } from "@sdk-repo/sdk/duck-db";
import "@sdk-repo/sdk/styles.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { UserDashboard } from "./pages/UserDashboard";
import { Button } from "@sdk-repo/sdk/components";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 Micro-Frontend POC
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            User Management System with Module Federation
          </p>
          <p className="text-sm text-gray-500">
            Built with React 19, Vite, Module Federation & Custom SDK
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">✅ Features Implemented</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Module Federation Setup</li>
              <li>• Frontend SDK Integration</li>
              <li>• Real-time Events (Mock)</li>
              <li>• UI Kit Components</li>
              <li>• CRUD Operations</li>
              <li>• Loading & Error States</li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">🎯 Architecture</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Monorepo (Turborepo)</li>
              <li>• Shared SDK Package</li>
              <li>• Micro-Frontend (MFE)</li>
              <li>• Clean Boundaries</li>
              <li>• Reusable Components</li>
              <li>• Type-Safe APIs</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link to="/dashboard">
            <Button size="lg" className="text-lg px-8 py-6">
              Open User Dashboard →
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold mb-3">📦 Tech Stack:</h3>
          <div className="flex flex-wrap gap-2">
            {['React 19', 'TypeScript', 'Vite', 'Module Federation', 'Tailwind CSS', 'Socket.io', 'DuckDB WASM'].map(tech => (
              <span key={tech} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    const config = {
      query: {
        castBigIntToDouble: true,
      },
    };
    initializeDuckDb({ config, debug: true });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
