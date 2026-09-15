import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getSectionConfigs } from "@/lib/cms/service";

const techStack = ["React", "Java", "Go", "AWS"];

export async function ClientsSection() {
  const sections = await getSectionConfigs("home");
  const config = sections.find((s) => s.id === "home-clients");

  if (config && !config.isActive) return null;

  return (
    <SectionWrapper id="clients">
      <p className="text-center text-sm font-semibold uppercase tracking-wide text-slate-500">
        {config?.heading || "Tech stack we work with"}
      </p>
      <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {techStack.map((tech) => (
          <div
            key={tech}
            className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 sm:py-5 text-center text-xs sm:text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors"
          >
            {tech}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
