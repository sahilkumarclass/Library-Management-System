import { NavLink } from "react-router-dom";
import { BookOpen, LayoutDashboard, Library, Users, Repeat, BookCheck } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { cn } from "@/lib/cn";

type Item = { to: string; label: string; icon: typeof BookOpen; admin?: boolean; member?: boolean };

const items: Item[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/books", label: "Books", icon: Library },
  { to: "/transactions", label: "Transactions", icon: Repeat, admin: true },
  { to: "/users", label: "Users", icon: Users, admin: true },
  { to: "/my-books", label: "My Books", icon: BookCheck, member: true },
];

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <BookOpen className="h-6 w-6 text-brand-600" />
        <span className="text-base font-semibold text-slate-900">LibraryMS</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items
          .filter((it) => (it.admin ? isAdmin : it.member ? !isAdmin : true))
          .map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )
              }
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </NavLink>
          ))}
      </nav>
      <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
        v0.1.0 · Spring Boot + React
      </div>
    </aside>
  );
}
