import { LogOut } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Welcome back</p>
        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone={user?.role === "ADMIN" ? "info" : "default"}>
          {user?.role === "ADMIN" ? "Admin" : "Member"}
        </Badge>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </header>
  );
}
