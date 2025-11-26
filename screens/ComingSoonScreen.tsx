
import React from 'react';
import { RocketIcon, BackArrowIcon } from '../constants';

interface ComingSoonScreenProps {
    onBack: () => void;
    featureName: string;
}

export const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({ onBack, featureName }) => {
    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-6 pt-10 text-center">
            <div className="absolute top-6 left-6">
                <button onClick={onBack} className="text-neutral-700 bg-white p-3 rounded-full shadow-sm">
                    <BackArrowIcon />
                </button>
            </div>
            
            <div className="w-28 h-28 bg-primary-light rounded-3xl flex items-center justify-center text-primary mb-8">
                <div className="w-16 h-16"><RocketIcon /></div>
            </div>
            
            <h1 className="text-4xl font-bold text-neutral-900">Coming Soon!</h1>
            <p className="text-neutral-500 mt-4 max-w-sm text-lg">
                The "{featureName}" feature is under construction. We're working hard to bring it to you soon.
            </p>
            
            <button
                onClick={onBack}
                className="w-full max-w-xs mt-12 bg-primary text-white py-4 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity"
            >
                Go Back
            </button>
        </div>
    );
};
