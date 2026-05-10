import { Footer }     from "@/components/landing/Footer";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata = { title: "Төсөл Эхлэх — Crowdfund.mn" };

export default function StartProjectPage() {
  return (
    <>
      <main className="pt-20">
        <ComingSoon
          icon="🚀"
          title="Төсөл Эхлэх"
          description="Таны санааг бодит болгох аялал эндээс эхэлнэ. Краудфандинг кампанит ажил үүсгэх, дэмжигчид татах, зорилгодоо хүрэх."
        />
      </main>
      <Footer />
    </>
  );
}
