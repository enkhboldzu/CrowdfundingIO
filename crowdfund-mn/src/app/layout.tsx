import type { Metadata } from "next";
import { Manrope, Noto_Sans } from "next/font/google";
import { AuthProvider }    from "@/context/AuthContext";
import { ToastProvider }   from "@/context/ToastContext";
import { NavbarShell }     from "@/components/landing/NavbarShell";
import { ChatBotShell }    from "@/components/chat/ChatBotShell";
import { PageTransition }  from "@/components/ui/PageTransition";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "cyrillic"],
  weight: "variable",
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: "variable",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crowdfund.mn — Монголын краудфандинг платформ",
  description:
    "Монголын шилдэг краудфандинг платформ. Өөрийн санаагаа хэрэгжүүлж, нийгэмд үнэ цэнтэй бүтээл туурвих боломж.",
  keywords: ["краудфандинг", "монгол", "хөрөнгө оруулалт", "crowdfunding", "Mongolia"],
  openGraph: {
    type: "website",
    locale: "mn_MN",
    url: "https://crowdfund.mn",
    siteName: "Crowdfund.mn",
    title: "Crowdfund.mn — Монголын краудфандинг платформ",
    description: "Монголын шилдэг краудфандинг платформ.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="mn"
      className={`${notoSans.variable} ${manrope.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <ToastProvider>
            {/*
              NavbarShell renders the public Navbar on every route except /admin/*.
              Admin pages get their own header + sidebar via src/app/admin/layout.tsx.
            */}
            <NavbarShell />
            <PageTransition>{children}</PageTransition>
            <ChatBotShell />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
