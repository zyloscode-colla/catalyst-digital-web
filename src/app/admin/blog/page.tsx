"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  Star,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import type { BlogPostItem } from "@/types/cms";

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState<"all" | "published" | "draft">("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BlogPostItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    date: new Date().toISOString().split("T")[0],
    tagsInput: "Engineering, Strategy",
    coverImage: "",
    isPublished: true,
    isFeatured: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms?entity=blog");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
      showFeedback("error", "Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  }

  function openCreateModal() {
    setEditingItem(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "Catalyst Editorial Team",
      date: new Date().toISOString().split("T")[0],
      tagsInput: "Architecture, Technology",
      coverImage: "",
      isPublished: true,
      isFeatured: false,
    });
    setIsModalOpen(true);
  }

  function openEditModal(item: BlogPostItem) {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content || "",
      author: item.author,
      date: item.date,
      tagsInput: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      coverImage: item.coverImage || "",
      isPublished: item.isPublished,
      isFeatured: item.isFeatured,
    });
    setIsModalOpen(true);
  }

  function handleTitleChange(val: string) {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !editingItem ? val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : prev.slug,
    }));
  }

  async function handleTogglePublished(item: BlogPostItem) {
    const newStatus = !item.isPublished;
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "blog",
          action: "update",
          data: { id: item.id, isPublished: newStatus },
        }),
      });
      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === item.id ? { ...p, isPublished: newStatus } : p)));
        showFeedback("success", `Article is now ${newStatus ? "Published" : "Draft"}`);
      } else {
        const err = await res.json();
        showFeedback("error", err.error || "Failed to update article");
      }
    } catch {
      showFeedback("error", "Network error toggling publish state");
    }
  }

  async function handleToggleFeatured(item: BlogPostItem) {
    const newStatus = !item.isFeatured;
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "blog",
          action: "update",
          data: { id: item.id, isFeatured: newStatus },
        }),
      });
      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === item.id ? { ...p, isFeatured: newStatus } : p)));
        showFeedback("success", `Article ${newStatus ? "featured on homepage" : "unfeatured"}`);
      }
    } catch {
      showFeedback("error", "Network error updating featured state");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tags = formData.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        author: formData.author,
        date: formData.date,
        tags,
        coverImage: formData.coverImage,
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
      };

      const isEdit = !!editingItem;
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "blog",
          action: isEdit ? "update" : "create",
          data: isEdit ? { id: editingItem.id, ...payload } : payload,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (isEdit) {
          setPosts((prev) => prev.map((p) => (p.id === editingItem.id ? json.data : p)));
          showFeedback("success", `Updated article "${formData.title}"`);
        } else {
          setPosts((prev) => [json.data, ...prev]);
          showFeedback("success", `Created article "${formData.title}"`);
        }
        setIsModalOpen(false);
      } else {
        showFeedback("error", json.error || "Failed to save article");
      }
    } catch {
      showFeedback("error", "Network error while saving article");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to permanently delete article "${title}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "blog",
          action: "delete",
          data: { id },
        }),
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        showFeedback("success", `Deleted article "${title}"`);
      } else {
        const err = await res.json();
        showFeedback("error", err.error || "Failed to delete article");
      }
    } catch {
      showFeedback("error", "Network error while deleting");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterState === "published") return matchesSearch && p.isPublished;
    if (filterState === "draft") return matchesSearch && !p.isPublished;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            Insights & Blog Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Publish thought leadership, engineering case studies, and corporate news.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          Write Article
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {feedback.message}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search articles by title, author, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          {(["all", "published", "draft"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterState(mode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filterState === mode
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode} ({mode === "all" ? posts.length : posts.filter((p) => (mode === "published" ? p.isPublished : !p.isPublished)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-base font-medium text-slate-300">No blog posts found</p>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm ? "Try adjusting your search query" : "Click 'Write Article' to compose your first post"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border bg-slate-900/60 p-5 transition-all ${
                post.isPublished
                  ? "border-slate-800 hover:border-slate-700"
                  : "border-dashed border-amber-500/30 bg-amber-950/5 opacity-80"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono text-indigo-400">/blog/{post.slug}</span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <User className="h-3 w-3" />
                    {post.author}
                  </span>
                  {post.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                      <Star className="h-3 w-3 fill-amber-400" />
                      Featured Pin
                    </span>
                  )}
                </div>

                <h3 className="mt-2 text-base font-semibold text-white truncate">{post.title}</h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{post.excerpt}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 sm:border-l sm:border-slate-800 sm:pl-5">
                <button
                  onClick={() => handleToggleFeatured(post)}
                  className={`rounded-lg p-2 transition-colors ${
                    post.isFeatured
                      ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      : "bg-slate-800 text-slate-500 hover:text-amber-400"
                  }`}
                  title={post.isFeatured ? "Unpin from featured" : "Pin as featured"}
                >
                  <Star className={`h-4 w-4 ${post.isFeatured ? "fill-amber-400" : ""}`} />
                </button>

                <button
                  onClick={() => handleTogglePublished(post)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                    post.isPublished
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {post.isPublished ? (
                    <>
                      <ToggleRight className="h-4 w-4 text-emerald-400" />
                      <span>Published</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4 text-amber-400" />
                      <span>Draft</span>
                    </>
                  )}
                </button>

                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white transition-colors"
                  title="View live post"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>

                <button
                  onClick={() => openEditModal(post)}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
                  title="Edit post"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                <button
                  disabled={deletingId === post.id}
                  onClick={() => handleDelete(post.id, post.title)}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  title="Delete post"
                >
                  {deletingId === post.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-white">
              {editingItem ? `Edit Article: ${editingItem.title}` : "Write New Article"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Compose insights, metadata, and publishing controls.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Modern Web Architecture Patterns for High-Scale SaaS"
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="modern-web-architecture"
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-indigo-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Eleanor Vance"
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Tags (Comma separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tagsInput}
                    onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                    placeholder="Engineering, Architecture, Performance"
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Article Excerpt / Abstract *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="A concise summary displayed on the blog overview card and in social shares..."
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Full Article Body (Markdown / Text)
                </label>
                <textarea
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full content of the post here..."
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-semibold text-white">Publish to Live Site</p>
                    <p className="text-[10px] text-slate-400">Uncheck to keep as draft</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-semibold text-white">Feature on Home</p>
                    <p className="text-[10px] text-slate-400">Pin to featured insights feed</p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingItem ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
