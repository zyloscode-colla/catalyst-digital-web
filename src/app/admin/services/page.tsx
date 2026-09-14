"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
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
  Code2,
  Palette,
  Bot,
  Smartphone,
  Globe,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import type { ServiceItem } from "@/types/cms";

const ICON_OPTIONS = [
  { label: "Code / Engineering", value: "Code2", icon: Code2 },
  { label: "Design / Creative", value: "Palette", icon: Palette },
  { label: "AI & Automation", value: "Bot", icon: Bot },
  { label: "Mobile Apps", value: "Smartphone", icon: Smartphone },
  { label: "Web / Cloud", value: "Globe", icon: Globe },
  { label: "Security / Compliance", value: "Shield", icon: Shield },
  { label: "Architecture / Stack", value: "Layers", icon: Layers },
];

export default function ServicesManager() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    shortDescription: "",
    icon: "Code2",
    displayOrder: 1,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms?entity=services");
      const data = await res.json();
      if (Array.isArray(data)) {
        setServices(data.sort((a, b) => a.displayOrder - b.displayOrder));
      }
    } catch (err) {
      console.error(err);
      showFeedback("error", "Failed to load services");
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
      shortDescription: "",
      icon: "Code2",
      displayOrder: services.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  }

  function openEditModal(item: ServiceItem) {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      description: item.description,
      shortDescription: item.shortDescription || "",
      icon: item.icon,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  }

  function handleTitleChange(val: string) {
    setFormData((prev) => ({
      ...prev,
      title: val,
      // Auto-generate slug only if creating new
      slug: !editingItem ? val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : prev.slug,
    }));
  }

  async function handleToggleActive(item: ServiceItem) {
    const newStatus = !item.isActive;
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "services",
          action: "update",
          data: { id: item.id, isActive: newStatus },
        }),
      });
      if (res.ok) {
        setServices((prev) => prev.map((s) => (s.id === item.id ? { ...s, isActive: newStatus } : s)));
        showFeedback("success", `Service "${item.title}" is now ${newStatus ? "Active" : "Inactive"}`);
      } else {
        const err = await res.json();
        showFeedback("error", err.error || "Failed to toggle service status");
      }
    } catch {
      showFeedback("error", "Network error toggling status");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEdit = !!editingItem;
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "services",
          action: isEdit ? "update" : "create",
          data: isEdit ? { id: editingItem.id, ...formData } : formData,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (isEdit) {
          setServices((prev) => prev.map((s) => (s.id === editingItem.id ? json.data : s)));
          showFeedback("success", `Updated service "${formData.title}"`);
        } else {
          setServices((prev) => [...prev, json.data].sort((a, b) => a.displayOrder - b.displayOrder));
          showFeedback("success", `Created service "${formData.title}"`);
        }
        setIsModalOpen(false);
      } else {
        showFeedback("error", json.error || "Failed to save service");
      }
    } catch {
      showFeedback("error", "Network error while saving service");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "services",
          action: "delete",
          data: { id },
        }),
      });

      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        showFeedback("success", `Deleted service "${title}"`);
      } else {
        const err = await res.json();
        showFeedback("error", err.error || "Failed to delete service");
      }
    } catch {
      showFeedback("error", "Network error while deleting");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterActive === "active") return matchesSearch && s.isActive;
    if (filterActive === "inactive") return matchesSearch && !s.isActive;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <Briefcase className="h-6 w-6 text-indigo-400" />
            Services Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create, update, toggle visibility, and configure offerings displayed on the frontend.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Service
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
            placeholder="Search services by title, slug, or description..."
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
              {mode} ({mode === "all" ? services.length : services.filter((s) => (mode === "active" ? s.isActive : !s.isActive)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid / Table */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Briefcase className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-base font-medium text-slate-300">No services found</p>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm ? "Try adjusting your search criteria" : "Click 'Add Service' above to create one"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            const matchedIcon = ICON_OPTIONS.find((i) => i.value === service.icon);
            const IconComponent = matchedIcon ? matchedIcon.icon : Sparkles;

            return (
              <div
                key={service.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-slate-900/60 p-5 transition-all ${
                  service.isActive
                    ? "border-slate-800 hover:border-slate-700"
                    : "border-dashed border-red-500/20 bg-red-950/5 opacity-70"
                }`}
              >
                <div>
                  {/* Top bar with icon, order & status badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Order #{service.displayOrder}
                        </span>
                        <p className="text-xs font-mono text-slate-400">{service.icon}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleActive(service)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                        service.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                      title="Click to toggle status"
                    >
                      {service.isActive ? (
                        <>
                          <ToggleRight className="h-4 w-4 text-emerald-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4 text-red-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Slug */}
                  <div className="mt-4">
                    <h3 className="text-base font-semibold text-white">{service.title}</h3>
                    <p className="mt-0.5 text-xs font-mono text-indigo-400">/services/{service.slug}</p>
                  </div>

                  {/* Descriptions */}
                  <p className="mt-3 text-xs leading-relaxed text-slate-400 line-clamp-3">
                    {service.description}
                  </p>
                  {service.shortDescription && (
                    <p className="mt-2 text-[11px] text-slate-500 italic">
                      Badge: &ldquo;{service.shortDescription}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <a
                    href={`/services/${service.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    <span>View page</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(service)}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
                      title="Edit Service"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={deletingId === service.id}
                      onClick={() => handleDelete(service.id, service.title)}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      title="Delete Service"
                    >
                      {deletingId === service.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-white">
              {editingItem ? `Edit Service: ${editingItem.title}` : "Create New Service"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Configure content, route slug, and Lucide vector icon.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. AI Workflow Automation"
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
                    placeholder="ai-automation"
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
                  Icon Representation
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Short Highlight / Tag
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="e.g. Next.js, React, Node.js"
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the capabilities, deliverables, and business value..."
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div>
                  <p className="text-xs font-semibold text-white">Active on Live Website</p>
                  <p className="text-[11px] text-slate-400">Enable to display this service across pages</p>
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
                  {editingItem ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
