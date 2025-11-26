
import React, { useState, useMemo } from 'react';
import { HealthLog, Medication } from '../types';
import { BackArrowIcon, PillIcon } from '../constants';

declare global {
    interface Window {
        Recharts: any;
    }
}

const analyticsData = {
    symptomFrequency: [
        { name: 'Headache', count: 5 }, { name: 'Cough', count: 8 },
        { name: 'Fever', count: 2 }, { name: 'Allergy', count: 12 },
    ],
    severityTrends: [
        { name: 'Mon', hours: 4 }, { name: 'Tue', hours: 3 }, { name: 'Wed', hours: 5 },
        { name: 'Thu', hours: 4.5 }, { name: 'Fri', hours: 6 }, { name: 'Sat', hours: 8 },
        { name: 'Sun', hours: 2 },
    ]
};

const AddMedicationModal: React.FC<{
    onClose: () => void;
    onAdd: (med: Omit<Medication, 'id'>) => void;
}> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('');
    const [time, setTime] = useState('Morning');

    const handleSubmit = () => {
        if (name && dosage && frequency) {
            onAdd({ name, dosage, frequency, time });
            onClose();
        } else {
            alert('Please fill all fields.');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-center text-neutral-800">Add Medication</h2>
                <div className="space-y-4">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Medication Name" className="w-full p-3 border-2 rounded-xl bg-neutral-100 border-neutral-200 focus:border-primary outline-none" />
                    <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="Dosage (e.g., 1 tablet)" className="w-full p-3 border-2 rounded-xl bg-neutral-100 border-neutral-200 focus:border-primary outline-none" />
                    <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="Frequency (e.g., Daily)" className="w-full p-3 border-2 rounded-xl bg-neutral-100 border-neutral-200 focus:border-primary outline-none" />
                    <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-3 border-2 rounded-xl bg-neutral-100 border-neutral-200 focus:border-primary outline-none">
                        <option>Morning</option>
                        <option>Afternoon</option>
                        <option>Evening</option>
                        <option>Bedtime</option>
                        <option>As needed</option>
                    </select>
                </div>
                <div className="flex items-center justify-end mt-8 space-x-3">
                    <button onClick={onClose} className="py-3 px-6 bg-neutral-200 text-neutral-700 font-semibold rounded-xl">Cancel</button>
                    <button onClick={handleSubmit} className="py-3 px-6 bg-primary text-white font-semibold rounded-xl">Save</button>
                </div>
            </div>
        </div>
    );
};


const Header: React.FC<{ title: string; onBack?: () => void }> = ({ title, onBack }) => (
    <div className="relative flex items-center justify-center pt-12 pb-6 px-6 bg-neutral-100">
        {onBack && <button onClick={onBack} className="absolute left-6 text-neutral-700 bg-white p-3 rounded-full shadow-sm"><BackArrowIcon /></button>}
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
    </div>
);

const PositiveThoughtCard = () => {
    const thoughts = [
        "Believe you can and you're halfway there.",
        "The secret of getting ahead is getting started.",
        "Your health is an investment, not an expense.",
        "A little progress each day adds up to big results.",
        "The greatest wealth is health."
    ];

    const thought = useMemo(() => thoughts[Math.floor(Math.random() * thoughts.length)], []);

    return (
        <div className="p-6 mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl text-center">
             <span className="text-3xl">✨</span>
            <p className="text-lg font-medium text-neutral-700 mt-2 italic">"{thought}"</p>
        </div>
    );
};

const HistoryTimelineView: React.FC<{ logs: HealthLog[], onSelect: (log: HealthLog) => void }> = ({ logs, onSelect }) => (
    <div className="p-6">
        {logs.length > 0 ? (
            <div className="space-y-4">
                {logs.map(log => (
                    <div key={log.id} onClick={() => onSelect(log)} className="bg-white p-4 rounded-2xl shadow-sm cursor-pointer flex items-center space-x-4 transition-transform hover:scale-[1.02]">
                        <div className="flex-shrink-0">
                             <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${log.severity === 'Minor' ? 'bg-green-100 text-green-700' : log.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                {log.symptom.includes('Headache') ? '🤕' : log.symptom.includes('Cough') ? '😷' : '🤧'}
                            </div>
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-lg text-neutral-800">{log.symptom}</p>
                                <span className="text-sm text-neutral-500">{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <p className="text-sm text-neutral-600 mt-1 pr-2 line-clamp-1">{log.details}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-10 bg-white rounded-2xl text-neutral-500">No health logs yet.</div>
        )}
        <PositiveThoughtCard />
    </div>
);

const HistoryDetailView: React.FC<{ log: HealthLog }> = ({ log }) => (
    <div className="p-6">
        <div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-2xl font-bold">{log.symptom}</h2>
            <p className="text-sm text-neutral-500 mb-4">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-neutral-700 mb-6">{log.details}</p>
            <div className="grid grid-cols-2 gap-4">
                <button className="py-3 bg-neutral-200 text-neutral-800 rounded-xl font-semibold">Edit</button>
                <button className="py-3 bg-red-100 text-red-700 rounded-xl font-semibold">Delete</button>
            </div>
        </div>
    </div>
);

const MedicationListView: React.FC<{ medications: Medication[]; onAddMedication: (med: Omit<Medication, 'id'>) => void }> = ({ medications, onAddMedication }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    
    return (
        <div className="p-6">
            {medications.length > 0 ? (
                <div className="space-y-4">
                    {medications.map(med => (
                         <div key={med.id} className="bg-white p-4 rounded-2xl flex items-center shadow-sm">
                            <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center mr-4 text-primary"><PillIcon/></div>
                            <div>
                                <p className="font-bold text-neutral-800">{med.name}</p>
                                <p className="text-sm text-neutral-500">{med.dosage} - {med.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-2xl text-neutral-500">No medications added.</div>
            )}
            <button onClick={() => setShowAddModal(true)} className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-semibold shadow-lg shadow-primary/30">Add Medication</button>
            {showAddModal && <AddMedicationModal onAdd={onAddMedication} onClose={() => setShowAddModal(false)} />}
        </div>
    );
};

const AnalyticsDashboardView: React.FC = () => {
    if (!window.Recharts) {
        return <div className="p-6 text-center"><p className="text-neutral-500">Loading charts...</p></div>;
    }

    const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = window.Recharts;
    const today = new Date().toLocaleString('en-us', { weekday: 'short' });
    
    return (
        <div className="p-6 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-neutral-800">Learning Overview</h3>
                    <select className="font-semibold text-primary bg-primary-light px-3 py-1 rounded-lg border-none outline-none">
                        <option>Weekly</option><option>Monthly</option>
                    </select>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analyticsData.severityTrends} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9FA9B6', fontSize: 12 }} />
                        <YAxis hide={true} /><Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="hours" radius={[10, 10, 10, 10]}>
                            {analyticsData.severityTrends.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === today ? '#7B61FF' : '#E9E6FF'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-400 to-accent-blue text-white p-4 rounded-3xl"><h4 className="font-semibold">Symptom Streak</h4><p className="text-3xl font-bold">12 days</p></div>
                <div className="bg-gradient-to-br from-green-400 to-accent-green text-white p-4 rounded-3xl"><h4 className="font-semibold">Adherence</h4><p className="text-3xl font-bold">95%</p></div>
            </div>
        </div>
    );
};

interface HistoryScreenProps {
    view: string;
    setView: (view: string) => void;
    logs: HealthLog[];
    medications: Medication[];
    onAddMedication: (med: Omit<Medication, 'id'>) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ view, setView, logs, medications, onAddMedication }) => {
    const [selectedLog, setSelectedLog] = useState<HealthLog | null>(null);

    const handleSelectLog = (log: HealthLog) => {
        setSelectedLog(log);
        setView('history/detail');
    };

    const handleBack = () => {
        setSelectedLog(null);
        setView('history/timeline');
    };
    
    const page = view.split('/')[1] || 'analytics';
    let title = "Statistics";
    if (page === 'medications') title = "Medications";
    if (page === 'timeline') title = "Health History";
    if (page === 'detail') title = "Log Details";

    const renderContent = () => {
        switch (page) {
            case 'analytics': return <AnalyticsDashboardView />;
            case 'timeline': return <HistoryTimelineView logs={logs} onSelect={handleSelectLog} />;
            case 'detail': return selectedLog ? <HistoryDetailView log={selectedLog} /> : <HistoryTimelineView logs={logs} onSelect={handleSelectLog} />;
            case 'medications': return <MedicationListView medications={medications} onAddMedication={onAddMedication} />;
            default: return <AnalyticsDashboardView />;
        }
    };
    
    return (
        <div className="min-h-screen bg-neutral-100">
            <Header title={title} onBack={page === 'detail' ? handleBack : undefined} />
             <div className="flex justify-around bg-white p-1 mx-6 mt-2 rounded-full shadow-sm">
                <button onClick={() => setView('history/analytics')} className={`flex-1 py-2.5 px-4 font-semibold rounded-full transition-colors ${page === 'analytics' ? 'bg-primary text-white' : 'text-neutral-500'}`}>Analytics</button>
                <button onClick={() => setView('history/timeline')} className={`flex-1 py-2.5 px-4 font-semibold rounded-full transition-colors ${page === 'timeline' || page === 'detail' ? 'bg-primary text-white' : 'text-neutral-500'}`}>Timeline</button>
                <button onClick={() => setView('history/medications')} className={`flex-1 py-2.5 px-4 font-semibold rounded-full transition-colors ${page === 'medications' ? 'bg-primary text-white' : 'text-neutral-500'}`}>Medications</button>
            </div>
            {renderContent()}
        </div>
    );
};
