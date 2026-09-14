import { StatsCounter } from "@/components/features/StatsCounter";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { homeStats } from "@/data/stats";
import { getSectionConfigs } from "@/lib/cms/service";

export async function StatsSection() {
  const sections = await getSectionConfigs("home");
  const config = sections.find((s) => s.id === "home-stats");

  if (config && !config.isActive) return null;

  return (
    <SectionWrapper id="stats" className="bg-slate-50">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {homeStats.map((stat) => (
          <StatsCounter key={stat.id} stat={stat} />
        ))}
      </div>
    </SectionWrapper>
  );
}
