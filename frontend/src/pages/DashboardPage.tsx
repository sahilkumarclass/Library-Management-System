import { useEffect, useState } from "react";
import { Library, BookCheck, BookX, IndianRupee } from "lucide-react";
import { api } from "@/lib/api";
import { Book, PageResponse, Transaction } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/auth/AuthContext";

type Stats = {
  totalBooks: number;
  available: number;
  issued: number;
  finesCollected: number;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const books = await api.get<PageResponse<Book>>("/books?size=200");
        const totalBooks = books.data.totalElements;
        const available = books.data.content.filter((b) => b.available).length;

        let finesCollected = 0;
        let issued = 0;

        if (user?.role === "ADMIN") {
          const txs = await api.get<PageResponse<Transaction>>("/transactions?size=200");
          issued = txs.data.content.filter((t) => t.status === "ISSUED").length;
          finesCollected = txs.data.content.reduce(
            (sum, t) => sum + (Number(t.fine) || 0),
            0
          );
        } else {
          const mine = await api.get<PageResponse<Transaction>>("/transactions/me?size=200");
          issued = mine.data.content.filter((t) => t.status === "ISSUED").length;
          finesCollected = mine.data.content.reduce(
            (sum, t) => sum + (Number(t.fine) || 0),
            0
          );
        }

        setStats({ totalBooks, available, issued, finesCollected });
      } catch {
        setStats({ totalBooks: 0, available: 0, issued: 0, finesCollected: 0 });
      }
    }
    load();
  }, [user?.role]);

  const cards = [
    {
      label: "Total books",
      value: stats?.totalBooks ?? "–",
      icon: Library,
      tone: "bg-brand-50 text-brand-700",
    },
    {
      label: "Available",
      value: stats?.available ?? "–",
      icon: BookCheck,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: user?.role === "ADMIN" ? "Issued" : "Currently borrowed",
      value: stats?.issued ?? "–",
      icon: BookX,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: user?.role === "ADMIN" ? "Fines collected" : "Your fines",
      value: `₹${stats?.finesCollected ?? 0}`,
      icon: IndianRupee,
      tone: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Library at a glance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div>
                <p className="text-sm text-slate-500">{c.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{c.value}</p>
              </div>
              <div className={`grid h-12 w-12 place-items-center rounded-full ${c.tone}`}>
                <c.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            Use the sidebar to browse books, view your transactions, or — if you're an admin —
            manage the catalog and issue books to members.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
