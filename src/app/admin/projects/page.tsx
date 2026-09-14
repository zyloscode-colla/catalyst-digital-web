"use client";

import { useState, useEffect } from "react";
import {
  FolderGit2,
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
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import type { ProjectItem } from "@/types/cms";

export default function ProjectsManager() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    tagsInput: "",
    image: "",
    displayOrder: 1,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms?entity=projects");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data.sort((a, b) => a.displayOrder - b.displayOrder));
      }
    } catch (err) {
      console.error(err);
      showFeedback("error", "Failed to load projects");
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
      description: "",
      tagsInput: "Web Development, TypeScript, Cloud",
      image: "",
      displayOrder: projects.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  }

  function openEditModal(item: ProjectItem) {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      description: item.description,
      tagsInput: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      image: item.image || "",
      displayOrder: item.displayOrder,
      isActive: item.isActive,
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

  async function handleToggleActive(item: ProjectItem) {
    const newStatus = !item.isActive;
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "projects",
          action: "update",
          data: { id: item.id, isActive: newStatus },
        }),
      });
      if (res.ok) {
        setProjects((prev) => prev.map((p) => (p.id === item.id ? { ...p, isActive: newStatus } : p)));
        showFeedback("success", `Project "${item.title}" is now ${newStatus ? "Active" : "Inactive"}`);
      } else {
        const err = await res.json();
        showFeedback("error", err.error || "Failed to toggle status");
      }
    } catch {
      showFeedback("error", "Network error toggling status");
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
        description: formData.description,
        tags,
        image: formData.image,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      };

      const isEdit = !!editingItem;
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "projects",
          action: isEdit ? "update" : "create",
          data: isEdit ? { id: editingItem.id, ...payload } : payload,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (isEdit) {
          setProjects((prev) => prev.map((p) => (p.id === editingItem.id ? json.data : p)));
          showFeedback("success", `Updated project "${formData.title}"`);
        } else {
          setProjects((prev) => [...prev, json.data].sort((a, b) => a.displayOrder - b.displayOrder));
          showFeedback("success", `Created project "${formData.title}"`);
        }
        setIsModalOpen(false);
      } else {
        showFeedback("error", json.error || "Failed to save project");
      }
    } catch {
      showFeedback("error", "Network error while saving project");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to permanently delete project "${title}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "projects",
          action: "delete",
          data: { id },
        }),
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        showFeedback("success", `Deleted project "${title}"`);
      } else {
        const err = await res.json();
        showFeedback("error", err.error || "Failed to delete project");
      }
    } catch {
      showFeedback("error", "Network error while deleting");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterActive === "active") return matchesSearch && p.isActive;
    if (filterActive === "inactive") return matchesSearch && !p.isActive;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <FolderGit2 className="h-6 w-6 text-indigo-400" />
            Projects Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Showcase client work, case studies, technical stacks, and deliverables.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Project
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
            placeholder="Search projects by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          {(["all", "active", "inactive"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterActive(mode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filterActive === mode
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode} ({mode === "all" ? projects.length : projects.filter((p) => (mode === "active" ? p.isActive : !p.isActive)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <FolderGit2 className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-base font-medium text-slate-300">No projects found</p>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm ? "Try adjusting your search criteria" : "Click 'Add Project' above to create one"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`relative flex flex-col justify-between rounded-2xl border bg-slate-900/60 p-5 transition-all ${
                project.isActive
                  ? "border-slate-800 hover:border-slate-700"
                  : "border-dashed border-red-500/20 bg-red-950/5 opacity-70"
              }`}
            >
              <div>
                {/* Visual Cover / Placeholder */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-600">
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-[10px] font-mono">No cover image</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-slate-300 backdrop-blur-md">
                    #{project.displayOrder}
                  </span>
                </div>

                {/* Status Toggle & Title */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400">/work/{project.slug}</span>
                  <button
                    onClick={() => handleToggleActive(project)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                      project.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {project.isActive ? (
                      <>
                        <ToggleRight className="h-3.5 w-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-3.5 w-3.5" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>

                <h3 className="mt-2 text-base font-semibold text-white">{project.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-3">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-700/60 bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300"
                    >
                      <Tag className="h-2.5 w-2.5 text-indigo-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-4">
                <a
                  href={`/work/${project.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <span>View study</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(project)}
                    className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
                    title="Edit Project"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={deletingId === project.id}
                    onClick={() => handleDelete(project.id, project.title)}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    title="Delete Project"
                  >
                    {deletingId === project.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-white">
              {editingItem ? `Edit Project: ${editingItem.title}` : "Create New Project"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Configure case study metadata, tags, and visuals.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Apex FinTech Platform"
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
                    placeholder="apex-fintech"
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-indigo-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
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
                  placeholder="FinTech, Next.js, Cloud, React"
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description / Impact *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the problem solved, technology implemented, and metric achieved..."
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div>
                  <p className="text-xs font-semibold text-white">Active on Live Portfolio</p>
                  <p className="text-[11px] text-slate-400">Visible to prospective clients and visitors</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
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
                  {editingItem ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
