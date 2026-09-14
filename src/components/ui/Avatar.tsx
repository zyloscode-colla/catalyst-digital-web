import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  image?: string;
  className?: string;
}

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, image, className }: AvatarProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        loading="lazy"
        width={56}
        height={56}
        className={cn("h-14 w-14 rounded-full object-cover border border-slate-200", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700",
        className
      )}
      aria-label={name}
    >
      {initialsFromName(name)}
    </div>
  );
}
