import Link from "next/link";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { MOCK_PROJECTS } from "@/lib/mock-data";

export function TrendingProjects() {
  const trending = MOCK_PROJECTS.slice(0, 3);
  const featured = MOCK_PROJECTS[4];

  return (
    <section className="py-20 bg-white">
      <div className="container-page">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-2">
              
            </p>
            <h2 className="section-heading">
              Онцлох төслүүд 🔥
            </h2>
          </div>
          <Link
            href="/discover"
            className="hidden sm:inline-flex items-center gap-1 text-blue-700 font-semibold text-sm hover:text-blue-900 transition-colors"
          >
            Бүгдийг харах
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {/* Featured project (full-width) */}
        <ProjectCard project={featured} featured className="mb-6" />

        {/* Grid of 3 trending cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trending.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Mobile "see all" link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/discover"
            className="inline-flex items-center gap-1 text-blue-700 font-semibold text-sm"
          >
            Бүгдийг харах
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
