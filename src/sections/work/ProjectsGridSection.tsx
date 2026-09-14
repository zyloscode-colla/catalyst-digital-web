import { ProjectCard } from "@/components/features/ProjectCard";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getProjects, getSectionConfigs } from "@/lib/cms/service";
import type { ProjectItem } from "@/types/cms";

interface ProjectsGridSectionProps {
  projects?: ProjectItem[];
}

export async function ProjectsGridSection({ projects: propProjects }: ProjectsGridSectionProps) {
  const sections = await getSectionConfigs("work");
  const config = sections.find((s) => s.id === "work-projects-grid");

  if (config && !config.isActive) return null;

  const projects = propProjects || (await getProjects(true));

  return (
    <SectionWrapper id="projects-grid" className="pt-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </SectionWrapper>
  );
}
