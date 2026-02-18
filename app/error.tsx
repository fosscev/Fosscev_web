"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen w-full bg-black text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glitch Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20"></div>
                <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-gradient-to-r from-transparent via-red-900/10 to-transparent skew-x-12 animate-scan"></div>
            </div>

            <div className="relative z-10 max-w-md w-full bg-gray-900/50 backdrop-blur-md border border-red-500/30 p-8 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse"></div>
                        <AlertTriangle className="w-16 h-16 text-red-500 relative z-10" />
                    </div>
                </div>

                <h2 className="text-3xl font-display font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                    SYSTEM GLITCH
                </h2>

                <p className="text-center text-gray-400 mb-6 font-mono text-sm border-t border-b border-gray-800 py-3 my-4 bg-black/20">
                    ERROR_CODE: {error.digest || "UNKNOWN_RUNTIME_EXCEPTION"}
                </p>

                <p className="text-center text-gray-300 mb-8">
                    An unexpected error occurred in the system. Our team has been notified.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-600/30 group"
                    >
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        TRY AGAIN
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-mono rounded-lg transition-all duration-200"
                    >
                        <Home className="w-4 h-4" />
                        ./RETURN_HOME
                    </Link>
                </div>
            </div>

            {/* Tech Decoration */}
            <div className="absolute bottom-8 left-8 font-mono text-xs text-red-900/50">
                CORE DUMP :: 0x84392
            </div>
            <div className="absolute top-8 right-8 font-mono text-xs text-red-900/50">
                STATUS :: CRITICAL
            </div>

        </div>
    );
}
