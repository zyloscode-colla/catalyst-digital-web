import { TeamCard } from "@/components/features/TeamCard";
import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getSectionConfigs, getTeamMembers } from "@/lib/cms/service";

export async function TeamSection() {
  const sections = await getSectionConfigs("about");
  const config = sections.find((s) => s.id === "about-team");

  if (config && !config.isActive) return null;

  const team = await getTeamMembers(true);

  return (
    <SectionWrapper id="team">
      <div className="text-center">
        <Badge>{config?.badge || "Team"}</Badge>
        <Heading as="h2" className="mt-3">
          {config?.heading || "The minds behind the mission"}
        </Heading>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          {config?.subheading ||
            "Cross-functional experts in strategy, design, and engineering, aligned around meaningful outcomes."}
        </p>
      </div>
      <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>
    </SectionWrapper>
  );
}
