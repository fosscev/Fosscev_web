import { TeamSkeleton } from "@/components/skeletons/TeamSkeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TeamLoading() {
    return (
        <div className="relative min-h-screen text-white selection:bg-primary selection:text-black overflow-hidden flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20">
                <TeamSkeleton />
            </main>
            <Footer />
        </div>
    );
}
