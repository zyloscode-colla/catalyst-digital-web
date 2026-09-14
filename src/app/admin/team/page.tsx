"use client";

import { useState, useEffect } from "react";
import {
  Users,
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
} from "lucide-react";
import type { TeamMemberItem } from "@/types/cms";

export default function TeamManager() {
  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMemberItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    image: "",
    linkedin: "",
    displayOrder: 1,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms?entity=team");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTeam(data.sort((a, b) => a.displayOrder - b.displayOrder));
      }
    } catch (err) {
      console.error(err);
      showFeedback("error", "Failed to load team members");
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
      name: "",
      role: "",
      image: "",
      linkedin: "https://linkedin.com/company/catalystdigital",
      displayOrder: team.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  }

  function openEditModal(item: TeamMemberItem) {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      image: item.image || "",
      linkedin: item.linkedin,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  }

  async function handleToggleActive(item: TeamMemberItem) {
    const newStatus = !item.isActive;
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "team",
          action: "update",
          data: { id: item.id, isActive: newStatus },
        }),
      });
      if (res.ok) {
        setTeam((prev) => prev.map((t) => (t.id === item.id ? { ...t, isActive: newStatus } : t)));
        showFeedback("success", `Team member "${item.name}" is now ${newStatus ? "Active" : "Inactive"}`);
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
      const isEdit = !!editingItem;
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "team",
          action: isEdit ? "update" : "create",
          data: isEdit ? { id: editingItem.id, ...formData } : formData,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (isEdit) {
          setTeam((prev) => prev.map((t) => (t.id === editingItem.id ? json.data : t)));
          showFeedback("success", `Updated team member "${formData.name}"`);
        } else {
          setTeam((prev) => [...prev, json.data].sort((a, b) => a.displayOrder - b.displayOrder));
          showFeedback("success", `Added team member "${formData.name}"`);
        }
        setIsModalOpen(false);
      } else {
        showFeedback("error", json.error || "Failed to save team member");
      }
    } catch {
      showFeedback("error", "Network error while saving team member");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to permanently delete team member "${name}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "team",
          action: "delete",
          data: { id },
        }),
      });

      if (res.ok) {
        setTeam((prev) => prev.filter((t) => t.id !== id));
        showFeedback("success", `Deleted team member "${name}"`);
      } else {
        const err = await res.json();
        showFeedback("error", err.error || "Failed to delete member");
      }
    } catch {
      showFeedback("error", "Network error while deleting");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredTeam = team.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.role.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterActive === "active") return matchesSearch && t.isActive;
    if (filterActive === "inactive") return matchesSearch && !t.isActive;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <Users className="h-6 w-6 text-indigo-400" />
            Leadership & Team Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage partners, leads, roles, avatars, and social profiles displayed on the About page.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Member
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
            placeholder="Search team members by name or role title..."
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
              {mode} ({mode === "all" ? team.length : team.filter((t) => (mode === "active" ? t.isActive : !t.isActive)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : filteredTeam.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-base font-medium text-slate-300">No team members found</p>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm ? "Try adjusting your search criteria" : "Click 'Add Member' above to create one"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className={`relative flex flex-col justify-between rounded-2xl border bg-slate-900/60 p-5 transition-all ${
                member.isActive
                  ? "border-slate-800 hover:border-slate-700"
                  : "border-dashed border-red-500/20 bg-red-950/5 opacity-70"
              }`}
            >
              <div>
                {/* Header: Avatar, Info, Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        loading="lazy"
                        className="h-12 w-12 rounded-full border border-slate-700 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10 font-bold text-indigo-300">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-white">{member.name}</h3>
                      <p className="text-xs font-medium text-indigo-400">{member.role}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleActive(member)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                      member.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {member.isActive ? (
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

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <span className="font-mono text-[11px]">Display Order #{member.displayOrder}</span>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-slate-800/80 pt-3">
                <button
                  onClick={() => openEditModal(member)}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
                  title="Edit Member"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  disabled={deletingId === member.id}
                  onClick={() => handleDelete(member.id, member.name)}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  title="Delete Member"
                >
                  {deletingId === member.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
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
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-white">
              {editingItem ? `Edit Member: ${editingItem.name}` : "Add Team Member"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Configure profile information, role title, and LinkedIn URL.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Eleanor Vance"
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Role / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Managing Director & Partner"
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Avatar Image URL (Optional)
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
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
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

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div>
                  <p className="text-xs font-semibold text-white">Active on About Page</p>
                  <p className="text-[11px] text-slate-400">Enable to display member in public leadership grid</p>
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
                  {editingItem ? "Update Member" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
