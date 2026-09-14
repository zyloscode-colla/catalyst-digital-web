import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { BlogPost } from "@/types";
import type { BlogPostItem } from "@/types/cms";

interface BlogCardProps {
  post: BlogPost | BlogPostItem;
}

export function BlogCard({ post }: BlogCardProps) {
  const coverImage = "coverImage" in post ? post.coverImage : undefined;

  return (
    <Card hover className="flex h-full flex-col justify-between">
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
          {coverImage ? (
            <img
              src={coverImage}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 text-slate-400">
              <BookOpen className="h-8 w-8 text-indigo-300" />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">{post.date}</p>
        <h3 className="mt-2 text-lg font-bold text-slate-900">{post.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-3">{post.excerpt}</p>
        <p className="mt-4 text-xs font-medium text-slate-500">By {post.author}</p>
      </div>

      <div className="pt-6">
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <span>Read article</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
