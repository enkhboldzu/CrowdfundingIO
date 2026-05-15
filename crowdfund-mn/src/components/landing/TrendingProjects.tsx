"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Flame, LayoutGrid } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useLandingData } from "@/hooks/useLandingData";
import { formatMNT, formatCount } from "@/lib/formatters";
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

/* ── Skeleton pieces ──────────────────────────────────────────── */

function FeaturedSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-gray-100 h-[280px] sm:h-[320px] w-full mb-6" />
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 overflow-hidden">
      <div className="bg-gray-200 h-44" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-2 bg-gray-200 rounded-full w-full" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

/* ── Glassmorphism featured card ──────────────────────────────── */

function FeaturedCard({ project }: { project: Project }) {
  const pct = project.goal > 0 ? Math.min((project.raised / project.goal) * 100, 100) : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="mb-6"
    >
      <Link
        href={`/projects/${project.slug}`}
        className="relative flex flex-col sm:flex-row overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-gray-200/70 shadow-md hover:shadow-xl transition-shadow duration-300 group"
      >
        {/* Image */}
        <div className="relative sm:w-2/5 h-52 sm:h-auto flex-shrink-0 bg-gray-100">
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 40vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <span className="text-6xl opacity-30">📋</span>
            </div>
          )}

          {/* Featured badge */}
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-gray-950 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <Flame className="w-3 h-3 text-orange-400" />
            Онцлох
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full mb-3">
              {project.category}
            </span>
            <h3 className="font-display font-bold text-gray-950 text-xl sm:text-2xl mb-2 leading-snug group-hover:text-blue-700 transition-colors duration-200">
              {project.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
              {project.description}
            </p>
          </div>

          <div className="mt-6">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-bold text-gray-950">{formatMNT(project.raised)}</span>
              <span className="text-gray-400">{Math.round(pct)}% хүрсэн</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-gray-950 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{formatCount(project.backers)} дэмжигч</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-950 group-hover:gap-2 transition-all duration-200">
                Дэлгэрэнгүй <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Dedup util ───────────────────────────────────────────────── */

function uniqueProjects(projects: Project[]): Project[] {
  return projects.filter((p, i, all) => all.findIndex(c => c.id === p.id) === i);
}

/* ── Component ────────────────────────────────────────────────── */

export function TrendingProjects() {
  const { data, loading } = useLandingData();

  const featuredProject =
    data?.featured[0] ??
    data?.projects.find(p => p.isFeatured) ??
    null;

  const trendDisplay = data
    ? uniqueProjects([
        ...(data.trending ?? []).filter(p => p.id !== featuredProject?.id),
        ...(data.projects ?? []).filter(p =>
          p.id !== featuredProject?.id && (p.isTrending || p.isVerified)
        ),
        ...(data.projects ?? []).filter(p => p.id !== featuredProject?.id),
      ]).slice(0, 3)
    : [];

  const isEmpty = !loading && !featuredProject && trendDisplay.length === 0;

  return (
    <section className="py-20 bg-white">
      <div className="container-page">

        {/* Header */}
        <motion.div
          className="flex items-end justify-between mb-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={headerVariant}
        >
          <div>
            <p className="inline-flex items-center gap-1.5 text-gray-400 font-semibold text-xs uppercase tracking-widest mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Олны анхааралд
            </p>
            <h2 className="section-heading">Дэмжихэд бэлэн төслүүд</h2>
          </div>

          <Link
            href="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 text-gray-600 font-semibold text-sm hover:text-gray-950 transition-colors duration-200 group"
          >
            Бүх төслийг үзэх
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Featured */}
        {loading ? (
          <FeaturedSkeleton />
        ) : featuredProject ? (
          <FeaturedCard project={featuredProject} />
        ) : null}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <LayoutGrid className="w-12 h-12 text-gray-200" />
            <p className="text-gray-400 text-lg font-medium">Одоогоор нийтлэгдсэн төсөл алга</p>
            <p className="text-gray-300 text-sm max-w-xs">
              Анхны төслүүд батлагдмагц энд харагдана.
            </p>
          </div>
        ) : (
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
        )}

        {/* Mobile "view all" */}
        {!loading && !isEmpty && (
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-gray-600 font-semibold text-sm hover:text-gray-950 transition-colors duration-200 group"
            >
              Бүх төслийг үзэх
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
