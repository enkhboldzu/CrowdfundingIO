"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import type { Project } from "@/types";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const headerVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

interface Props {
  projects?: Project[];
}

export function TrendingProjects({ projects }: Props) {
  // Fall back to mock data when the DB has no projects yet
  const source   = projects && projects.length > 0 ? projects : MOCK_PROJECTS;
  const featured = source.find(p => p.isFeatured) ?? source[0];
  const trending = source.filter(p => p.isTrending).slice(0, 3);
  const display  = trending.length > 0 ? trending : source.slice(0, 3);

  return (
    <section className="py-20 bg-white">
      <div className="container-page">

        <motion.div
          className="flex items-end justify-between mb-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={headerVariant}
        >
          <div>
            <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-2">
              Т
            </p>
            <h2 className="section-heading">Онцлох төслүүд 🔥</h2>
          </div>

          <Link
            href="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 text-blue-700 font-semibold text-sm hover:text-blue-900 transition-colors duration-200 group"
          >
            Бүгдийг харах
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {featured && (
          <ProjectCard project={featured} featured className="mb-6" />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {display.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-blue-700 font-semibold text-sm hover:text-blue-900 transition-colors duration-200 group"
          >
            Бүгдийг харах
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}
