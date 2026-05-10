"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame, LayoutGrid } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/types";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const headerVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const gridVariant = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

interface Props {
  projects: Project[];
  trending: Project[];
}

export function TrendingProjects({ projects, trending }: Props) {
  const isEmpty = projects.length === 0 && trending.length === 0;

  // Featured: explicit isFeatured flag, or null (no mock fallback)
  const featured = projects.find(p => p.isFeatured) ?? null;

  // Trending grid: last-7-days results from DB; if none, fall back to newest 3
  const trendDisplay =
    trending.length > 0 ? trending.slice(0, 3) : projects.slice(0, 3);

  if (isEmpty) {
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
                Төслүүд
              </p>
              <h2 className="section-heading">Онцлох төслүүд 🔥</h2>
            </div>
          </motion.div>

          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <LayoutGrid className="w-12 h-12 text-slate-200" />
            <p className="text-slate-400 text-lg font-medium">
              Одоогоор төсөл байхгүй байна
            </p>
            <p className="text-slate-300 text-sm max-w-xs">
              Удахгүй шинэ төслүүд нэмэгдэнэ. Дахин орж үзнэ үү.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container-page">

        {/* ── Trending header ── */}
        <motion.div
          className="flex items-end justify-between mb-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={headerVariant}
        >
          <div>
            <p className="inline-flex items-center gap-1.5 text-blue-700 font-semibold text-sm uppercase tracking-widest mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Trending
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

        {/* ── Featured project (full-width) ── */}
        {featured && (
          <ProjectCard project={featured} featured className="mb-6" />
        )}

        {/* ── Trending grid ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={gridVariant}
        >
          {trendDisplay.map(project => (
            <motion.div key={project.id} variants={cardVariant}>
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── "View all" — mobile only ── */}
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
