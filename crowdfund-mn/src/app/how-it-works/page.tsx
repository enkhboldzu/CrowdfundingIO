import type { Metadata } from "next";
import { HowItWorksClient } from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "Хэрхэн Ажилладаг — Crowdfund.mn",
  description:
    "Crowdfund.mn дээр төсөл эхлэх, дэмжих үйл явцыг алхам алхмаар мэдэж аваарай. Хялбар, ил тод, найдвартай.",
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
