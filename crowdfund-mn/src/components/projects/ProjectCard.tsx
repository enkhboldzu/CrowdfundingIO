"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge }       from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { fundingPercent, daysLeftLabel } from "@/lib/utils";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { DEFAULT_PROJECT_COVER, imageSrcOrFallback, normalizeImageSrc } from "@/lib/image-src";

function validImageSrc(src: string | null | undefined): string | null {
  return normalizeImageSrc(src);
}

function normalizeSrc(src: string | null | undefined): string {
  return imageSrcOrFallback(src);
}

function projectImages(project: Project): string[] {
  const images = [
    ...(project.galleryImages ?? []),
    project.coverImage,
  ]
    .map(validImageSrc)
    .filter((src): src is string => Boolean(src));

  const unique = Array.from(new Set(images));
  return unique.length > 0 ? unique : [DEFAULT_PROJECT_COVER];
}

const CATEGORY_LABELS: Record<string, string> = {
  technology:  "Технологи",
  arts:        "Урлаг",
  film:        "Кино",
  environment: "Байгаль орчин",
  games:       "Тоглоом",
  health:      "Эрүүл мэнд",
  education:   "Боловсрол",
  community:   "Нийгэм",
  food:        "Хоол & Ундаа",
  fashion:     "Загвар",
  music:       "Хөгжим",
  publishing:  "Хэвлэл",
  social:      "Нийгэм",
  startups:    "Стартап",
};

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
  className?: string;
}

export function ProjectCard({ project, featured = false, className }: ProjectCardProps) {
  const percent  = fundingPercent(project.raised, project.goal);
  const router   = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const images    = useMemo(() => projectImages(project), [project]);
  const [imageIndex, setImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [avatarSrc, setAvatarSrc] = useState(() => normalizeSrc(project.creator.avatar));
  const currentImage = images[imageIndex % images.length] ?? DEFAULT_PROJECT_COVER;
  const displayImage = failedImages.includes(currentImage) ? DEFAULT_PROJECT_COVER : currentImage;

  useEffect(() => {
    if (images.length <= 1 || isCarouselPaused || shouldReduceMotion) return;

    const interval = window.setInterval(() => {
      setSlideDirection(1);
      setImageIndex((currentIndex) => (currentIndex + 1) % images.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [images.length, isCarouselPaused, shouldReduceMotion]);

  function showImage(nextIndex: number, direction: number, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setSlideDirection(direction);
    setImageIndex((nextIndex + images.length) % images.length);
  }

  return (
    /*
      motion.div handles scroll-reveal (whileInView) and hover lift.
      An absolutely-positioned <Link> at z-[1] covers the whole card.
      Card body at z-[2] + pointer-events-none; Дэмжих button overrides with pointer-events-auto.
    */
    <motion.div
      className={cn(
        "group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100",
        "shadow-card",
        featured && "sm:flex-row",
        className
      )}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px -8px rgba(30,64,175,0.14), 0 8px 16px -4px rgba(30,64,175,0.08)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Stretched link */}
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-[1] rounded-2xl"
        aria-label={`${project.title} дэлгэрэнгүй харах`}
      />

      {/* Cover image */}
      <div
        className={cn(
          "relative z-0 overflow-hidden bg-slate-100",
          featured ? "h-60 sm:h-auto sm:min-h-[320px] sm:w-[45%]" : "h-60 sm:h-64"
        )}
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
        onFocus={() => setIsCarouselPaused(true)}
        onBlur={() => setIsCarouselPaused(false)}
      >
        <AnimatePresence mode="popLayout" custom={slideDirection}>
          <motion.div
            key={`${displayImage}-${imageIndex}`}
            custom={slideDirection}
            initial={{ x: slideDirection * 36, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slideDirection * -36, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={displayImage}
              alt=""
              fill
              className="object-cover scale-110 blur-xl opacity-35"
              sizes={featured ? "(max-width: 640px) 100vw, 45vw" : "(max-width: 768px) 100vw, 33vw"}
              aria-hidden
            />
            <Image
              src={displayImage}
              alt={project.title}
              fill
              className="object-contain transition-transform duration-500"
              sizes={featured ? "(max-width: 640px) 100vw, 45vw" : "(max-width: 768px) 100vw, 33vw"}
              onError={() => setFailedImages((prev) => prev.includes(currentImage) ? prev : [...prev, currentImage])}
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <div className="absolute inset-x-3 top-1/2 z-[3] flex -translate-y-1/2 justify-between opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(event) => showImage(imageIndex - 1, -1, event)}
                className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-800 shadow-sm hover:bg-white"
                aria-label="Өмнөх зураг"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(event) => showImage(imageIndex + 1, 1, event)}
                className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-800 shadow-sm hover:bg-white"
                aria-label="Дараах зураг"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 gap-1.5">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={(event) => showImage(index, index >= imageIndex ? 1 : -1, event)}
                  className={cn(
                    "pointer-events-auto h-1.5 rounded-full transition-all",
                    index === imageIndex % images.length ? "w-5 bg-white" : "w-1.5 bg-white/60"
                  )}
                  aria-label={`Зураг ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-3 left-3 z-[4]">
          <Badge variant="blue" className="backdrop-blur-sm bg-blue-800/90 text-white border-0">
            {CATEGORY_LABELS[project.category] ?? project.category}
          </Badge>
        </div>
        {project.isTrending && (
          <div className="absolute top-3 right-3 z-[4]">
            <Badge variant="yellow" className="backdrop-blur-sm">🔥 Онцлох</Badge>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="relative z-[2] flex flex-col flex-1 p-5 pointer-events-none">
        {/* Creator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
            <Image src={avatarSrc} alt={project.creator.name} fill className="object-cover" onError={() => setAvatarSrc(DEFAULT_PROJECT_COVER)} />
          </div>
          <span className="text-xs text-slate-500 font-medium truncate">{project.creator.name}</span>
          {project.creator.isVerified && (
            <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 className={cn("font-display font-bold text-slate-900 leading-snug mb-2 line-clamp-2", featured ? "text-xl sm:text-2xl" : "text-base")}>
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {project.description}
        </p>

        {/* Progress */}
        <ProgressBar value={percent} raised={project.raised} goal={project.goal} className="mb-4" />

        {/* Bottom row */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
            </svg>
            <span>{project.backers.toLocaleString()} дэмжигч</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("font-semibold", project.daysLeft <= 3 ? "text-red-600" : "text-slate-600")}>
              {daysLeftLabel(project.daysLeft)}
            </span>
            <motion.button
              type="button"
              onClick={() => router.push(`/projects/${project.slug}`)}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="pointer-events-auto flex-shrink-0 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
            >
              Дэмжих
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
