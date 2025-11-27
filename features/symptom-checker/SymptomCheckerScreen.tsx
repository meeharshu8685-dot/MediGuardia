import React, { useState, useCallback } from 'react';
import { analyzeSymptoms } from '../../services/geminiService';
import { addHealthLog } from '../history/historyService';
import { SymptomAnalysisResult } from '../../types';
import { BackArrowIcon, StethoscopeIcon, CheckCircleIcon } from '../../constants';

type Mode = 'select' | 'quick' | 'type';

interface SymptomQuestion {
    id: string;
    question: string;
    type: 'single' | 'multiple';
    options: { value: string; label: string; severity?: number }[];
    category: string;
}

const symptomQuestions: SymptomQuestion[] = [
    {
        id: 'primary',
        question: 'What is your primary symptom?',
        type: 'single',
        category: 'primary',
        options: [
            { value: 'headache', label: 'Headache', severity: 2 },
            { value: 'fever', label: 'Fever', severity: 3 },
            { value: 'cough', label: 'Cough', severity: 2 },
            { value: 'nausea', label: 'Nausea/Vomiting', severity: 2 },
            { value: 'pain', label: 'Pain (anywhere)', severity: 3 },
            { value: 'breathing', label: 'Difficulty Breathing', severity: 4 },
            { value: 'rash', label: 'Skin Rash', severity: 2 },
            { value: 'fatigue', label: 'Fatigue/Weakness', severity: 2 },
            { value: 'other', label: 'Other', severity: 1 },
        ],
    },
    {
        id: 'duration',
        question: 'How long have you been experiencing this?',
        type: 'single',
        category: 'duration',
        options: [
            { value: 'hours', label: 'Less than 24 hours', severity: 2 },
            { value: 'days', label: '1-3 days', severity: 2 },
            { value: 'week', label: '4-7 days', severity: 3 },
            { value: 'weeks', label: 'More than a week', severity: 3 },
        ],
    },
    {
        id: 'severity',
        question: 'How severe is your symptom?',
        type: 'single',
        category: 'severity',
        options: [
            { value: 'mild', label: 'Mild - Noticeable but manageable', severity: 1 },
            { value: 'moderate', label: 'Moderate - Interferes with daily activities', severity: 2 },
            { value: 'severe', label: 'Severe - Significantly impacts daily life', severity: 3 },
            { value: 'extreme', label: 'Extreme - Unable to perform normal activities', severity: 4 },
        ],
    },
    {
        id: 'additional',
        question: 'Do you have any additional symptoms? (Select all that apply)',
        type: 'multiple',
        category: 'additional',
        options: [
            { value: 'fever', label: 'Fever', severity: 3 },
            { value: 'chills', label: 'Chills', severity: 2 },
            { value: 'sweating', label: 'Excessive Sweating', severity: 2 },
            { value: 'dizziness', label: 'Dizziness', severity: 2 },
            { value: 'nausea', label: 'Nausea', severity: 2 },
            { value: 'vomiting', label: 'Vomiting', severity: 3 },
            { value: 'diarrhea', label: 'Diarrhea', severity: 2 },
            { value: 'chest_pain', label: 'Chest Pain', severity: 4 },
            { value: 'shortness_breath', label: 'Shortness of Breath', severity: 4 },
            { value: 'rapid_heartbeat', label: 'Rapid Heartbeat', severity: 3 },
            { value: 'none', label: 'None of the above', severity: 0 },
        ],
    },
    {
        id: 'location',
        question: 'Where is the symptom located? (if applicable)',
        type: 'single',
        category: 'location',
        options: [
            { value: 'head', label: 'Head/Neck', severity: 2 },
            { value: 'chest', label: 'Chest', severity: 3 },
            { value: 'abdomen', label: 'Abdomen/Stomach', severity: 3 },
            { value: 'back', label: 'Back', severity: 2 },
            { value: 'limbs', label: 'Arms/Legs', severity: 2 },
            { value: 'all_over', label: 'All Over Body', severity: 3 },
            { value: 'not_applicable', label: 'Not Applicable', severity: 0 },
        ],
    },
    {
        id: 'triggers',
        question: 'What makes it better or worse? (Select all that apply)',
        type: 'multiple',
        category: 'triggers',
        options: [
            { value: 'rest', label: 'Rest helps', severity: 1 },
            { value: 'movement', label: 'Movement makes it worse', severity: 2 },
            { value: 'medication', label: 'Medication helps', severity: 1 },
            { value: 'food', label: 'Food makes it worse', severity: 2 },
            { value: 'time_of_day', label: 'Worse at certain times', severity: 2 },
            { value: 'no_change', label: 'No change', severity: 1 },
        ],
    },
];

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

const ModeSelectionView: React.FC<{ onSelectMode: (mode: 'quick' | 'type') => void; onBack?: () => void }> = ({ onSelectMode, onBack }) => {
    return (
        <div className="p-6 min-h-screen bg-[#f5f5f5]">
            {onBack && (
                <button onClick={onBack} className="mb-6 text-gray-700 bg-white p-3 rounded-full shadow-sm">
                    <BackArrowIcon />
                </button>
            )}
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 bg-[#1a5f3f] rounded-3xl flex items-center justify-center text-white mb-6">
                    <div className="w-14 h-14"><StethoscopeIcon /></div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Symptom Checker</h1>
                <p className="text-gray-600 mt-2 max-w-sm">Choose how you'd like to check your symptoms</p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={() => onSelectMode('quick')}
                    className="w-full bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200 hover:border-[#1a5f3f] transition-all text-left"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Check</h3>
                            <p className="text-gray-600 text-sm mb-3">Answer structured questions for accurate analysis</p>
                            <ul className="text-xs text-gray-500 space-y-1">
                                <li>✓ Structured data for better AI accuracy</li>
                                <li>✓ Decision tree approach</li>
                                <li>✓ More reliable severity calculation</li>
                            </ul>
                        </div>
                        <div className="text-3xl">⚡</div>
                    </div>
                </button>

                <button
                    onClick={() => onSelectMode('type')}
                    className="w-full bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200 hover:border-[#1a5f3f] transition-all text-left"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Type Symptoms</h3>
                            <p className="text-gray-600 text-sm mb-3">Describe your symptoms in your own words</p>
                            <ul className="text-xs text-gray-500 space-y-1">
                                <li>✓ Free-form text input</li>
                                <li>✓ Natural language description</li>
                                <li>✓ Quick and simple</li>
                            </ul>
                        </div>
                        <div className="text-3xl">✍️</div>
                    </div>
                </button>
            </div>
        </div>
    );
};

const QuickCheckView: React.FC<{ 
    onAnalyze: (answers: Record<string, string | string[]>) => void; 
    loading: boolean;
    onBack: () => void;
}> = ({ onAnalyze, loading, onBack }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const currentQuestion = symptomQuestions[currentQuestionIndex];

    const handleAnswer = (value: string) => {
        if (currentQuestion.type === 'single') {
            setAnswers({ ...answers, [currentQuestion.id]: value });
        } else {
            const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
            if (value === 'none') {
                setAnswers({ ...answers, [currentQuestion.id]: ['none'] });
            } else {
                const newAnswers = currentAnswers.includes('none') 
                    ? [value]
                    : currentAnswers.includes(value)
                    ? currentAnswers.filter(a => a !== value)
                    : [...currentAnswers, value];
                setAnswers({ ...answers, [currentQuestion.id]: newAnswers.length > 0 ? newAnswers : ['none'] });
            }
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < symptomQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // All questions answered, analyze
            onAnalyze(answers);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const isAnswered = () => {
        const answer = answers[currentQuestion.id];
        if (!answer) return false;
        if (Array.isArray(answer)) {
            return answer.length > 0 && !answer.includes('none') || answer.length === 1 && answer[0] === 'none';
        }
        return true;
    };

    const getSelectedValues = (): string[] => {
        const answer = answers[currentQuestion.id];
        if (!answer) return [];
        return Array.isArray(answer) ? answer : [answer];
    };

    return (
        <div className="p-6 min-h-screen bg-[#f5f5f5]">
            <div className="mb-6">
                <button onClick={onBack} className="text-gray-700 bg-white p-3 rounded-full shadow-sm">
                    <BackArrowIcon />
                </button>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {symptomQuestions.length}</span>
                    <span className="text-sm text-gray-600">{Math.round(((currentQuestionIndex + 1) / symptomQuestions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-[#1a5f3f] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / symptomQuestions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentQuestion.question}</h2>
                <div className="space-y-3">
                    {currentQuestion.options.map((option) => {
                        const isSelected = getSelectedValues().includes(option.value);
                        return (
                            <button
                                key={option.value}
                                onClick={() => handleAnswer(option.value)}
                                className={`w-full p-4 rounded-xl text-left transition-all ${
                                    isSelected
                                        ? 'bg-[#1a5f3f] text-white border-2 border-[#1a5f3f]'
                                        : 'bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-[#1a5f3f]/50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{option.label}</span>
                                    {isSelected && (
                                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-4">
                {currentQuestionIndex > 0 && (
                    <button
                        onClick={handlePrevious}
                        className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Previous
                    </button>
                )}
                <button
                    onClick={handleNext}
                    disabled={!isAnswered() || loading}
                    className={`flex-1 py-4 rounded-xl font-semibold transition-colors ${
                        isAnswered() && !loading
                            ? 'bg-[#1a5f3f] text-white hover:opacity-90'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin mx-auto"></div>
                    ) : currentQuestionIndex === symptomQuestions.length - 1 ? (
                        'Analyze Symptoms'
                    ) : (
                        'Next'
                    )}
                </button>
            </div>
        </div>
    );
};

const TypeInputView: React.FC<{ onAnalyze: (symptoms: string) => void; loading: boolean; onBack: () => void }> = ({ onAnalyze, loading, onBack }) => {
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
            <div className="mb-6">
                <button onClick={onBack} className="text-gray-700 bg-white p-3 rounded-full shadow-sm">
                    <BackArrowIcon />
                </button>
            </div>
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 bg-[#1a5f3f] rounded-3xl flex items-center justify-center text-white mb-6">
                    <div className="w-14 h-14"><StethoscopeIcon /></div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Describe Your Symptoms</h1>
                <p className="text-gray-600 mt-2 max-w-sm">Type your symptoms in your own words</p>
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
    const [mode, setMode] = useState<Mode>('select');
    const [result, setResult] = useState<SymptomAnalysisResult | null>(null);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const buildSymptomsText = (answers: Record<string, string | string[]>): string => {
        let text = 'Symptoms:\n\n';
        
        symptomQuestions.forEach((q) => {
            const answer = answers[q.id];
            if (answer) {
                if (Array.isArray(answer)) {
                    const selectedOptions = answer.filter(a => a !== 'none').map(a => {
                        const option = q.options.find(o => o.value === a);
                        return option?.label || a;
                    });
                    if (selectedOptions.length > 0) {
                        text += `${q.question}: ${selectedOptions.join(', ')}\n`;
                    }
                } else {
                    const option = q.options.find(o => o.value === answer);
                    if (option && answer !== 'not_applicable') {
                        text += `${q.question}: ${option.label}\n`;
                    }
                }
            }
        });

        // Calculate severity hint
        let maxSeverity = 0;
        Object.values(answers).forEach(answer => {
            if (Array.isArray(answer)) {
                answer.forEach(a => {
                    const option = symptomQuestions.flatMap(q => q.options).find(o => o.value === a);
                    if (option?.severity) {
                        maxSeverity = Math.max(maxSeverity, option.severity);
                    }
                });
            } else {
                const option = symptomQuestions.flatMap(q => q.options).find(o => o.value === answer);
                if (option?.severity) {
                    maxSeverity = Math.max(maxSeverity, option.severity);
                }
            }
        });

        text += `\nSeverity indicators suggest: ${maxSeverity >= 4 ? 'Emergency' : maxSeverity >= 3 ? 'Severe' : maxSeverity >= 2 ? 'Moderate' : 'Minor'}`;
        
        return text;
    };

    const handleQuickAnalyze = useCallback(async (answers: Record<string, string | string[]>) => {
        setLoading(true);
        setError(null);
        setIsSaved(false);
        try {
            const symptomsText = buildSymptomsText(answers);
            setInputText(symptomsText);
            const analysisResult = await analyzeSymptoms(symptomsText);
            setResult(analysisResult);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleTypeAnalyze = useCallback(async (symptoms: string) => {
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
        setMode('select');
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
                mode === 'select' ? (
                    <ModeSelectionView onSelectMode={(m) => setMode(m)} onBack={onBack} />
                ) : mode === 'quick' ? (
                    <QuickCheckView onAnalyze={handleQuickAnalyze} loading={loading} onBack={() => setMode('select')} />
                ) : (
                    <TypeInputView onAnalyze={handleTypeAnalyze} loading={loading} onBack={() => setMode('select')} />
                )
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
