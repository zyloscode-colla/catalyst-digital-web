import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { Service } from "@/types";
import type { ServiceItem } from "@/types/cms";

interface ServiceCardProps {
  service: Service | ServiceItem;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card hover className="flex h-full flex-col justify-between">
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
          <DynamicIcon name={service.icon} className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-slate-900">{service.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{service.description}</p>
        {"shortDescription" in service && service.shortDescription && (
          <p className="mt-3 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {service.shortDescription}
          </p>
        )}
      </div>

      <div className="pt-6">
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <span>Explore service</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
