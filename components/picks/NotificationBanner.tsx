"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { usePicksAuth } from './PicksAuthProvider';

interface Notification {
    id: string;
    message: string;
    post_title: string | null;
    created_at: string;
}

export function NotificationBanner() {
    const { session } = usePicksAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.access_token) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/picks/notifications', {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                }
            } catch (err) {
                console.error('Failed to fetch notifications', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [session]);

    const dismissNotification = async (id: string) => {
        // Optimistic UI update
        setNotifications(prev => prev.filter(n => n.id !== id));

        try {
            await fetch('/api/picks/notifications', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ notification_id: id })
            });
        } catch (err) {
            console.error('Failed to dismiss notification', err);
        }
    };

    if (loading || notifications.length === 0) return null;

    return (
        <div className="w-full space-y-3 mb-6">
            <AnimatePresence>
                {notifications.map(notif => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4 items-start relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                        <div className="bg-red-500/20 p-2 rounded-full text-red-400 shrink-0 mt-0.5">
                            <AlertTriangle size={18} />
                        </div>
                        <div className="flex-1 pr-8">
                            <h4 className="text-red-300 font-semibold text-sm mb-1">Notice of Post Removal</h4>
                            <p className="text-gray-300 text-sm leading-relaxed mb-2">
                                {notif.message}
                            </p>
                            {notif.post_title && (
                                <div className="bg-black/20 rounded px-3 py-2 text-xs font-medium text-gray-400 font-mono inline-block">
                                    "{notif.post_title}"
                                </div>
                            )}
                            <div className="text-[10px] text-gray-500 mt-2 uppercase tracking-wide">
                                {new Date(notif.created_at).toLocaleString()}
                            </div>
                        </div>
                        <button
                            onClick={() => dismissNotification(notif.id)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-1.5"
                            title="Dismiss"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
