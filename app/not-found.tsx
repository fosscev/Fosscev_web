"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
    const [typedText, setTypedText] = useState("");
    const fullText = `[  0.000000] Linux version 6.8.9-foss-cev (gcc version 13.2.0)
[  0.000001] Command line: BOOT_IMAGE=/boot/vmlinuz-6.8.9-foss root=UUID=404-not-found ro quiet
[  0.254321] KERNEL: arch: x86_64 allocations: 404
[  0.420069] ACPI: Core revision 20240321
[  1.023456] systemd[1]: Mounting FOSS Filesystem...
[  1.141592] systemd[1]: Started FOSS Community Website Service.
[  1.234567] 404 ERROR: Page Not Found!
[  1.234568] kernel: EIP: 404:[<ffffffff81093404>] EFLAGS: 00010046 CPU: 0
[  1.234569] kernel: RIP: 0010:[<ffffffff81093404>]  [<ffffffff81093404>] path_lookup+0x404/0x500
[  1.234570] kernel: RSP: 0018:ffff88003f803e00  EFLAGS: 00010246
[  1.234571] kernel: Process http-worker (pid: 404, threadinfo ffff88003f802000, task ffff88003f800000)
[  1.234572] kernel: Call Trace:
[  1.234573] kernel:  [<ffffffff81093500>] ? lookup_real+0x20/0x50
[  1.234574] kernel:  [<ffffffff81093404>] ? __path_lookup+0x404/0x500
[  1.234575] kernel:  [<ffffffff81123456>] ? render_page+0x20/0x80
[  1.234576] kernel: ---[ end trace 404404404404404 ]---
[  1.234577] Kernel panic - not syncing: Attempted to kill init! exitcode=0x00000404`;

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setTypedText(fullText.slice(0, currentIndex));
                currentIndex += Math.floor(Math.random() * 5) + 1; // Random typing speed
            } else {
                setTypedText(fullText);
                clearInterval(interval);
            }
        }, 10);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen w-full bg-black text-green-500 font-mono p-4 md:p-8 overflow-hidden flex flex-col relative selection:bg-green-900 selection:text-white animate-flicker">
            <Navbar />

            <div className="flex-1 mt-20 relative z-10 max-w-4xl mx-auto w-full">
                {/* Vintage Screen Effect Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] z-20"></div>
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%]"></div>

                <div className="break-words text-xs md:text-sm lg:text-base leading-tight opacity-90 p-4 bg-black/50 border border-green-500/20 rounded shadow-[0_0_15px_rgba(0,255,0,0.15)]">
                    {typedText.split('\n').map((line, index, arr) => {
                        const isLastLine = index === arr.length - 1;
                        const isErrorLine = line.includes('404 ERROR');
                        return (
                            <div key={index} className={`${isErrorLine ? 'text-red-500 text-2xl md:text-4xl font-black my-4 py-2 border-l-4 border-red-500 pl-4 bg-red-950/40 shadow-[0_0_20px_rgba(255,0,0,0.2)] tracking-widest' : ''}`}>
                                {line}
                                {isLastLine && (
                                    <span className={`inline-block w-2.5 h-[1em] animate-pulse ml-1 align-middle ${isErrorLine ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className={`mt-12 transition-opacity duration-1000 ${typedText.length === fullText.length ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="border border-red-500 bg-red-950/20 p-6 mb-6 animate-pulse shadow-[0_0_20px_rgba(255,0,0,0.2)]">
                        <h2 className="text-5xl md:text-7xl text-red-500 font-bold mb-4">404</h2>
                        <p className="text-red-500 font-bold text-xl">&gt;&gt;&gt; CRITICAL ERROR: PAGE_NOT_FOUND</p>
                        <p className="text-red-400 mt-2">The requested URL was not found on this server.</p>
                    </div>

                    <p className="text-gray-400 mb-6">Create a new detailed implementation plan or return to safety?</p>

                    <Link
                        href="/"
                        className="group relative inline-flex items-center justify-center px-6 py-3 font-bold text-black transition-all duration-200 bg-green-500 font-mono hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 hover:shadow-[0_0_20px_rgba(0,255,0,0.6)]"
                    >
                        <span className="mr-2">sudo reboot</span>
                        <span className="group-hover:translate-x-1 transition-transform">_</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
