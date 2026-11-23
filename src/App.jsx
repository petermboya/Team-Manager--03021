import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function Screen() {
  const { profile, loading } = useAuth();
  if (loading) return <p className="p-8 text-gray-500">Loading...</p>;
  return profile ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <Screen />
    </AuthProvider>
  );
}
