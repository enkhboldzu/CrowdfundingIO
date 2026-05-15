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
        <section className="py-20 bg-slate-50">
          <div className="container-page text-center">
            <h2 className="section-heading mb-4">
              Таны санаа хэрэгжих цаг нь болжээ
            </h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto mb-8">
              Өнөөдөр нэгдэж, Монголын хамгийн итгэмжтэй краудфандинг платформоос
              дэмжлэг ав эсвэл өгч эхэл.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GuardedLink
                href="/create-project"
                className="inline-flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-cta transition-all duration-200 hover:-translate-y-0.5"
              >
                Төсөл эхлэх
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </GuardedLink>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 border-2 border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-200"
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
