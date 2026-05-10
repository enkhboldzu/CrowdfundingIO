import type { Metadata } from "next";
import { ExploreClient } from "./ExploreClient";

export const metadata: Metadata = {
  title: "Төгс төслөө олоорой — Crowdfund.mn",
  description:
    "Монголын шилдэг краудфандинг төслүүдийг олж, дэмжих боломжтой. Технологи, урлаг, боловсрол, нийгмийн ангиллаар хайна уу.",
};

interface Props {
  searchParams: { category?: string };
}

export default function ExplorePage({ searchParams }: Props) {
  return <ExploreClient initialCategory={searchParams.category ?? "all"} />;
}
