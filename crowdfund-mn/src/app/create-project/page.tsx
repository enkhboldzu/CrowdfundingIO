import type { Metadata } from "next";
import { CreateProjectClient } from "./CreateProjectClient";

export const metadata: Metadata = {
  title: "Төсөл Үүсгэх — Crowdfund.mn",
  description: "Таван алхамт ойлгомжтой бүртгэлийн дамжуулалтаар краудфандинг кампанит ажлаа эхлүүлж дэмжигчид олоорой.",
};

export default function CreateProjectPage() {
  return <CreateProjectClient />;
}
