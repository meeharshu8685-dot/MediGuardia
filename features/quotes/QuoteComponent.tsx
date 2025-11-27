import React, { useState, useEffect } from 'react';
import { getRandomQuote } from './quoteService';
import { Quote } from '../../types';

interface QuoteComponentProps {
    className?: string;
}

export const QuoteComponent: React.FC<QuoteComponentProps> = ({ className = '' }) => {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    const loadQuote = async () => {
        setLoading(true);
        try {
            const randomQuote = await getRandomQuote();
            setQuote(randomQuote);
        } catch (error) {
            console.error('Error loading quote:', error);
            setQuote({
                id: 'default',
                text: 'Your health is an investment, not an expense.',
                author: 'Unknown',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load a new quote every time the component mounts (when app opens)
        loadQuote();
    }, []);

    if (loading) {
        return (
            <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-br from-[#1a5f3f] to-[#0d4a2e] rounded-2xl p-6 text-white shadow-lg ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-lg font-medium italic mb-2">"{quote?.text}"</p>
                    {quote?.author && (
                        <p className="text-sm text-white/80">— {quote.author}</p>
                    )}
                </div>
                <button
                    onClick={loadQuote}
                    className="ml-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    title="Refresh quote"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

