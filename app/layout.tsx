import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://foss-community-site.vercel.app"),
  title: {
    default: "FOSS CEV - Free and Open Source Software Community",
    template: "%s | FOSS CEV",
  },
  description: "Code. Collaborate. Create. The official Open Source Community of College of Engineering Vadakara.",
  keywords: ["FOSS", "Open Source", "CEV", "College of Engineering Vadakara", "Tech Community", "Hackathon", "Workshops"],
  authors: [{ name: "FOSS Club CEV" }],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "FOSS CEV - Free and Open Source Software Community",
    description: "Code. Collaborate. Create. The official Open Source Community of College of Engineering Vadakara.",
    type: "website",
    locale: "en_US",
    siteName: "FOSS CEV",
  },
  twitter: {
    card: "summary_large_image",
    title: "FOSS CEV",
    description: "Code. Collaborate. Create. The official Open Source Community.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="7MzaWTUQlwj6kn8MtWmcdX3JIZVYEEH9Tp_0UOSOQR4" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-gray-100 font-body overflow-x-hidden selection:bg-primary selection:text-black">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Global Minimalistic Background */}
          <div className="fixed inset-0 pointer-events-none z-0 bg-[#0a0a0a]">
            {/* Subtle radial glow in the center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-50 text-emerald-500"></div>

            {/* Subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            {/* Hacker grid pattern */}
            <div className="absolute inset-0 hacker-grid opacity-20"></div>

            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none"></div>

            {/* Glowing dots at grid intersections */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(0, 230, 118, 0.15) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              backgroundPosition: '0 0, 20px 20px'
            }}></div>

            {/* Animated scan lines */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-vertical"></div>
            </div>
          </div>

          <div className="relative z-10">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
