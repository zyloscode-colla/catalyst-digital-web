"use client";

import { useState, useEffect } from "react";
import {
  Inbox,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Mail,
  Building,
  Calendar,
  Clock,
} from "lucide-react";
import type { ContactInquiry } from "@/types/cms";

export default function InquiriesManager() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ContactInquiry["status"] | "all">("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Selected Inquiry for Modal view
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms?entity=inquiries");
      const data = await res.json();
      if (Array.isArray(data)) {
        setInquiries(
          data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      }
    } catch (err) {
      console.error(err);
      showFeedback("error", "Failed to load client inquiries");
    } finally {
      setLoading(false);
    }
  }

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleStatusChange(id: string, newStatus: ContactInquiry["status"]) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "inquiries",
          action: "updateStatus",
          data: { id, status: newStatus },
        }),
      });

      if (res.ok) {
        setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq)));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        showFeedback("success", `Inquiry status updated to ${newStatus}`);
      } else {
        const err = await res.json();
        showFeedback("error", err.error || "Failed to update inquiry status");
      }
    } catch {
      showFeedback("error", "Network error updating inquiry status");
    } finally {
      setUpdatingId(null);
    }
  }

  const statusStyles: Record<ContactInquiry["status"], { bg: string; text: string; label: string }> = {
    new: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", label: "New Lead" },
    in_review: { bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400", label: "In Review" },
    contacted: { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", label: "Contacted" },
    archived: { bg: "bg-slate-500/10 border-slate-500/30", text: "text-slate-400", label: "Archived" },
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.company && inq.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      inq.message.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && inq.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <Inbox className="h-6 w-6 text-indigo-400" />
            Client Inquiries & Leads Inbox
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Review incoming project briefs, contact form submissions, and sales inquiries.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
        >
          <Clock className="h-4 w-4" />
          Refresh Inbox
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
            placeholder="Search inquiries by client name, email, company, or message keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(["all", "new", "in_review", "contacted", "archived"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filterStatus === status
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {status === "all" ? `All (${inquiries.length})` : `${status.replace("_", " ")} (${inquiries.filter((i) => i.status === status).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table / Feed */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-base font-medium text-slate-300">No inquiries match your criteria</p>
          <p className="mt-1 text-xs text-slate-500">
            Form submissions through the public Contact page will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="divide-y divide-slate-800/80">
            {filteredInquiries.map((inq) => {
              const currentStatus = statusStyles[inq.status];

              return (
                <div
                  key={inq.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 hover:bg-slate-800/30 transition-colors"
                >
                  <div
                    onClick={() => setSelectedInquiry(inq)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${currentStatus.bg} ${currentStatus.text}`}
                      >
                        {currentStatus.label}
                      </span>
                      <span className="font-semibold text-white">{inq.name}</span>
                      {inq.company && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Building className="h-3 w-3" />
                          {inq.company}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">•</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(inq.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-indigo-400">
                      <Mail className="h-3 w-3" />
                      <span>{inq.email}</span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-2">
                      {inq.message}
                    </p>
                  </div>

                  {/* Status Dropdown & Action */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <select
                      disabled={updatingId === inq.id}
                      value={inq.status}
                      onChange={(e) =>
                        handleStatusChange(inq.id, e.target.value as ContactInquiry["status"])
                      }
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="new">New Lead</option>
                      <option value="in_review">In Review</option>
                      <option value="contacted">Contacted</option>
                      <option value="archived">Archived</option>
                    </select>

                    <button
                      onClick={() => setSelectedInquiry(inq)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inquiry Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  statusStyles[selectedInquiry.status].bg
                } ${statusStyles[selectedInquiry.status].text}`}
              >
                {statusStyles[selectedInquiry.status].label}
              </span>
              <span className="text-xs text-slate-400">
                Submitted {new Date(selectedInquiry.createdAt).toLocaleString()}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-bold text-white">{selectedInquiry.name}</h2>

            <div className="mt-4 space-y-2.5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email Address:</span>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="font-medium text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Mail className="h-3 w-3" />
                  {selectedInquiry.email}
                </a>
              </div>
              {selectedInquiry.company && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Company:</span>
                  <span className="font-medium text-slate-200">{selectedInquiry.company}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Submission ID:</span>
                <span className="font-mono text-slate-500">{selectedInquiry.id}</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Project Scope / Message
              </label>
              <div className="mt-1.5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Quick Status Bar inside Modal */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Update Status:</span>
                {(["new", "in_review", "contacted", "archived"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedInquiry.id, st)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors ${
                      selectedInquiry.status === st
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>

              <a
                href={`mailto:${selectedInquiry.email}?subject=Regarding your inquiry at Catalyst Digital`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
