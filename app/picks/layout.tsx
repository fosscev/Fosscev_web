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
            <main className="relative min-h-screen text-white selection:bg-[#D85A30] selection:text-white overflow-hidden">
                <div className="relative z-10">
                    <Navbar />
                    {children}
                    <Footer />
                </div>
            </main>
        </PicksAuthProvider>
    );
}
