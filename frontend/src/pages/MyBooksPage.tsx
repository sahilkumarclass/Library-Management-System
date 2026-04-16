import { useEffect, useState } from "react";
import { api, extractApiError } from "@/lib/api";
import { PageResponse, Transaction } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

export default function MyBooksPage() {
  const { toast } = useToast();
  const [data, setData] = useState<PageResponse<Transaction> | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<PageResponse<Transaction>>(
          "/transactions/me?size=50&sort=id,desc"
        );
        setData(res.data);
      } catch (err) {
        toast(extractApiError(err).message, "error");
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My books</h1>
        <p className="text-sm text-slate-500">Books you have borrowed and returned.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Book</th>
                <th className="px-6 py-3">Issued</th>
                <th className="px-6 py-3">Due</th>
                <th className="px-6 py-3">Returned</th>
                <th className="px-6 py-3">Fine</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm">
              {data?.content.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    You haven't borrowed any books yet.
                  </td>
                </tr>
              )}
              {data?.content.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-3 font-medium text-slate-900">{t.bookTitle}</td>
                  <td className="px-6 py-3 text-slate-500">{t.issueDate}</td>
                  <td className="px-6 py-3 text-slate-500">{t.dueDate}</td>
                  <td className="px-6 py-3 text-slate-500">{t.returnDate ?? "—"}</td>
                  <td className="px-6 py-3 text-slate-700">₹{Number(t.fine || 0)}</td>
                  <td className="px-6 py-3">
                    {t.status === "ISSUED" ? (
                      <Badge tone="warning">Issued</Badge>
                    ) : (
                      <Badge tone="success">Returned</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
