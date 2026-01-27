"use client";

export function Footer() {
    return (
        <footer className="bg-background text-white pt-20 pb-0 overflow-hidden relative border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 lg:mb-40">
                <div>
                    <h3 className="font-display font-bold text-2xl mb-6 text-primary">Connect_</h3>
                    <ul className="space-y-4 font-mono text-gray-400">
                        <li><a href="#" className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors">GitHub</a></li>
                        <li><a href="#" className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors">Twitter (X)</a></li>
                        <li><a href="#" className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors">Instagram</a></li>
                        <li><a href="#" className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors">Discord</a></li>
                    </ul>
                </div>
                <div className="text-right">
                    <h3 className="font-display font-bold text-2xl mb-6 text-primary">Location_</h3>
                    <p className="font-mono text-gray-400">
                        College of Engineering Vadakara<br />
                        Kerala, India
                    </p>
                    <p className="mt-8 text-gray-500 text-sm">© 2024 FOSS Community.</p>
                </div>
            </div>

            {/* Mega Type */}
            <div className="w-full relative flex justify-center -mb-[5vw] select-none pointer-events-none">
                <h1 className="font-display font-black text-[12vw] sm:text-[14vw] leading-[0.8] text-white/5 whitespace-nowrap tracking-tighter">
                    FOSS COMMUNITY
                </h1>
            </div>
        </footer>
    );
}
