import type { Metadata } from "next";
import { ExploreClient } from "./ExploreClient";

export const metadata: Metadata = {
  title: "Төгс төслөө олоорой — Crowdfund.mn",
  description:
    "Монголын шилдэг краудфандинг төслүүдийг олж, дэмжих боломжтой. Технологи, урлаг, боловсрол, нийгмийн ангиллаар хайна уу.",
};

export default function ExplorePage() {
  return <ExploreClient />;
}
