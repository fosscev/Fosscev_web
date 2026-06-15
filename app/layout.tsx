import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/SmoothScroll";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://foss.cev.ac.in"),
  title: {
    default: "FOSS CEV - Free and Open Source Software Community",
    template: "%s | FOSS CEV",
  },
  description: "Code. Collaborate. Create. The official Open Source Community of College of Engineering Vadakara.",
  keywords: ["FOSS", "Open Source", "CEV", "College of Engineering Vadakara", "Tech Community", "Hackathon", "Workshops"],
  authors: [{ name: "FOSS Club CEV" }],
  icons: {
    icon: "/foss.png",
    apple: "/foss.png",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "FOSS CEV",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://foss.cev.ac.in",
              "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://foss.cev.ac.in"}/foss.png`
            })
          }}
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
          <SmoothScroll>
            {/* Global Minimalistic Background - optimized for Chrome */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-[#0a0a0a]" style={{ contain: 'strict' }}>
              {/* Radial glow - using radial-gradient instead of blur-[120px] for zero-cost GPU rendering */}
              <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse 600px 600px at 50% 50%, rgba(0, 230, 118, 0.04), transparent 70%)'
              }}></div>

              {/* Hacker grid pattern */}
              <div className="absolute inset-0 hacker-grid opacity-20"></div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
            </div>

            <div className="relative z-10">
              {children}
            </div>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
