import {
  Code2,
  Palette,
  Bot,
  Smartphone,
  Globe,
  Shield,
  Layers,
  Sparkles,
  Cpu,
  BarChart,
  Zap,
  Boxes,
  Database,
  Terminal,
  type LucideProps,
} from "lucide-react";

const ICON_REGISTRY: Record<string, React.ComponentType<LucideProps>> = {
  Code2,
  Palette,
  Bot,
  Smartphone,
  Globe,
  Shield,
  Layers,
  Cpu,
  BarChart,
  Zap,
  Boxes,
  Database,
  Terminal,
};

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, className = "h-6 w-6", ...props }: DynamicIconProps) {
  const IconComponent = ICON_REGISTRY[name] || Sparkles;
  return <IconComponent className={className} {...props} />;
}
