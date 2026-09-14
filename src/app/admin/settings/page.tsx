"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { SiteSettings } from "@/types/cms";

export default function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms?entity=settings");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
      showFeedback("error", "Failed to load site settings");
    } finally {
      setLoading(false);
    }
  }

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  }

  async function handleSave(updatedData?: Partial<SiteSettings>) {
    if (!settings) return;
    const toSave = { ...settings, ...updatedData };
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "settings",
          action: "update",
          data: toSave,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSettings(json.data);
        showFeedback("success", "System settings successfully updated and published");
      } else {
        showFeedback("error", json.error || "Failed to update settings");
      }
    } catch {
      showFeedback("error", "Network error while saving settings");
    } finally {
      setSaving(false);
      setShowMaintenanceConfirm(false);
    }
  }

  function toggleMaintenanceMode() {
    if (!settings) return;
    if (!settings.maintenanceMode) {
      // Activating requires confirmation
      setShowMaintenanceConfirm(true);
    } else {
      // Deactivating can be instant
      handleSave({ maintenanceMode: false });
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-16">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <Settings className="h-6 w-6 text-indigo-400" />
            Global Site Settings & Maintenance
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Configure core corporate identity, contact coordinates, and platform maintenance mode.
          </p>
        </div>
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
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

      {/* Master Maintenance Mode Card */}
      <div
        className={`rounded-2xl border p-6 transition-all ${
          settings.maintenanceMode
            ? "border-red-500/40 bg-red-950/15 shadow-2xl shadow-red-950/30"
            : "border-slate-800 bg-slate-900/60"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                settings.maintenanceMode
                  ? "border-red-500/40 bg-red-500/20 text-red-400"
                  : "border-slate-700 bg-slate-800 text-slate-400"
              }`}
            >
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white">Platform Maintenance Mode</h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    settings.maintenanceMode
                      ? "bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {settings.maintenanceMode ? "ACTIVE (Public Offline)" : "Operational"}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                When enabled, all unauthenticated public visitors are immediately redirected to the{" "}
                <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-300">/maintenance</code> page.
                Authenticated CMS administrators bypass this downtime and can continue testing.
              </p>
            </div>
          </div>

          <button
            onClick={toggleMaintenanceMode}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              settings.maintenanceMode
                ? "border border-red-500/40 bg-red-600 text-white hover:bg-red-500"
                : "border border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
            }`}
          >
            {settings.maintenanceMode ? (
              <>
                <ToggleRight className="h-5 w-5" />
                <span>Disable Maintenance</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-5 w-5" />
                <span>Enable Maintenance</span>
              </>
            )}
          </button>
        </div>

        {/* Maintenance Message Fields */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 border-t border-slate-800/80 pt-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Downtime Title Banner
            </label>
            <input
              type="text"
              value={settings.maintenanceTitle || ""}
              onChange={(e) => setSettings({ ...settings, maintenanceTitle: e.target.value })}
              placeholder="Under Scheduled Maintenance"
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Downtime Message to Visitors
            </label>
            <input
              type="text"
              value={settings.maintenanceMessage || ""}
              onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
              placeholder="We are upgrading our enterprise infrastructure. We'll be back online shortly."
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Brand Identity */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h2 className="flex items-center gap-2 text-base font-bold text-white">
          <Globe className="h-5 w-5 text-indigo-400" />
          Brand & Organization Identity
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Core corporate names, taglines, and metadata used in headers, footers, and SEO tags.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Site / Brand Name *
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Primary Tagline *
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Contact Coordinates */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h2 className="flex items-center gap-2 text-base font-bold text-white">
          <Mail className="h-5 w-5 text-indigo-400" />
          Official Contact Coordinates & Socials
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Inbound email destinations and verified company touchpoints.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Primary Contact Email
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={settings.primaryEmail}
                onChange={(e) => setSettings({ ...settings, primaryEmail: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Technical Support Email
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Direct Phone Line
            </label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              LinkedIn Company Page
            </label>
            <div className="relative mt-1.5">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="url"
                value={settings.linkedinUrl}
                onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Physical Office Address */}
        <div className="mt-6 border-t border-slate-800/80 pt-5">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <MapPin className="h-4 w-4 text-indigo-400" />
            Corporate Headquarters & Addresses
          </h3>

          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400">City / Region</label>
              <input
                type="text"
                value={settings.headquarters}
                onChange={(e) => setSettings({ ...settings, headquarters: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400">Office Address 1</label>
              <input
                type="text"
                value={settings.officeAddress1}
                onChange={(e) => setSettings({ ...settings, officeAddress1: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400">Office Address 2</label>
              <input
                type="text"
                value={settings.officeAddress2}
                onChange={(e) => setSettings({ ...settings, officeAddress2: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Enabling Maintenance Mode */}
      {showMaintenanceConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">Enable Maintenance Mode?</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Activating maintenance mode will immediately lock public visitors out of the live website
              and present the downtime notice. You will still retain full access to the CMS admin panel.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowMaintenanceConfirm(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave({ maintenanceMode: true })}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-500"
              >
                Yes, Enable Downtime
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
