import type { Metadata } from "next";
import { PicksAuthProvider } from "@/components/picks/PicksAuthProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
    title: "Open Source Picks",
    description: "Discover and share your favorite open-source tools with the FOSS CEV community. Vote, comment, and discuss.",
    openGraph: {
        title: "Open Source Picks — FOSS CEV",
        description: "Community-curated list of the best open-source tools. Share what works for you.",
    },
};

export default function PicksLayout({ children }: { children: React.ReactNode }) {
    return (
        <PicksAuthProvider>
            <main className="relative min-h-screen text-white selection:bg-[#00e676] selection:text-black overflow-hidden">
                {/* Subtle animated background grid */}
                <div className="fixed inset-0 z-0 hacker-grid opacity-30 pointer-events-none" />
                {/* Green glow top */}
                <div
                    className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none z-0"
                    style={{
                        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,230,118,0.08) 0%, transparent 70%)',
                    }}
                />
                <div className="relative z-10">
                    <Navbar />
                    {children}
                    <Footer />
                </div>
            </main>
        </PicksAuthProvider>
    );
}
