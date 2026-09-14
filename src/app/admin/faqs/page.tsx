"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle,
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
} from "lucide-react";
import type { FaqItemCMS } from "@/types/cms";

export default function FaqsManager() {
  const [faqs, setFaqs] = useState<FaqItemCMS[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqItemCMS | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    displayOrder: 1,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function fetchFaqs() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms?entity=faqs");
      const data = await res.json();
      if (Array.isArray(data)) {
        setFaqs(data.sort((a, b) => a.displayOrder - b.displayOrder));
      }
    } catch (err) {
      console.error(err);
      showFeedback("error", "Failed to load FAQs");
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
      question: "",
      answer: "",
      displayOrder: faqs.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  }

  function openEditModal(item: FaqItemCMS) {
    setEditingItem(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  }

  async function handleToggleActive(item: FaqItemCMS) {
    const newStatus = !item.isActive;
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "faqs",
          action: "update",
          data: { id: item.id, isActive: newStatus },
        }),
      });
      if (res.ok) {
        setFaqs((prev) => prev.map((f) => (f.id === item.id ? { ...f, isActive: newStatus } : f)));
        showFeedback("success", `FAQ is now ${newStatus ? "Active" : "Inactive"}`);
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
          entity: "faqs",
          action: isEdit ? "update" : "create",
          data: isEdit ? { id: editingItem.id, ...formData } : formData,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (isEdit) {
          setFaqs((prev) => prev.map((f) => (f.id === editingItem.id ? json.data : f)));
          showFeedback("success", "Updated FAQ successfully");
        } else {
          setFaqs((prev) => [...prev, json.data].sort((a, b) => a.displayOrder - b.displayOrder));
          showFeedback("success", "Added FAQ successfully");
        }
        setIsModalOpen(false);
      } else {
        showFeedback("error", json.error || "Failed to save FAQ");
      }
    } catch {
      showFeedback("error", "Network error while saving FAQ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, question: string) {
    if (!confirm(`Are you sure you want to delete FAQ "${question.slice(0, 40)}..."?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "faqs",
          action: "delete",
          data: { id },
        }),
      });

      if (res.ok) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
        showFeedback("success", "Deleted FAQ successfully");
      } else {
        const err = await res.json();
        showFeedback("error", err.error || "Failed to delete FAQ");
      }
    } catch {
      showFeedback("error", "Network error while deleting");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredFaqs = faqs.filter((f) => {
    const matchesSearch =
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterActive === "active") return matchesSearch && f.isActive;
    if (filterActive === "inactive") return matchesSearch && !f.isActive;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <HelpCircle className="h-6 w-6 text-indigo-400" />
            Frequently Asked Questions
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage interactive accordions, common client inquiries, and pricing clarifications.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Question
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
            placeholder="Search FAQs by question or answer keywords..."
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
              {mode} ({mode === "all" ? faqs.length : faqs.filter((f) => (mode === "active" ? f.isActive : !f.isActive)).length})
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <HelpCircle className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-base font-medium text-slate-300">No FAQ entries found</p>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm ? "Try adjusting your search criteria" : "Click 'Add Question' above to create one"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className={`rounded-2xl border bg-slate-900/60 p-5 transition-all ${
                faq.isActive
                  ? "border-slate-800 hover:border-slate-700"
                  : "border-dashed border-red-500/20 bg-red-950/5 opacity-70"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                      Order #{faq.displayOrder}
                    </span>
                    <button
                      onClick={() => handleToggleActive(faq)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                        faq.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {faq.isActive ? (
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
                  <h3 className="mt-2 text-base font-semibold text-white">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{faq.answer}</p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-start">
                  <button
                    onClick={() => openEditModal(faq)}
                    className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
                    title="Edit FAQ"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    disabled={deletingId === faq.id}
                    onClick={() => handleDelete(faq.id, faq.question)}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    title="Delete FAQ"
                  >
                    {deletingId === faq.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
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
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-white">
              {editingItem ? "Edit FAQ" : "Add FAQ Question"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Configure question phrasing, response text, and sequencing.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. What is your typical onboarding timeline?"
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Comprehensive Answer *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Provide a clear, detailed answer..."
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div>
                  <p className="text-xs font-semibold text-white">Active in Accordion</p>
                  <p className="text-[11px] text-slate-400">Display this FAQ on public pages</p>
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
                  {editingItem ? "Update FAQ" : "Add FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
