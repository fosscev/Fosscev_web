import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: {
    default: "FOSS CEV - Free and Open Source Software Community",
    template: "%s | FOSS CEV",
  },
  description: "Code. Collaborate. Create. The official Open Source Community of College of Engineering Vadakara.",
  keywords: ["FOSS", "Open Source", "CEV", "College of Engineering Vadakara", "Tech Community", "Hackathon", "Workshops"],
  authors: [{ name: "FOSS Club CEV" }],
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
