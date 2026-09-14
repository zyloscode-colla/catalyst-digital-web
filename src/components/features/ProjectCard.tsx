import Link from "next/link";
import { ArrowRight, FolderGit2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Project } from "@/types";
import type { ProjectItem } from "@/types/cms";

interface ProjectCardProps {
  project: Project | ProjectItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const imageUrl = "image" in project ? project.image : undefined;

  return (
    <Card hover className="flex h-full flex-col justify-between">
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={project.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50/50 text-slate-400">
              <FolderGit2 className="h-10 w-10 text-indigo-300" />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900">{project.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{project.description}</p>
      </div>

      <div className="pt-6">
        <Link
          href={`/work/${project.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <span>View case study</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
