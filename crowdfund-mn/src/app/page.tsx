import Link from "next/link";
import { GuardedLink }      from "@/components/ui/GuardedLink";
import { Hero }             from "@/components/landing/Hero";
import { TrendingProjects } from "@/components/landing/TrendingProjects";
import { Categories }       from "@/components/landing/Categories";
import { TrustSection }     from "@/components/landing/TrustSection";
import { HowItWorks }       from "@/components/landing/HowItWorks";
import { Footer }           from "@/components/landing/Footer";
import { getLandingProjects, getProjectCountsByCategory } from "@/lib/db/queries";
import { toProject } from "@/lib/db/transform";
import { getPublicStats } from "@/lib/db/stats";

export default async function LandingPage() {
  const [{ projects: rawProjects, featured: rawFeatured, trending: rawTrending }, counts, stats] = await Promise.all([
    getLandingProjects(20),
    getProjectCountsByCategory(),
    getPublicStats(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = (rawProjects as any[]).map(toProject);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featured = (rawFeatured as any[]).map(toProject);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trending = (rawTrending as any[]).map(toProject);

  return (
    <>
      <main className="flex flex-col">
        <Hero stats={stats} />
        <TrendingProjects projects={projects} featured={featured} trending={trending} />
        <Categories counts={counts} />
        <TrustSection />
        <HowItWorks />

        {/* CTA Banner */}
        <section className="py-24 bg-gray-950 relative overflow-hidden">
          {/* Subtle grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          {/* Ambient glow */}
          <div
            aria-hidden
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[200%] pointer-events-none opacity-10"
            style={{ background: "radial-gradient(ellipse, #1e40af 0%, transparent 65%)" }}
          />

          <div className="container-page relative z-10 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
              Эхлэх цаг нь болсон
            </p>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight mb-5 text-balance">
              Таны санаа хэрэгжих<br className="hidden sm:block" /> цаг нь болжээ
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
              Өнөөдөр нэгдэж, Монголын хамгийн итгэмжтэй краудфандинг
              платформоос дэмжлэг ав эсвэл өгч эхэл.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <GuardedLink
                href="/create-project"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-950 font-bold text-[15px] px-7 py-3.5 rounded-2xl transition-colors duration-200"
              >
                Төсөл эхлэх
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </GuardedLink>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-bold text-[15px] px-7 py-3.5 rounded-2xl transition-colors duration-200"
              >
                Төслүүд харах
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
