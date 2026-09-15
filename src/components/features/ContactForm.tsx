"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", company: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to submit message. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-200/50"
    >
      <div>
        <p className="text-xl font-bold text-slate-900">Send us a message</p>
        <p className="mt-1 text-sm text-slate-600">
          Share your goals with our engineering team. We usually reply within one business day.
        </p>
      </div>

      {status === "success" && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-semibold">Message delivered successfully!</p>
            <p className="mt-0.5 text-xs text-emerald-700">
              Thank you for reaching out. Our team will review your inquiry and follow up shortly.
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold">Submission failed</p>
            <p className="mt-0.5 text-xs text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Full Name *"
          name="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
        />
        <Input
          label="Email Address *"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@email.com"
        />
      </div>

      <Input
        label="Company (Optional)"
        name="company"
        value={formData.company}
        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        placeholder="Catalyst Enterprises"
      />

      <Textarea
        label="Project Scope / Message *"
        name="message"
        required
        rows={4}
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="Tell us about your system requirements, timeline, and goals..."
      />

      <Button size="md" type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Sending Message...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </>
        )}
      </Button>

      <p className="text-center text-xs text-slate-400">
        By submitting, you agree to our privacy policy and data protection terms.
      </p>
    </form>
  );
}
