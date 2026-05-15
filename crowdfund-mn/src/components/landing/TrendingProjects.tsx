"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
  featured: Project[];
  trending: Project[];
}

function uniqueProjects(projects: Project[]): Project[] {
  return projects.filter((project, index, all) =>
    all.findIndex((candidate) => candidate.id === project.id) === index
  );
}

export function TrendingProjects({ projects, featured, trending }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const backdropY = useTransform(scrollYProgress, [0, 1], [-48, 64]);
  const featuredY = useTransform(scrollYProgress, [0, 1], [24, -28]);
  const gridY = useTransform(scrollYProgress, [0, 1], [18, -16]);
  const featuredProject =
    featured[0] ??
    projects.find((project) => project.isFeatured) ??
    null;

  const trendDisplay = uniqueProjects([
    ...trending.filter((project) => project.id !== featuredProject?.id),
    ...projects.filter((project) =>
      project.id !== featuredProject?.id &&
      (project.isTrending || project.isVerified)
    ),
    ...projects.filter((project) => project.id !== featuredProject?.id),
  ]).slice(0, 3);

  const isEmpty = !featuredProject && trendDisplay.length === 0;

  if (isEmpty) {
    return (
      <section ref={sectionRef} className="relative overflow-hidden py-20 bg-white">
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-blue-50/80 to-transparent"
          style={{ y: reduceMotion ? 0 : backdropY }}
        />
        <div className="container-page relative z-10">
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
              <h2 className="section-heading">Дэмжихэд бэлэн төслүүд</h2>
            </div>
          </motion.div>

          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <LayoutGrid className="w-12 h-12 text-slate-200" />
            <p className="text-slate-400 text-lg font-medium">
              Одоогоор нийтлэгдсэн төсөл алга
            </p>
            <p className="text-slate-300 text-sm max-w-xs">
              Анхны төслүүд батлагдмагц энд харагдана. Та өөрийн санаагаа эхлүүлж болно.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-20 bg-white">
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-blue-50/80 via-white to-transparent"
        style={{ y: reduceMotion ? 0 : backdropY }}
      />
      <motion.div
        aria-hidden
        className="absolute left-0 top-20 h-px w-full bg-gradient-to-r from-transparent via-blue-200/70 to-transparent"
        style={{ y: reduceMotion ? 0 : gridY }}
      />
      <div className="container-page relative z-10">

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
              Олны анхааралд
            </p>
            <h2 className="section-heading">Дэмжихэд бэлэн төслүүд</h2>
          </div>

          <Link
            href="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 text-blue-700 font-semibold text-sm hover:text-blue-900 transition-colors duration-200 group"
          >
            Бүх төслийг үзэх
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* ── Featured project (full-width) ── */}
        {featuredProject && (
          <motion.div style={{ y: reduceMotion ? 0 : featuredY }} className="mb-6">
            <ProjectCard project={featuredProject} featured />
          </motion.div>
        )}

        {/* ── Trending grid ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={gridVariant}
          style={{ y: reduceMotion ? 0 : gridY }}
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
            Бүх төслийг үзэх
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}
