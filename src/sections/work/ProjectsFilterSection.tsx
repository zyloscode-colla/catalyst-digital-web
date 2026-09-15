import { SectionWrapper } from "@/components/ui/SectionWrapper";

const filters = ["All", "Web", "Mobile", "Cloud", "AI", "Security"] as const;

export function ProjectsFilterSection() {
  return (
    <SectionWrapper id="projects-filters" className="py-0">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-3 sm:py-4 px-2 sm:px-0 sm:flex-wrap sm:justify-center border-y border-slate-200">
        {filters.map((filter, index) => (
          <button
            key={filter}
            type="button"
            className={
              index === 0
                ? "whitespace-nowrap rounded-full bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm shrink-0 active:scale-95 transition-transform"
                : "whitespace-nowrap rounded-full border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-950 shrink-0 active:scale-95 transition-all"
            }
          >
            {filter}
          </button>
        ))}
      </div>
    </SectionWrapper>
  );
}
