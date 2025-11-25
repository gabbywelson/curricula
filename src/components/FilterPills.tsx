"use client";

import posthog from 'posthog-js';
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type FilterItem = {
  id: number;
  name: string;
  slug: string;
  resourceCount: number;
  description?: string | null;
};

type FilterPillsProps = {
  items: FilterItem[];
  paramName: string;
  label?: string;
  className?: string;
  layout?: "row" | "wrap";
};

export function FilterPills({
  items,
  paramName,
  label,
  className,
  layout = "wrap",
}: FilterPillsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeValue = searchParams.get(paramName);

  const createHref = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(paramName);
    } else {
      params.set(paramName, value);
    }
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className={cn("py-4", className)}>
      {label && (
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
          {label}
        </h3>
      )}
      <div
        className={cn(
          "flex items-center gap-2",
          layout === "row"
            ? "overflow-x-auto pb-2 scrollbar-hide"
            : "flex-wrap"
        )}
      >
        <Link
          href={createHref(null)}
          onClick={() =>
            posthog.capture("filter_pill_clicked", {
              filter_name: "All",
              filter_slug: null,
              filter_param: paramName,
            })
          }
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
            !activeValue
              ? "bg-stone-900 text-white border-stone-900"
              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
          )}
        >
          All
        </Link>

        {items.map((item) => (
          <Link
            key={item.id}
            href={createHref(item.slug)}
            onClick={() =>
              posthog.capture("filter_pill_clicked", {
                filter_name: item.name,
                filter_slug: item.slug,
                filter_param: paramName,
                resource_count: item.resourceCount,
              })
            }
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
              activeValue === item.slug
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
            )}
          >
            {item.name}
            <span
              className={cn(
                "ml-1.5 text-xs",
                activeValue === item.slug ? "text-stone-300" : "text-stone-400"
              )}
            >
              {item.resourceCount}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
