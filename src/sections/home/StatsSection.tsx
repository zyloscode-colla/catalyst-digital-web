import { StatsCounter } from "@/components/features/StatsCounter";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { homeStats } from "@/data/stats";
import { getSectionConfigs } from "@/lib/cms/service";

export async function StatsSection() {
  const sections = await getSectionConfigs("home");
  const config = sections.find((s) => s.id === "home-stats");

  if (config && !config.isActive) return null;

  return (
    <SectionWrapper id="stats" className="bg-slate-50 py-10 sm:py-14">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {homeStats.map((stat) => (
          <StatsCounter key={stat.id} stat={stat} />
        ))}
      </div>
    </SectionWrapper>
  );
}
