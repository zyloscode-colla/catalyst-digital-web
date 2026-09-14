import { TeamCard } from "@/components/features/TeamCard";
import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getSectionConfigs, getTeamMembers } from "@/lib/cms/service";

export async function TeamPreviewSection() {
  const [sections, team] = await Promise.all([
    getSectionConfigs("home"),
    getTeamMembers(true),
  ]);

  const config = sections.find((s) => s.id === "home-team");
  if (config && !config.isActive) return null;

  return (
    <SectionWrapper id="team" className="bg-slate-50">
      <Badge variant="default">{config?.badge || "Our Team"}</Badge>
      <Heading as="h2" className="mt-3">
        {config?.heading || "Senior specialists focused on outcomes"}
      </Heading>
      <p className="mt-3 max-w-2xl text-slate-600">
        {config?.subheading ||
          "Work directly with strategists, designers, and engineers who stay close to your product goals."}
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {team.slice(0, 4).map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>
    </SectionWrapper>
  );
}
