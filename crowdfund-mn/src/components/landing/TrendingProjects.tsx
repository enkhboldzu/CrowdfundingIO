"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Clock } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { fundingPercent, daysLeftLabel } from "@/lib/utils";
import { imageSrcOrFallback } from "@/lib/image-src";
import type { Project } from "@/types";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CATEGORY_LABELS: Record<string, string> = {
  technology: "Технологи", arts: "Урлаг",       film: "Кино",
  environment: "Байгаль",  games: "Тоглоом",    health: "Эрүүл мэнд",
  education:  "Боловсрол", community: "Нийгэм", food: "Хоол & Ундаа",
  fashion:    "Загвар",    music: "Хөгжим",      publishing: "Хэвлэл",
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/* ── Large glassmorphism featured card ───────────────────────── */

function FeaturedCard({ project }: { project: Project }) {
  const percent = fundingPercent(project.raised, project.goal);
  const [imgSrc, setImgSrc] = useState(imageSrcOrFallback(project.coverImage));
  const [avatarSrc, setAvatarSrc] = useState(imageSrcOrFallback(project.creator.avatar));

  return (
    <motion.div
      className="group relative flex flex-col sm:flex-row overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] transition-all duration-500 mb-8"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {/* Stretched link */}
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-[1] rounded-3xl"
        aria-label={`${project.title} дэлгэрэнгүй харах`}
      />

      {/* ── Cover image ── */}
      <div className="relative sm:w-[45%] h-64 sm:h-auto min-h-[280px] overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={imgSrc}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 45vw"
          onError={() => setImgSrc(imageSrcOrFallback(null))}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Category pill */}
        <div className="absolute top-4 left-4 z-[2]">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full">
            {CATEGORY_LABELS[project.category] ?? project.category}
          </span>
        </div>

        {project.isTrending && (
          <div className="absolute top-4 right-4 z-[2]">
            <span className="bg-gray-950 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              🔥 Онцлох
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="relative z-[2] flex flex-col justify-between p-7 sm:p-10 pointer-events-none flex-1">

        {/* Creator row */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={avatarSrc}
              alt={project.creator.name}
              fill
              className="object-cover"
              onError={() => setAvatarSrc(imageSrcOrFallback(null))}
            />
          </div>
          <span className="text-sm text-gray-500 font-medium">{project.creator.name}</span>
          {project.creator.isVerified && (
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Title + description */}
        <div className="mb-6">
          <h3 className="font-display font-black text-2xl sm:text-3xl text-gray-950 leading-tight mb-3 line-clamp-2">
            {project.title}
          </h3>
          <p className="text-gray-400 leading-relaxed line-clamp-2 text-base">
            {project.description}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <ProgressBar value={percent} raised={project.raised} goal={project.goal} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" strokeWidth={2} />
              {project.backers.toLocaleString()} дэмжигч
            </span>
            <span className={`flex items-center gap-1.5 ${project.daysLeft <= 3 ? "text-red-500 font-semibold" : ""}`}>
              <Clock className="w-3.5 h-3.5" strokeWidth={2} />
              {daysLeftLabel(project.daysLeft)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => { window.location.href = `/projects/${project.slug}`; }}
            className="pointer-events-auto relative z-[3] inline-flex items-center gap-1.5 bg-gray-950 hover:bg-gray-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            Дэмжих <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl border border-gray-200 flex items-center justify-center">
        <span className="text-2xl">📭</span>
      </div>
      <p className="text-gray-500 text-lg font-semibold">Одоогоор нийтлэгдсэн төсөл алга</p>
      <p className="text-gray-300 text-sm max-w-xs">
        Анхны төслүүд батлагдмагц энд харагдана.
      </p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

interface Props {
  projects: Project[];
  featured: Project[];
  trending: Project[];
}

function uniqueProjects(projects: Project[]): Project[] {
  return projects.filter((p, i, all) => all.findIndex(c => c.id === p.id) === i);
}

export function TrendingProjects({ projects, featured, trending }: Props) {
  const featuredProject =
    featured[0] ??
    projects.find(p => p.isFeatured) ??
    null;

  const trendDisplay = uniqueProjects([
    ...trending.filter(p => p.id !== featuredProject?.id),
    ...projects.filter(p =>
      p.id !== featuredProject?.id && (p.isTrending || p.isVerified)
    ),
    ...projects.filter(p => p.id !== featuredProject?.id),
  ]).slice(0, 3);

  const isEmpty = !featuredProject && trendDisplay.length === 0;

  return (
    <section className="py-24 bg-white">
      <div className="container-page">

        {/* ── Section header ── */}
        <motion.div
          className="flex items-end justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
              Онцлох төслүүд
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-950 tracking-tight leading-tight">
              Дэмжихэд бэлэн<br className="sm:hidden" /> <span className="text-blue-800">төслүүд</span>
            </h2>
          </div>

          <Link
            href="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-950 transition-colors group"
          >
            Бүгдийг харах
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
          </Link>
        </motion.div>

        {isEmpty ? <EmptyState /> : (
          <>
            {/* ── Featured project ── */}
            {featuredProject && <FeaturedCard project={featuredProject} />}

            {/* ── Trending grid ── */}
            {trendDisplay.length > 0 && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
              >
                {trendDisplay.map(project => (
                  <motion.div key={project.id} variants={cardVariant}>
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}

        {/* ── Mobile "view all" ── */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-950 transition-colors group"
          >
            Бүгдийг харах
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
          </Link>
        </div>

      </div>
    </section>
  );
}
