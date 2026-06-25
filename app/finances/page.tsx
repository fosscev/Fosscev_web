import { supabase } from '@/lib/supabase';
import type { FinancialReport } from '@/lib/supabase';
import { FileText, Calendar, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Suspense } from 'react';
import { FinancesSkeleton } from '@/components/skeletons/FinancesSkeleton';

export const metadata = {
    title: 'Financial Reports | FOSS Community CEV',
    description: 'Transparency is key. View our yearly and event-wise financial reports.',
};

export const dynamic = 'force-dynamic';

async function FinancesContent() {
    // Fetch all financial reports
    const { data: reports, error } = await supabase
        .from('financial_reports')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching financial reports:', error);
        // We could render a server-side error state here, but for now we'll just show empty/null check gracefully
    }

    const yearlyReports = (reports as FinancialReport[] | null)?.filter(r => r.type === 'Yearly') || [];

    const renderReportCard = (report: FinancialReport) => {
        const isPositive = report.balance >= 0;

        return (
            <div key={report.id} className="bg-surface/50 border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-surface/80 hover:border-white/10 transition-all group">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white font-display mb-2">{report.title}</h3>
                        <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(report.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                    {report.report_url && (
                        <a
                            href={report.report_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium text-white transition-colors"
                        >
                            <FileText className="w-4 h-4 text-primary" />
                            <span>View Document</span>
                        </a>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                            <span className="font-mono text-sm uppercase tracking-wider">Total Income</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            ₹{report.income.toLocaleString('en-IN')}
                        </div>
                    </div>
                    
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                            <span className="font-mono text-sm uppercase tracking-wider">Total Expenses</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            ₹{report.expenses.toLocaleString('en-IN')}
                        </div>
                    </div>

                    <div className="bg-black/30 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl opacity-20 ${isPositive ? 'bg-primary' : 'bg-red-500'}`}></div>
                        <div className="flex items-center gap-2 text-gray-400 mb-2 relative z-10">
                            <Wallet className={`w-4 h-4 ${isPositive ? 'text-primary' : 'text-red-500'}`} />
                            <span className="font-mono text-sm uppercase tracking-wider">Final Balance</span>
                        </div>
                        <div className={`text-2xl font-bold relative z-10 ${isPositive ? 'text-primary' : 'text-red-500'}`}>
                            {isPositive ? '+' : '-'}₹{Math.abs(report.balance).toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                {((report.income_details && report.income_details.length > 0 && report.income_details[0].item) || 
                  (report.expense_details && report.expense_details.length > 0 && report.expense_details[0].item)) && (
                    <div className="mt-8 border-t border-white/10 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Income Table */}
                        {report.income_details && report.income_details.length > 0 && report.income_details[0].item && (
                            <div>
                                <h4 className="text-lg font-bold text-green-500 mb-4 flex items-center gap-2">
                                    <ArrowUpRight className="w-4 h-4" /> Income Breakdown
                                </h4>
                                <div className="bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                                    <table className="w-full text-left text-sm text-gray-300">
                                        <thead className="bg-black/40 text-gray-400 font-mono text-xs uppercase">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Item</th>
                                                <th className="px-4 py-3 font-medium text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {report.income_details.map((detail, idx) => detail.item && (
                                                <tr key={idx} className="hover:bg-white/[0.02]">
                                                    <td className="px-4 py-3">{detail.item}</td>
                                                    <td className="px-4 py-3 text-right text-green-400 font-mono">₹{detail.amount.toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Expense Table */}
                        {report.expense_details && report.expense_details.length > 0 && report.expense_details[0].item && (
                            <div>
                                <h4 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
                                    <ArrowDownRight className="w-4 h-4" /> Expense Breakdown
                                </h4>
                                <div className="bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                                    <table className="w-full text-left text-sm text-gray-300">
                                        <thead className="bg-black/40 text-gray-400 font-mono text-xs uppercase">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Item</th>
                                                <th className="px-4 py-3 font-medium text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {report.expense_details.map((detail, idx) => detail.item && (
                                                <tr key={idx} className="hover:bg-white/[0.02]">
                                                    <td className="px-4 py-3">{detail.item}</td>
                                                    <td className="px-4 py-3 text-right text-red-400 font-mono">₹{detail.amount.toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <section>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-8 h-1 bg-primary rounded-full"></span>
                Yearly Reports
            </h2>
            
            {yearlyReports.length > 0 ? (
                <div className="space-y-6">
                    {yearlyReports.map(renderReportCard)}
                </div>
            ) : (
                <div className="text-center py-12 bg-surface/30 border border-white/5 rounded-2xl">
                    <p className="text-gray-400">No yearly reports available yet.</p>
                </div>
            )}
        </section>
    );
}

export default function FinancesPage() {
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
                            <Suspense fallback={<FinancesSkeleton />}>
                                <FinancesContent />
                            </Suspense>
                        </div>
                    </div>
                </main>
                
                <Footer />
            </div>
        </div>
    );
}
