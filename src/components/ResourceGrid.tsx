import { ResourceCard } from "./ResourceCard";
import type { Resource, Creator, Category } from "@/db/schema";

type ResourceWithRelations = Resource & {
  creator: Creator;
  category: Category;
};

type ResourceGridProps = {
  resources: ResourceWithRelations[];
  title?: string;
};

export function ResourceGrid({ resources, title }: ResourceGridProps) {
  if (resources.length === 0) {
    return (
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-stone-500">No resources found in this category.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="font-serif text-2xl text-stone-900 mb-8">{title}</h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </section>
  );
}
