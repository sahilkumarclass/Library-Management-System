import { useEffect, useMemo, useState } from "react";
import { BookCheck, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api, extractApiError } from "@/lib/api";
import { Book, PageResponse } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";

type Form = { title: string; author: string; isbn: string };

const empty: Form = { title: "", author: "", isbn: "" };

export default function BooksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { toast } = useToast();

  const [data, setData] = useState<PageResponse<Book> | null>(null);
  const [q, setQ] = useState("");
  const [by, setBy] = useState<"title" | "author">("title");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Book | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const path = q
        ? `/books/search?q=${encodeURIComponent(q)}&by=${by}&page=${page}&size=10`
        : `/books?page=${page}&size=10`;
      const res = await api.get<PageResponse<Book>>(path);
      setData(res.data);
    } catch (err) {
      toast(extractApiError(err).message, "error");
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, by, page]);

  function openCreate() {
    setForm(empty);
    setCreating(true);
  }
  function openEdit(b: Book) {
    setForm({ title: b.title, author: b.author, isbn: b.isbn ?? "" });
    setEditing(b);
  }
  function closeAll() {
    setCreating(false);
    setEditing(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/books/${editing.id}`, form);
        toast("Book updated", "success");
      } else {
        await api.post("/books", form);
        toast("Book added", "success");
      }
      closeAll();
      load();
    } catch (err) {
      toast(extractApiError(err).message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(b: Book) {
    if (!confirm(`Delete "${b.title}"?`)) return;
    try {
      await api.delete(`/books/${b.id}`);
      toast("Book deleted", "success");
      load();
    } catch (err) {
      toast(extractApiError(err).message, "error");
    }
  }

  async function borrow(b: Book) {
    if (!confirm(`Borrow "${b.title}"? Due in 14 days.`)) return;
    try {
      await api.post("/transactions/borrow", { bookId: b.id });
      const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString();
      toast(`Borrowed — return by ${due}`, "success");
      load();
    } catch (err) {
      toast(extractApiError(err).message, "error");
    }
  }

  const rows = useMemo(() => data?.content ?? [], [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Books</h1>
          <p className="text-sm text-slate-500">
            {data ? `${data.totalElements} books in catalog` : "Loading..."}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add book
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={q}
              onChange={(e) => {
                setPage(0);
                setQ(e.target.value);
              }}
              placeholder={`Search by ${by}...`}
              className="pl-9"
            />
          </div>
          <select
            value={by}
            onChange={(e) => setBy(e.target.value as "title" | "author")}
            className="input-base h-10 w-36"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Author</th>
                <th className="px-6 py-3">ISBN</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    No books found.
                  </td>
                </tr>
              )}
              {rows.map((b) => (
                <tr key={b.id}>
                  <td className="px-6 py-3 font-medium text-slate-900">{b.title}</td>
                  <td className="px-6 py-3 text-slate-700">{b.author}</td>
                  <td className="px-6 py-3 text-slate-500">{b.isbn || "—"}</td>
                  <td className="px-6 py-3">
                    {b.available ? (
                      <Badge tone="success">Available</Badge>
                    ) : (
                      <Badge tone="warning">Issued</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-2">
                      {b.available && (
                        <Button size="sm" variant="primary" onClick={() => borrow(b)}>
                          <BookCheck className="h-3.5 w-3.5" /> Borrow
                        </Button>
                      )}
                      {isAdmin && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => remove(b)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
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

      <Modal
        open={creating || !!editing}
        onClose={closeAll}
        title={editing ? "Edit book" : "Add book"}
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="isbn">ISBN (optional)</Label>
            <Input
              id="isbn"
              value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeAll}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {editing ? "Save changes" : "Create book"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
