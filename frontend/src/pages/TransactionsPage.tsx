import { useEffect, useState } from "react";
import { Plus, Undo2 } from "lucide-react";
import { api, extractApiError } from "@/lib/api";
import { Book, PageResponse, Transaction, User } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";

export default function TransactionsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<PageResponse<Transaction> | null>(null);
  const [page, setPage] = useState(0);
  const [issueOpen, setIssueOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookId, setBookId] = useState<number | "">("");
  const [userId, setUserId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const res = await api.get<PageResponse<Transaction>>(
        `/transactions?page=${page}&size=10&sort=id,desc`
      );
      setData(res.data);
    } catch (err) {
      toast(extractApiError(err).message, "error");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function openIssue() {
    setIssueOpen(true);
    try {
      const [bs, us] = await Promise.all([
        api.get<PageResponse<Book>>("/books?size=200"),
        api.get<PageResponse<User>>("/users?size=200"),
      ]);
      setBooks(bs.data.content.filter((b) => b.available));
      setUsers(us.data.content);
    } catch (err) {
      toast(extractApiError(err).message, "error");
    }
  }

  async function issue(e: React.FormEvent) {
    e.preventDefault();
    if (bookId === "" || userId === "") return;
    setSubmitting(true);
    try {
      await api.post("/transactions/issue", { bookId, userId });
      toast("Book issued", "success");
      setIssueOpen(false);
      setBookId("");
      setUserId("");
      load();
    } catch (err) {
      toast(extractApiError(err).message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function returnTxn(t: Transaction) {
    if (!confirm(`Mark "${t.bookTitle}" as returned?`)) return;
    try {
      await api.post(`/transactions/${t.id}/return`);
      toast("Book returned", "success");
      load();
    } catch (err) {
      toast(extractApiError(err).message, "error");
    }
  }

  function isOverdue(t: Transaction) {
    return (
      t.status === "ISSUED" && new Date(t.dueDate).getTime() < Date.now()
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Transactions</h1>
          <p className="text-sm text-slate-500">Issue and return books, track fines.</p>
        </div>
        <Button onClick={openIssue}>
          <Plus className="h-4 w-4" /> Issue book
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Book</th>
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3">Issued</th>
                <th className="px-6 py-3">Due</th>
                <th className="px-6 py-3">Returned</th>
                <th className="px-6 py-3">Fine</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm">
              {data?.content.map((t) => (
                <tr key={t.id} className={isOverdue(t) ? "bg-red-50/50" : ""}>
                  <td className="px-6 py-3 font-medium text-slate-900">{t.bookTitle}</td>
                  <td className="px-6 py-3 text-slate-700">{t.userName}</td>
                  <td className="px-6 py-3 text-slate-500">{t.issueDate}</td>
                  <td className="px-6 py-3 text-slate-500">
                    {t.dueDate}{" "}
                    {isOverdue(t) && <Badge tone="danger">Overdue</Badge>}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{t.returnDate ?? "—"}</td>
                  <td className="px-6 py-3 text-slate-700">₹{Number(t.fine || 0)}</td>
                  <td className="px-6 py-3">
                    {t.status === "ISSUED" ? (
                      <Badge tone="warning">Issued</Badge>
                    ) : (
                      <Badge tone="success">Returned</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end">
                      {t.status === "ISSUED" && (
                        <Button size="sm" variant="outline" onClick={() => returnTxn(t)}>
                          <Undo2 className="h-3.5 w-3.5" /> Return
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data?.content.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                    No transactions yet.
                  </td>
                </tr>
              )}
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

      <Modal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Issue a book"
        description="Pick an available book and a member."
      >
        <form onSubmit={issue} className="space-y-4">
          <div>
            <Label htmlFor="book">Book</Label>
            <select
              id="book"
              value={bookId}
              onChange={(e) => setBookId(Number(e.target.value))}
              required
              className="input-base"
            >
              <option value="">Select a book...</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.author}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="user">Member</Label>
            <select
              id="user"
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              required
              className="input-base"
            >
              <option value="">Select a member...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIssueOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              Issue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
