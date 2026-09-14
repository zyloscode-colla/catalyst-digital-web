"use client";

import { useState, useEffect } from "react";
import {
  Layers,
  ToggleLeft,
  ToggleRight,
  Save,
  Loader2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Edit3,
} from "lucide-react";
import type { PageConfig, SectionConfig } from "@/types/cms";

export default function PagesSectionsManager() {
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("home");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [pagesRes, sectionsRes] = await Promise.all([
        fetch("/api/admin/cms?entity=pages"),
        fetch("/api/admin/cms?entity=sections"),
      ]);
      const [pagesData, sectionsData] = await Promise.all([pagesRes.json(), sectionsRes.json()]);
      setPages(pagesData);
      setSections(sectionsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePage(slug: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    setSavingId(`page-${slug}`);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "pages",
          action: "toggle",
          data: { slug, isActive: newStatus },
        }),
      });
      if (res.ok) {
        setPages((prev) => prev.map((p) => (p.slug === slug ? { ...p, isActive: newStatus } : p)));
        showFeedback(`Page /${slug} is now ${newStatus ? "ACTIVE" : "INACTIVE"}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggleSection(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    setSavingId(`section-toggle-${id}`);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "sections",
          action: "toggle",
          data: { id, isActive: newStatus },
        }),
      });
      if (res.ok) {
        setSections((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: newStatus } : s)));
        showFeedback(`Section "${id}" is now ${newStatus ? "VISIBLE" : "HIDDEN"}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  }

  async function handleSaveSectionText(id: string, updates: Partial<SectionConfig>) {
    setSavingId(`section-save-${id}`);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "sections",
          action: "update",
          data: { id, ...updates },
        }),
      });
      if (res.ok) {
        setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
        showFeedback(`Section copy updated successfully.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  }

  function showFeedback(msg: string) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  const currentSections = sections.filter((s) => s.pageSlug === selectedPage);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Pages & Sections Manager</h1>
          <p className="mt-1 text-sm text-slate-400">
            Activate or deactivate public web pages and control individual section visibility and headlines.
          </p>
        </div>

        {statusMessage && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 animate-fade-in">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Part 1: Master Page-Level Activation Switches */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-400" />
          Master Page Activation Switches
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Turn an entire route (e.g. Services, Work, Blog) on or off. When inactive, public visitors receive a branded offline notice.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => {
            const isToggling = savingId === `page-${p.slug}`;
            return (
              <div
                key={p.slug}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                  p.isActive
                    ? "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                    : "border-rose-900/30 bg-rose-950/10"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-white">{p.title} Page</span>
                    <button
                      onClick={() => handleTogglePage(p.slug, p.isActive)}
                      disabled={isToggling}
                      title={p.isActive ? "Deactivate Page" : "Activate Page"}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      {isToggling ? (
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                      ) : p.isActive ? (
                        <ToggleRight className="h-7 w-7 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="h-7 w-7 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs font-mono text-indigo-400">
                    /{p.slug === "home" ? "" : p.slug}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`font-semibold ${
                      p.isActive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {p.isActive ? "Active (Online)" : "Turned Off (Offline)"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: Section-Level Visibility & Content Editor */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-indigo-400" />
              Section-Level Controls & Content Editor
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Select a page tab to toggle individual sections on/off and edit titles.
            </p>
          </div>

          {/* Page Tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1.5">
            {pages.map((p) => (
              <button
                key={p.slug}
                onClick={() => setSelectedPage(p.slug)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  selectedPage === p.slug
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Section List for Selected Page */}
        <div className="mt-6 space-y-4">
          {currentSections.map((sec) => (
            <SectionEditorCard
              key={sec.id}
              section={sec}
              onToggle={handleToggleSection}
              onSave={handleSaveSectionText}
              savingId={savingId}
            />
          ))}

          {currentSections.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-500">No sections found for this page.</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface SectionEditorCardProps {
  section: SectionConfig;
  onToggle: (id: string, currentStatus: boolean) => void;
  onSave: (id: string, updates: Partial<SectionConfig>) => void;
  savingId: string | null;
}

function SectionEditorCard({ section, onToggle, onSave, savingId }: SectionEditorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [eyebrow, setEyebrow] = useState(section.eyebrow || "");
  const [heading, setHeading] = useState(section.heading || "");
  const [subheading, setSubheading] = useState(section.subheading || "");

  const isSaving = savingId === `section-save-${section.id}`;
  const isToggling = savingId === `section-toggle-${section.id}`;

  return (
    <div
      className={`rounded-xl border transition-all ${
        section.isActive
          ? "border-slate-800 bg-slate-950/80"
          : "border-slate-800/40 bg-slate-950/30 opacity-70"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(section.id, section.isActive)}
            disabled={isToggling}
            title={section.isActive ? "Hide Section" : "Show Section"}
            className="cursor-pointer"
          >
            {isToggling ? (
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
            ) : section.isActive ? (
              <Eye className="h-5 w-5 text-emerald-400" />
            ) : (
              <EyeOff className="h-5 w-5 text-slate-600" />
            )}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{section.sectionName}</span>
              <span className="text-[10px] font-mono text-slate-500">#{section.sectionKey}</span>
            </div>
            {section.heading && (
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">&quot;{section.heading}&quot;</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              section.isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-slate-800 text-slate-500 border border-slate-700"
            }`}
          >
            {section.isActive ? "Visible" : "Hidden"}
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            {isExpanded ? (
              <>
                Close <ChevronDown className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Edit Copy <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Inline Editor */}
      {isExpanded && (
        <div className="border-t border-slate-800/80 bg-slate-900/40 p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400">Eyebrow Badge Text</label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder="e.g. Services, Who We Are"
                className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400">Section Main Heading</label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. Cross-functional teams to ship faster"
                className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400">Subheading / Description</label>
            <textarea
              rows={2}
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="Section narrative or descriptive paragraph..."
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => onSave(section.id, { eyebrow, heading, subheading })}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
