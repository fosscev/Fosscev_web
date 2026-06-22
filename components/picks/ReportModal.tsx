import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, X, AlertCircle } from 'lucide-react';
import { usePicksAuth } from './PicksAuthProvider';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
}

export function ReportModal({ isOpen, onClose, postId }: ReportModalProps) {
    const { session } = usePicksAuth();
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const token = session?.access_token;
            if (!token) {
                setError('You must be signed in to report.');
                setIsSubmitting(false);
                return;
            }

            const res = await fetch(`/api/picks/posts/${postId}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason: reason.trim(), auth_id: session.user.id })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    setReason('');
                    onClose();
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to submit report');
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-red-400">
                            <Flag size={20} />
                            <h2 className="text-xl font-display font-bold text-white">Report Pick</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-8 flex flex-col items-center text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Report Submitted</h3>
                            <p className="text-sm text-gray-400">Thank you for keeping our community safe. Our moderators will review this shortly.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-3 text-sm text-red-200">
                                <AlertCircle className="shrink-0 text-red-400" size={18} />
                                <p>Use this form to report inappropriate content, spam, or broken links. This will be reviewed by administrators.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Why are you reporting this PICK? *
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please provide specific details..."
                                    className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent resize-none transition-all"
                                    required
                                    maxLength={1000}
                                />
                                <div className="mt-1 text-right text-xs text-gray-500">
                                    {reason.length}/1000
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-400 font-medium">{error}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-300 bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!reason.trim() || isSubmitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
