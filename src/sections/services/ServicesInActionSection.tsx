import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getSectionConfigs, getServiceCases } from "@/lib/cms/service";

export async function ServicesInActionSection() {
  const sections = await getSectionConfigs("services");
  const config = sections.find((s) => s.id === "services-in-action");

  if (config && !config.isActive) return null;

  const cases = await getServiceCases(true);

  return (
    <SectionWrapper id="services-in-action" className="bg-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge>{config?.badge || "Case Snapshots"}</Badge>
          <Heading as="h2" className="mt-3">
            {config?.heading || "Services in action"}
          </Heading>
          <p className="mt-3 max-w-2xl text-slate-600">
            {config?.subheading ||
              "See how we apply these capabilities to solve real-world challenges for growth-stage teams."}
          </p>
        </div>
        <Link href="/work" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          View all case studies
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cases.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.category}</p>
            <h3 className="mt-2 text-base font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-indigo-600">{item.resultTag}</p>
          </article>
        ))}
      </div>
    </SectionWrapper>
  );
}
