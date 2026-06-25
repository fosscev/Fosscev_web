import { FinancesSkeleton } from "@/components/skeletons/FinancesSkeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function FinancesLoading() {
    return (
        <div className="relative min-h-screen text-white selection:bg-primary selection:text-black overflow-hidden">
            <div className="relative z-10">
                <Navbar />

                <main className="pt-32 pb-24">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="text-center mb-16 md:mb-24">
                            <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-mono text-gray-300">
                                <span className="text-primary mr-2">●</span> Transparency
                            </div>
                            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
                                Financial <span className="text-primary">Reports</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                We believe in open source and open books. Explore the financial details of our community and events.
                            </p>
                        </div>

                        <div className="space-y-16 md:space-y-24">
                            <FinancesSkeleton />
                        </div>
                    </div>
                </main>
                
                <Footer />
            </div>
        </div>
    );
}
