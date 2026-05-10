import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { fundingPercent, daysLeftLabel } from "@/lib/utils";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

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
  const percent = fundingPercent(project.raised, project.goal);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100",
        "transition-all duration-300 hover:-translate-y-1",
        "shadow-card hover:shadow-card-hover",
        featured && "sm:flex-row",
        className
      )}
    >
      {/* Cover image */}
      <div
        className={cn(
          "relative overflow-hidden bg-slate-100",
          featured ? "sm:w-[45%] h-48 sm:h-auto" : "h-48"
        )}
      >
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={featured ? "(max-width: 640px) 100vw, 45vw" : "(max-width: 768px) 100vw, 33vw"}
        />

        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <Badge variant="blue" className="backdrop-blur-sm bg-blue-800/90 text-white border-0">
            {CATEGORY_LABELS[project.category] ?? project.category}
          </Badge>
        </div>

        {/* Trending badge */}
        {project.isTrending && (
          <div className="absolute top-3 right-3">
            <Badge variant="yellow" className="backdrop-blur-sm">
              🔥 Тренд
            </Badge>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Creator row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
            <Image
              src={project.creator.avatar}
              alt={project.creator.name}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium truncate">
            {project.creator.name}
          </span>
          {project.creator.isVerified && (
            <svg
              className="w-3.5 h-3.5 text-blue-600 flex-shrink-0"
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-display font-bold text-slate-900 leading-snug mb-2 line-clamp-2",
          featured ? "text-xl sm:text-2xl" : "text-base"
        )}>
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {project.description}
        </p>

        {/* Progress */}
        <ProgressBar
          value={percent}
          raised={project.raised}
          goal={project.goal}
          className="mb-4"
        />

        {/* Bottom meta row */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
            </svg>
            <span>{project.backers.toLocaleString()} дэмжигч</span>
          </div>
          <span
            className={cn(
              "font-semibold",
              project.daysLeft <= 3 ? "text-red-600" : "text-slate-600"
            )}
          >
            {daysLeftLabel(project.daysLeft)}
          </span>
        </div>
      </div>
    </Link>
  );
}
