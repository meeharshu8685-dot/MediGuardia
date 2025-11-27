import React, { useState, useCallback } from 'react';
import { analyzeSymptoms } from '../../services/geminiService';
import { addHealthLog } from '../history/historyService';
import { SymptomAnalysisResult } from '../../types';
import { BackArrowIcon, StethoscopeIcon, CheckCircleIcon } from '../../constants';

const SeverityBadge: React.FC<{ severity: SymptomAnalysisResult['severity'] }> = ({ severity }) => {
    const severityMap = {
        Minor: "bg-green-100 text-green-700",
        Moderate: "bg-yellow-100 text-yellow-700",
        Severe: "bg-orange-100 text-orange-700",
        Emergency: "bg-red-100 text-red-700 animate-pulse",
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
        <div className="p-6 min-h-screen bg-[#f5f5f5]">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 bg-[#1a5f3f] rounded-3xl flex items-center justify-center text-white mb-6">
                    <div className="w-14 h-14"><StethoscopeIcon /></div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Symptom Checker</h1>
                <p className="text-gray-600 mt-2 max-w-sm">Describe your symptoms to get an AI-powered analysis.</p>
            </div>
            
            <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full h-48 p-4 bg-white rounded-2xl border-2 border-gray-200 focus:border-[#1a5f3f] focus:ring-2 focus:ring-[#1a5f3f]/20 outline-none transition text-lg shadow-sm"
                placeholder="e.g., I have a throbbing headache, slight fever, and a runny nose..."
            />
            
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 bg-[#1a5f3f] text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
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
    inputText: string;
    onReset: () => void;
    onSaveToHistory: () => void;
    isSaving: boolean;
    isSaved: boolean;
}> = ({ result, inputText, onReset, onSaveToHistory, isSaving, isSaved }) => {
    const topCondition = result.predictedConditions[0];
    const otherConditions = result.predictedConditions.slice(1);

    return (
        <div className="p-6 min-h-screen bg-[#f5f5f5]">
            <div className="relative flex items-center justify-between mb-6">
                <button onClick={onReset} className="text-gray-700 bg-white p-3 rounded-full shadow-sm">
                    <BackArrowIcon />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Analysis Result</h1>
                <div className="w-12"></div>
            </div>
            
            <div className="space-y-6">
                {/* Main Condition Card */}
                <div className="bg-white rounded-3xl shadow-sm p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <SeverityBadge severity={result.severity} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">{topCondition?.name || "Analysis Complete"}</h2>
                    {topCondition && <p className="text-gray-600 font-semibold mt-1">Likelihood: {topCondition.likelihood}</p>}
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-3xl shadow-sm p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Recommended Actions</h3>
                    <ul className="space-y-3">
                        {result.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start p-4 bg-gray-50 rounded-xl">
                                <div className="w-6 h-6 text-[#1a5f3f] mr-3 mt-0.5 flex-shrink-0"><CheckCircleIcon /></div>
                                <span className="text-gray-800">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Other Conditions */}
                {otherConditions.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Other Possible Conditions</h3>
                        <ul className="space-y-2">
                            {otherConditions.map((cond, index) => (
                                <li key={index} className="flex justify-between p-4 bg-gray-50 rounded-xl">
                                    <span className="font-medium text-gray-800">{cond.name}</span>
                                    <span className="text-gray-600 font-medium">{cond.likelihood}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Disclaimer */}
                <div className="pt-4 text-center text-sm text-gray-600 bg-gray-100 p-4 rounded-xl">
                    <p className="font-bold text-gray-700 mb-2">⚠️ Medical Disclaimer</p>
                    <p>{result.disclaimer}</p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <button 
                    onClick={() => {
                        // Navigate to first aid based on the condition
                        const condition = topCondition?.name.toLowerCase() || '';
                        if (condition.includes('breathing') || condition.includes('choking')) {
                            window.location.href = '#firstaid';
                        } else {
                            alert('First Aid guide for this condition is available in the First Aid section.');
                        }
                    }}
                    className="w-full bg-gray-100 text-[#1a5f3f] py-3 rounded-xl text-md font-semibold hover:bg-gray-200 transition-colors"
                >
                    View First Aid
                </button>
                <button 
                    onClick={onSaveToHistory}
                    disabled={isSaving || isSaved}
                    className={`w-full py-3 rounded-xl text-md font-semibold transition-colors flex items-center justify-center space-x-2 ${
                        isSaved 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-[#1a5f3f] text-white hover:opacity-90'
                    }`}
                >
                    {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    ) : isSaved ? (
                        <>
                            <div className="w-5 h-5"><CheckCircleIcon /></div>
                            <span>Saved</span>
                        </>
                    ) : (
                        <span>Save to History</span>
                    )}
                </button>
            </div>
        </div>
    );
};

interface SymptomCheckerScreenProps {
    onBack?: () => void;
}

export const SymptomCheckerScreen: React.FC<SymptomCheckerScreenProps> = ({ onBack }) => {
    const [result, setResult] = useState<SymptomAnalysisResult | null>(null);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async (symptoms: string) => {
        setLoading(true);
        setError(null);
        setInputText(symptoms);
        setIsSaved(false);
        try {
            const analysisResult = await analyzeSymptoms(symptoms);
            setResult(analysisResult);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSaveToHistory = useCallback(async () => {
        if (!result || isSaved) return;
        
        setIsSaving(true);
        try {
            const topCondition = result.predictedConditions[0];
            await addHealthLog({
                symptom: topCondition?.name || "AI Analysis",
                severity: result.severity === 'Emergency' ? 'Severe' : result.severity,
                details: `Input: ${inputText}\n\nConditions: ${result.predictedConditions.map(c => c.name).join(', ')}\n\nRecommendations: ${result.recommendations.join(', ')}`,
                inputText: inputText,
                conditions: result.predictedConditions.map(c => c.name),
                riskLevel: result.severity,
            });
            setIsSaved(true);
        } catch (error) {
            console.error('Error saving to history:', error);
            alert('Failed to save to history. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [result, inputText, isSaved]);

    const handleReset = () => {
        setResult(null);
        setError(null);
        setInputText('');
        setIsSaved(false);
    };

    if (error) {
        return (
            <div className="p-6 text-center min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Analysis Failed</h1>
                <p className="text-gray-700 mb-6">{error}</p>
                <button onClick={handleReset} className="px-6 py-2 bg-[#1a5f3f] text-white rounded-lg">Try Again</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f5f5]">
            {!result ? (
                <SymptomInputView onAnalyze={handleAnalyze} loading={loading} />
            ) : (
                <SymptomResultView 
                    result={result} 
                    inputText={inputText}
                    onReset={handleReset} 
                    onSaveToHistory={handleSaveToHistory}
                    isSaving={isSaving}
                    isSaved={isSaved}
                />
            )}
        </div>
    );
};

