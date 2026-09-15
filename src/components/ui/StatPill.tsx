import { cn } from "@/lib/utils";

interface StatPillProps {
  value: string;
  label: string;
  className?: string;
}

export function StatPill({ value, label, className }: StatPillProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200/80 bg-white p-4 sm:px-5 sm:py-4 shadow-sm", className)}>
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="mt-1 text-xs sm:text-sm text-slate-600">{label}</p>
    </div>
  );
}
