import type { Metadata } from "next";
import { HelpClient } from "./HelpClient";

export const metadata: Metadata = {
  title: "Тусламж & FAQ — Crowdfund.mn",
  description: "crowdfund.mn-ийн хамгийн их асуугддаг асуултуудад хариулт, дэмжлэгийн мэдээлэл.",
};

export default function HelpPage() {
  return <HelpClient />;
}
