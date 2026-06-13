"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { usePicksAuth } from './PicksAuthProvider';

interface VoteButtonsProps {
    postId: string;
    score: number;
    userVote: number | null;
    onAuthRequired: () => void;
    onVoteChange: (newScore: number, newVote: number | null) => void;
}

export function VoteButtons({ postId, score, userVote, onAuthRequired, onVoteChange }: VoteButtonsProps) {
    const { authId } = usePicksAuth();
    const [loading, setLoading] = useState(false);

    const handleVote = async (value: 1 | -1) => {
        if (!authId) {
            onAuthRequired();
            return;
        }
        if (loading) return;

        // Optimistic update
        let optimisticScore = score;
        let optimisticVote: number | null = value;

        if (userVote === value) {
            // Toggle off
            optimisticScore -= value;
            optimisticVote = null;
        } else if (userVote) {
            // Switch direction
            optimisticScore += value * 2;
            optimisticVote = value;
        } else {
            // New vote
            optimisticScore += value;
            optimisticVote = value;
        }

        onVoteChange(optimisticScore, optimisticVote);
        setLoading(true);

        try {
            const res = await fetch(`/api/picks/posts/${postId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auth_id: authId, value }),
            });

            if (res.ok) {
                const data = await res.json();
                onVoteChange(data.score, data.userVote);
            } else {
                // Revert on error
                onVoteChange(score, userVote);
            }
        } catch {
            onVoteChange(score, userVote);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-0.5 select-none">
            <motion.button
                whileTap={{ scale: 1.3 }}
                onClick={() => handleVote(1)}
                className="p-1 rounded transition-colors duration-150 hover:bg-white/5"
                aria-label="Upvote"
                disabled={loading}
            >
                <ChevronUp
                    size={22}
                    strokeWidth={2.5}
                    className="transition-colors duration-150"
                    style={{ color: userVote === 1 ? '#D85A30' : '#525252' }}
                />
            </motion.button>

            <motion.span
                key={score}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-sm font-bold font-mono tabular-nums min-w-[2ch] text-center"
                style={{ color: score > 0 ? '#D85A30' : score < 0 ? '#6366f1' : '#a3a3a3' }}
            >
                {score}
            </motion.span>

            <motion.button
                whileTap={{ scale: 1.3 }}
                onClick={() => handleVote(-1)}
                className="p-1 rounded transition-colors duration-150 hover:bg-white/5"
                aria-label="Downvote"
                disabled={loading}
            >
                <ChevronDown
                    size={22}
                    strokeWidth={2.5}
                    className="transition-colors duration-150"
                    style={{ color: userVote === -1 ? '#6366f1' : '#525252' }}
                />
            </motion.button>
        </div>
    );
}
