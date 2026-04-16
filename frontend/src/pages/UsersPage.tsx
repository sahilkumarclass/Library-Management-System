import { useEffect, useState } from "react";
import { api, extractApiError } from "@/lib/api";
import { PageResponse, User } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function UsersPage() {
  const { toast } = useToast();
  const [data, setData] = useState<PageResponse<User> | null>(null);
  const [page, setPage] = useState(0);

  async function load() {
    try {
      const res = await api.get<PageResponse<User>>(`/users?page=${page}&size=10`);
      setData(res.data);
    } catch (err) {
      toast(extractApiError(err).message, "error");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">
          {data ? `${data.totalElements} registered members` : "Loading..."}
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm">
              {data?.content.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-6 py-3 text-slate-700">{u.email}</td>
                  <td className="px-6 py-3">
                    <Badge tone={u.role === "ADMIN" ? "info" : "default"}>{u.role}</Badge>
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-sm text-slate-600">
            <span>
              Page {data.page + 1} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
