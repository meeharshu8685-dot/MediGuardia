
import React, { useState, useCallback } from 'react';
import { analyzeSymptoms } from '../services/geminiService';
import { SymptomAnalysisResult, HealthLog } from '../types';
import { BackArrowIcon, StethoscopeIcon, CheckCircleIcon } from '../constants';

const SeverityBadge: React.FC<{ severity: SymptomAnalysisResult['severity'] }> = ({ severity }) => {
    const severityMap = {
        Minor: "bg-accent-green/20 text-accent-green",
        Moderate: "bg-accent-orange/20 text-accent-orange",
        Severe: "bg-accent-red/20 text-accent-red",
        Emergency: "bg-red-500/20 text-red-500 animate-pulse",
    };
    return (
        <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${severityMap[severity]}`}>
            {severity}
        </span>
    );
};

const SymptomInputView: React.FC<{ onAnalyze: (symptoms: string) => void; loading: boolean }> = ({ onAnalyze, loading }) => {
    const [symptoms, setSymptoms] = useState('');

    const handleSubmit = () => {
        if (symptoms.trim().length > 10) {
            onAnalyze(symptoms);
        } else {
            alert("Please describe your symptoms in more detail (at least 10 characters).");
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 bg-primary-light rounded-3xl flex items-center justify-center text-primary mb-6">
                    <div className="w-14 h-14"><StethoscopeIcon /></div>
                </div>
                <h1 className="text-3xl font-bold text-neutral-900">Symptom Checker</h1>
                <p className="text-neutral-500 mt-2 max-w-sm">Describe your symptoms to get an AI-powered analysis.</p>
            </div>
            
            <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full h-48 p-4 bg-white rounded-2xl border-2 border-transparent focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition text-lg shadow-sm"
                placeholder="e.g., I have a throbbing headache, slight fever, and a runny nose..."
            />
            
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 bg-primary text-white py-4 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity disabled:bg-neutral-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                ) : (
                    "Analyze Symptoms"
                )}
            </button>
        </div>
    );
};

const SymptomResultView: React.FC<{ 
    result: SymptomAnalysisResult; 
    onReset: () => void;
    onSaveLog: (log: Omit<HealthLog, 'id' | 'date'>) => void; 
}> = ({ result, onReset, onSaveLog }) => {
    const [isSaved, setIsSaved] = useState(false);
    const topCondition = result.predictedConditions[0];
    const otherConditions = result.predictedConditions.slice(1);

    const handleSave = () => {
        if (isSaved) return;
        onSaveLog({
            symptom: topCondition?.name || "AI Analysis",
            severity: result.severity === 'Emergency' ? 'Severe' : result.severity,
            details: `Analyzed symptoms resulting in potential condition: ${topCondition?.name || 'N/A'}. Recommendations: ${result.recommendations.join(', ')}`,
        });
        setIsSaved(true);
    };

    return (
        <div className="p-6">
             <div className="relative flex items-center justify-between mb-6">
                <button onClick={onReset} className="text-neutral-700 bg-white p-3 rounded-full shadow-sm">
                    <BackArrowIcon />
                </button>
                <h1 className="text-2xl font-bold text-neutral-900">Analysis Result</h1>
                <div className="w-12"></div>
            </div>
            
            <div className="space-y-6">
                {/* Main Condition Card */}
                <div className="bg-white rounded-3xl shadow-sm p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <SeverityBadge severity={result.severity} />
                    </div>
                    <h2 className="text-3xl font-bold text-neutral-900">{topCondition?.name || "Analysis Complete"}</h2>
                    {topCondition && <p className="text-neutral-500 font-semibold mt-1">Likelihood: {topCondition.likelihood}</p>}
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-3xl shadow-sm p-6">
                    <h3 className="text-xl font-bold text-neutral-800 mb-4">Recommended Actions</h3>
                    <ul className="space-y-3">
                        {result.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start p-4 bg-neutral-100 rounded-xl">
                                <div className="w-6 h-6 text-accent-green mr-3 mt-0.5 flex-shrink-0"><CheckCircleIcon /></div>
                                <span className="text-neutral-800">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Other Conditions */}
                {otherConditions.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm p-6">
                        <h3 className="text-xl font-bold text-neutral-800 mb-4">Other Possible Conditions</h3>
                        <ul className="space-y-2">
                            {otherConditions.map((cond, index) => (
                                <li key={index} className="flex justify-between p-4 bg-neutral-100 rounded-xl">
                                    <span className="font-medium text-neutral-800">{cond.name}</span>
                                    <span className="text-neutral-500 font-medium">{cond.likelihood}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Disclaimer */}
                <div className="pt-4 text-center text-sm text-neutral-500 bg-neutral-200/50 p-4 rounded-xl">
                    <p className="font-bold text-neutral-600">Disclaimer</p>
                    <p>{result.disclaimer}</p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <button className="w-full bg-primary-light text-primary py-3 rounded-xl text-md font-semibold">View First Aid</button>
                <button 
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`w-full py-3 rounded-xl text-md font-semibold transition-colors flex items-center justify-center space-x-2 ${
                        isSaved 
                        ? 'bg-accent-green/20 text-accent-green' 
                        : 'bg-primary-light text-primary'
                    }`}
                >
                    {isSaved && <div className="w-5 h-5"><CheckCircleIcon /></div>}
                    <span>{isSaved ? 'Saved' : 'Save to History'}</span>
                </button>
            </div>
        </div>
    );
};

interface SymptomCheckerScreenProps {
    navigate: (view: string) => void;
    onSaveLog: (log: Omit<HealthLog, 'id' | 'date'>) => void;
}

export const SymptomCheckerScreen: React.FC<SymptomCheckerScreenProps> = ({ navigate, onSaveLog }) => {
    const [result, setResult] = useState<SymptomAnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async (symptoms: string) => {
        setLoading(true);
        setError(null);
        try {
            const analysisResult = await analyzeSymptoms(symptoms);
            setResult(analysisResult);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleReset = () => {
        setResult(null);
        setError(null);
    };

    if (error) {
        return (
            <div className="p-6 text-center">
                 <h1 className="text-2xl font-bold text-red-600 mb-4">Analysis Failed</h1>
                 <p className="text-neutral-700 mb-6">{error}</p>
                 <button onClick={handleReset} className="px-6 py-2 bg-primary text-white rounded-lg">Try Again</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-100 pt-10">
            {!result ? (
                <SymptomInputView onAnalyze={handleAnalyze} loading={loading} />
            ) : (
                <SymptomResultView result={result} onReset={handleReset} onSaveLog={onSaveLog} />
            )}
        </div>
    );
};
