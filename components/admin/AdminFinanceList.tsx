"use client";

import { useState, useEffect } from 'react';
import { supabase, uploadFile, deleteFile } from '@/lib/supabase';
import type { FinancialReport, FinanceDetail } from '@/lib/supabase';
import { FileText, Link as LinkIcon, Trash2, Edit2, Upload, X, Plus, Minus } from 'lucide-react';

export default function AdminFinanceList() {
    const [reports, setReports] = useState<FinancialReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // Detailed states
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'Yearly' | 'Event'>('Yearly');
    const [date, setDate] = useState('');
    const [reportUrl, setReportUrl] = useState<string | null>(null);
    const [currentId, setCurrentId] = useState<string | null>(null);
    
    const [incomeDetails, setIncomeDetails] = useState<FinanceDetail[]>([]);
    const [expenseDetails, setExpenseDetails] = useState<FinanceDetail[]>([]);
    
    // Simple states for Yearly reports
    const [simpleIncome, setSimpleIncome] = useState<number>(0);
    const [simpleExpenses, setSimpleExpenses] = useState<number>(0);
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Derived totals
    const totalIncome = type === 'Yearly' 
        ? simpleIncome 
        : incomeDetails.reduce((sum, item) => sum + (item.amount || 0), 0);
        
    const totalExpenses = type === 'Yearly'
        ? simpleExpenses
        : expenseDetails.reduce((sum, item) => sum + (item.amount || 0), 0);
        
    const balance = totalIncome - totalExpenses;

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('financial_reports')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching reports:', error);
            alert('Error fetching reports');
        } else {
            setReports(data || []);
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            let final_report_url = reportUrl;

            // Upload new file if selected
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `report_${Date.now()}.${fileExt}`;
                const filePath = `reports/${fileName}`;

                const { url, error: uploadError } = await uploadFile('foss-images', filePath, selectedFile);
                
                if (uploadError) throw uploadError;
                final_report_url = url;
            }

            const reportData = {
                title,
                type,
                income: totalIncome,
                expenses: totalExpenses,
                balance: balance,
                income_details: type === 'Event' ? incomeDetails : [],
                expense_details: type === 'Event' ? expenseDetails : [],
                date,
                report_url: final_report_url,
                updated_at: new Date().toISOString()
            };

            if (currentId) {
                // Update
                const { error } = await supabase
                    .from('financial_reports')
                    .update(reportData)
                    .eq('id', currentId);

                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('financial_reports')
                    .insert([{ ...reportData, created_at: new Date().toISOString() }]);

                if (error) throw error;
            }

            alert('Report saved successfully!');
            setIsEditing(false);
            resetForm();
            fetchReports();
        } catch (error: any) {
            console.error('Error saving report:', error);
            const errorMessage = error?.message || error?.details || JSON.stringify(error, null, 2);
            alert(`Error saving report: ${errorMessage}\n\nDid you run the SQL ALTER TABLE command?`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, reportUrl?: string | null) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;

        try {
            // If it has a file, try to delete it
            if (reportUrl && reportUrl.includes('supabase.co')) {
                const pathParts = reportUrl.split('/');
                const fileName = pathParts[pathParts.length - 1];
                await deleteFile('foss-images', `reports/${fileName}`);
            }

            const { error } = await supabase
                .from('financial_reports')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('Report deleted successfully');
            fetchReports();
        } catch (error: any) {
            console.error('Error deleting report:', error);
            alert('Error deleting report');
        }
    };

    const resetForm = () => {
        setTitle('');
        setType('Yearly');
        setDate('');
        setReportUrl(null);
        setCurrentId(null);
        setIncomeDetails([{ item: '', amount: 0 }]);
        setExpenseDetails([{ item: '', amount: 0 }]);
        setSimpleIncome(0);
        setSimpleExpenses(0);
        setSelectedFile(null);
    };

    const editReport = (report: FinancialReport) => {
        setTitle(report.title);
        setType(report.type);
        setDate(report.date);
        setReportUrl(report.report_url || null);
        setCurrentId(report.id || null);
        
        if (report.type === 'Yearly') {
            setSimpleIncome(report.income);
            setSimpleExpenses(report.expenses);
            setIncomeDetails([{ item: '', amount: 0 }]);
            setExpenseDetails([{ item: '', amount: 0 }]);
        } else {
            setSimpleIncome(0);
            setSimpleExpenses(0);
            if (report.income_details && report.income_details.length > 0) {
                setIncomeDetails(report.income_details);
            } else {
                setIncomeDetails(report.income > 0 ? [{ item: 'General Income', amount: report.income }] : [{ item: '', amount: 0 }]);
            }
            
            if (report.expense_details && report.expense_details.length > 0) {
                setExpenseDetails(report.expense_details);
            } else {
                setExpenseDetails(report.expenses > 0 ? [{ item: 'General Expense', amount: report.expenses }] : [{ item: '', amount: 0 }]);
            }
        }

        setIsEditing(true);
        setSelectedFile(null);
    };

    const updateDetail = (isIncome: boolean, index: number, field: 'item' | 'amount', value: string | number) => {
        if (isIncome) {
            const newDetails = [...incomeDetails];
            newDetails[index] = { ...newDetails[index], [field]: value };
            setIncomeDetails(newDetails);
        } else {
            const newDetails = [...expenseDetails];
            newDetails[index] = { ...newDetails[index], [field]: value };
            setExpenseDetails(newDetails);
        }
    };

    const addDetailRow = (isIncome: boolean) => {
        if (isIncome) {
            setIncomeDetails([...incomeDetails, { item: '', amount: 0 }]);
        } else {
            setExpenseDetails([...expenseDetails, { item: '', amount: 0 }]);
        }
    };

    const removeDetailRow = (isIncome: boolean, index: number) => {
        if (isIncome) {
            setIncomeDetails(incomeDetails.filter((_, i) => i !== index));
        } else {
            setExpenseDetails(expenseDetails.filter((_, i) => i !== index));
        }
    };

    if (loading) return <div className="text-white">Loading reports...</div>;

    if (isEditing) {
        return (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">
                        {currentId ? 'Edit Report' : 'Add New Report'}
                    </h3>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. 2024 Financial Report"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                            <select
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"
                                value={type}
                                onChange={e => setType(e.target.value as 'Yearly' | 'Event')}
                            >
                                <option value="Yearly">Yearly</option>
                                <option value="Event">Event</option>
                            </select>
                        </div>
                        
                        {type === 'Yearly' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Total Income (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"
                                        value={simpleIncome}
                                        onChange={e => setSimpleIncome(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Total Expenses (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"
                                        value={simpleExpenses}
                                        onChange={e => setSimpleExpenses(Number(e.target.value))}
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                            <input
                                required
                                type="date"
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                        
                        <div className={type === 'Event' ? "" : "md:col-span-2"}>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Supporting Document (PDF/Image) - Optional</label>
                            {reportUrl && !selectedFile && (
                                <div className="mb-2 p-2 bg-gray-800 rounded flex justify-between items-center">
                                    <a href={reportUrl} target="_blank" rel="noreferrer" className="text-primary text-sm flex items-center gap-1 hover:underline">
                                        <FileText className="w-4 h-4" /> View Current Document
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setReportUrl(null)}
                                        className="text-red-500 text-sm hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer flex items-center gap-2 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    {selectedFile ? 'Change File' : 'Upload File'}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                if (e.target.files[0].size > 5 * 1024 * 1024) {
                                                    alert("File size must be less than 5MB");
                                                    return;
                                                }
                                                setSelectedFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </label>
                                {selectedFile && <span className="text-sm text-gray-300">{selectedFile.name}</span>}
                            </div>
                        </div>
                    </div>

                    {type === 'Event' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-gray-800">
                            {/* Income Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-bold text-green-500">Income Details</h4>
                                    <span className="font-mono text-green-400 font-bold">Total: ₹{totalIncome}</span>
                                </div>
                                
                                {incomeDetails.map((detail, index) => (
                                    <div key={`inc-${index}`} className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Item Name (e.g., Sponsorship)"
                                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-green-500 focus:outline-none text-sm"
                                                value={detail.item}
                                                onChange={(e) => updateDetail(true, index, 'item', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                placeholder="Amount"
                                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-green-500 focus:outline-none text-sm"
                                                value={detail.amount || ''}
                                                onChange={(e) => updateDetail(true, index, 'amount', Number(e.target.value))}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeDetailRow(true, index)}
                                            disabled={incomeDetails.length === 1}
                                            className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                
                                <button
                                    type="button"
                                    onClick={() => addDetailRow(true)}
                                    className="flex items-center gap-1 text-sm text-green-500 hover:text-green-400 font-bold px-2 py-1"
                                >
                                    <Plus className="w-4 h-4" /> Add Income Row
                                </button>
                            </div>

                            {/* Expense Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-bold text-red-500">Expense Details</h4>
                                    <span className="font-mono text-red-400 font-bold">Total: ₹{totalExpenses}</span>
                                </div>
                                
                                {expenseDetails.map((detail, index) => (
                                    <div key={`exp-${index}`} className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Item Name (e.g., Catering)"
                                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-red-500 focus:outline-none text-sm"
                                                value={detail.item}
                                                onChange={(e) => updateDetail(false, index, 'item', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                placeholder="Amount"
                                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-red-500 focus:outline-none text-sm"
                                                value={detail.amount || ''}
                                                onChange={(e) => updateDetail(false, index, 'amount', Number(e.target.value))}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeDetailRow(false, index)}
                                            disabled={expenseDetails.length === 1}
                                            className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                
                                <button
                                    type="button"
                                    onClick={() => addDetailRow(false)}
                                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-400 font-bold px-2 py-1"
                                >
                                    <Plus className="w-4 h-4" /> Add Expense Row
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                        <span className="text-gray-300 font-bold">Final Balance Calculation:</span>
                        <span className={`text-xl font-bold font-mono ${balance >= 0 ? 'text-primary' : 'text-red-500'}`}>
                            {balance >= 0 ? '+' : '-'}₹{Math.abs(balance).toLocaleString()}
                        </span>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-primary text-black px-6 py-2 rounded font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Report'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Financial Reports</h3>
                <button
                    onClick={() => {
                        resetForm();
                        setIsEditing(true);
                    }}
                    className="bg-primary text-black px-4 py-2 rounded font-bold hover:bg-primary/90 transition-colors"
                >
                    Add Report
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-800/50 text-gray-300 uppercase">
                        <tr>
                            <th className="px-6 py-3 rounded-tl-lg">Title</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Income</th>
                            <th className="px-6 py-3">Expenses</th>
                            <th className="px-6 py-3">Balance</th>
                            <th className="px-6 py-3">Doc</th>
                            <th className="px-6 py-3 rounded-tr-lg text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report) => (
                            <tr key={report.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                                <td className="px-6 py-4 font-medium text-white">{report.title}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${report.type === 'Yearly' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {report.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-green-400">₹{report.income.toLocaleString()}</td>
                                <td className="px-6 py-4 text-red-400">₹{report.expenses.toLocaleString()}</td>
                                <td className="px-6 py-4 text-blue-400 font-bold">₹{report.balance.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    {report.report_url ? (
                                        <a href={report.report_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary">
                                            <LinkIcon className="w-4 h-4" />
                                        </a>
                                    ) : (
                                        <span className="text-gray-600">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => editReport(report)}
                                        className="text-primary hover:text-primary/80 mr-3"
                                    >
                                        <Edit2 className="w-4 h-4 inline" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(report.id!, report.report_url)}
                                        className="text-red-500 hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4 inline" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {reports.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No financial reports found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
