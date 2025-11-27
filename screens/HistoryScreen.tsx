import React, { useState, useMemo } from 'react';
import { HealthLog, Medication, UserProfile } from '../types';
import { BackArrowIcon, PillIcon } from '../constants';

interface ReportFile {
    id: string;
    name: string;
    iconColor: string;
    fileCount: number;
}

const mockReports: ReportFile[] = [
    { id: '1', name: 'General Health', iconColor: 'bg-cyan-400', fileCount: 8 },
    { id: '2', name: 'Diabetes', iconColor: 'bg-purple-500', fileCount: 4 },
];

const Header: React.FC<{ title: string; onBack?: () => void }> = ({ title, onBack }) => (
    <div className="relative flex items-center justify-center pt-12 pb-6 px-6 bg-white">
        {onBack && (
            <button 
                onClick={onBack} 
                className="absolute left-6 text-gray-700 bg-gray-100 p-2 rounded-full"
            >
                <BackArrowIcon />
            </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <button className="absolute right-6 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
        </button>
    </div>
);

const HealthMetricCard: React.FC<{ 
    title: string; 
    value: string; 
    icon?: React.ReactNode;
    bgColor: string;
    graph?: React.ReactNode;
}> = ({ title, value, icon, bgColor, graph }) => (
    <div className={`${bgColor} rounded-2xl p-5 shadow-sm`}>
        <p className="text-white/90 text-sm mb-2">{title}</p>
        <div className="flex items-end justify-between">
            <div>
                <p className="text-white text-3xl font-bold mb-2">{value}</p>
                {icon && <div className="text-white">{icon}</div>}
            </div>
            {graph && <div className="flex-1 ml-4">{graph}</div>}
        </div>
    </div>
);

const ReportCard: React.FC<{ report: ReportFile; onClick?: () => void }> = ({ report, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow mb-3"
    >
        <div className="flex items-center flex-1">
            <div className={`${report.iconColor} w-12 h-12 rounded-xl flex items-center justify-center mr-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-900">{report.name}</p>
                <p className="text-sm text-gray-500">{report.fileCount} files</p>
            </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
        </button>
    </div>
);

const ReportView: React.FC<{ user?: UserProfile }> = ({ user }) => {
    // ECG Graph SVG
    const ECGGraph = () => (
        <svg width="100" height="40" viewBox="0 0 100 40" className="text-green-400">
            <polyline
                points="0,20 5,20 7,10 10,25 15,15 20,20 25,20 30,10 35,20 40,20 45,15 50,25 55,20 60,20 65,10 70,20 75,20 80,15 85,25 90,20 95,20 100,20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    );

    const bloodGroup = user?.bloodGroup || 'A+';
    const weight = user?.weight || '80 kg';

    return (
        <div className="px-6 py-6 bg-gray-50 min-h-screen">
            {/* Health Metrics */}
            <div className="mb-6">
                <div className="grid grid-cols-1 gap-4 mb-4">
                    {/* Heart Rate - Large Card */}
                    <HealthMetricCard
                        title="Heart Rate"
                        value="96 bpm"
                        bgColor="bg-cyan-400"
                        graph={<ECGGraph />}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {/* Blood Group */}
                    <HealthMetricCard
                        title="Blood Group"
                        value={bloodGroup}
                        bgColor="bg-pink-500"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        }
                    />
                    {/* Weight */}
                    <HealthMetricCard
                        title="Weight"
                        value={weight}
                        bgColor="bg-green-400"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        }
                    />
                </div>
            </div>

            {/* Latest Report */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Report</h2>
                <div>
                    {mockReports.map((report) => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            onClick={() => {
                                alert(`Opening ${report.name} reports`);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
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
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Add Medication</h2>
                <div className="space-y-4">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Medication Name" className="w-full p-3 border-2 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 outline-none" />
                    <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="Dosage (e.g., 1 tablet)" className="w-full p-3 border-2 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 outline-none" />
                    <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="Frequency (e.g., Daily)" className="w-full p-3 border-2 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 outline-none" />
                    <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-3 border-2 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 outline-none">
                        <option>Morning</option>
                        <option>Afternoon</option>
                        <option>Evening</option>
                        <option>Bedtime</option>
                        <option>As needed</option>
                    </select>
                </div>
                <div className="flex items-center justify-end mt-8 space-x-3">
                    <button onClick={onClose} className="py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-xl">Cancel</button>
                    <button onClick={handleSubmit} className="py-3 px-6 bg-blue-500 text-white font-semibold rounded-xl">Save</button>
                </div>
            </div>
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
                                <p className="font-bold text-lg text-gray-900">{log.symptom}</p>
                                <span className="text-sm text-gray-500">{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 pr-2 line-clamp-1">{log.details}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-10 bg-white rounded-2xl text-gray-500">No health logs yet.</div>
        )}
    </div>
);

const HistoryDetailView: React.FC<{ 
    log: HealthLog; 
    onEdit?: (log: HealthLog) => void;
    onDelete?: () => void | Promise<void>;
    onBack: () => void;
}> = ({ log, onEdit, onDelete, onBack }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleEdit = () => {
        if (onEdit) {
            onEdit(log);
        } else {
            alert('Edit functionality coming soon!');
        }
    };

    const handleDelete = async () => {
        if (showDeleteConfirm && onDelete) {
            await onDelete();
            onBack();
        } else {
            setShowDeleteConfirm(true);
        }
    };

    return (
        <div className="p-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900">{log.symptom}</h2>
                <p className="text-sm text-gray-500 mb-4">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-gray-700 mb-6">{log.details}</p>
                <div className="mb-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        log.severity === 'Minor' 
                            ? 'bg-green-100 text-green-800' 
                            : log.severity === 'Moderate' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {log.severity}
                    </span>
                </div>
                {showDeleteConfirm ? (
                    <div className="space-y-3">
                        <p className="text-gray-700 mb-4">Are you sure you want to delete this log?</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={handleEdit}
                            className="py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-colors"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const MedicationListView: React.FC<{ medications: Medication[]; onAddMedication: (med: Omit<Medication, 'id'>) => void }> = ({ medications, onAddMedication }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    
    return (
        <div className="p-6">
            {medications.length > 0 ? (
                <div className="space-y-4">
                    {medications.map(med => (
                         <div key={med.id} className="bg-white p-4 rounded-2xl flex items-center shadow-sm">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mr-4 text-blue-600"><PillIcon/></div>
                            <div>
                                <p className="font-bold text-gray-900">{med.name}</p>
                                <p className="text-sm text-gray-500">{med.dosage} - {med.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-2xl text-gray-500">No medications added.</div>
            )}
            <button onClick={() => setShowAddModal(true)} className="w-full mt-6 bg-blue-500 text-white py-3 rounded-xl font-semibold shadow-lg">Add Medication</button>
            {showAddModal && <AddMedicationModal onAdd={onAddMedication} onClose={() => setShowAddModal(false)} />}
        </div>
    );
};

interface HistoryScreenProps {
    view: string;
    setView: (view: string) => void;
    logs: HealthLog[];
    medications: Medication[];
    onAddMedication: (med: Omit<Medication, 'id'>) => void;
    onDeleteLog?: (logId: string) => Promise<void>;
    onUpdateLog?: (logId: string, updates: Partial<HealthLog>) => Promise<void>;
    user?: UserProfile;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ view, setView, logs, medications, onAddMedication, onDeleteLog, onUpdateLog, user }) => {
    const [selectedLog, setSelectedLog] = useState<HealthLog | null>(null);

    const handleSelectLog = (log: HealthLog) => {
        setSelectedLog(log);
        setView('history/detail');
    };

    const handleBack = () => {
        setSelectedLog(null);
        setView('history/timeline');
    };
    
    const handleEditLog = (log: HealthLog) => {
        // Handle edit logic
        if (onUpdateLog) {
            const newDetails = prompt('Edit details:', log.details);
            if (newDetails !== null) {
                onUpdateLog(log.id, { details: newDetails });
            }
        } else {
            alert('Edit functionality coming soon!');
        }
    };
    
    const page = view.split('/')[1] || 'report';
    let title = "Report";
    if (page === 'medications') title = "Medications";
    if (page === 'timeline') title = "Health History";
    if (page === 'detail') title = "Log Details";
    if (page === 'analytics') title = "Statistics";

    const renderContent = () => {
        switch (page) {
            case 'report': return <ReportView user={user} />;
            case 'analytics': return <ReportView user={user} />;
            case 'timeline': return <HistoryTimelineView logs={logs} onSelect={handleSelectLog} />;
            case 'detail': return selectedLog ? (
                <HistoryDetailView 
                    log={selectedLog} 
                    onEdit={handleEditLog}
                    onDelete={onDeleteLog ? async () => {
                        await onDeleteLog(selectedLog.id);
                        handleBack();
                    } : undefined}
                    onBack={handleBack}
                />
            ) : <HistoryTimelineView logs={logs} onSelect={handleSelectLog} />;
            case 'medications': return <MedicationListView medications={medications} onAddMedication={onAddMedication} />;
            default: return <ReportView user={user} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            <Header title={title} onBack={page === 'detail' ? handleBack : undefined} />
            {page !== 'report' && page !== 'analytics' && (
             <div className="flex justify-around bg-white p-1 mx-6 mt-2 rounded-full shadow-sm">
                    <button onClick={() => setView('history/analytics')} className={`flex-1 py-2.5 px-4 font-semibold rounded-full transition-colors ${page === 'analytics' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}>Analytics</button>
                    <button onClick={() => setView('history/timeline')} className={`flex-1 py-2.5 px-4 font-semibold rounded-full transition-colors ${page === 'timeline' || page === 'detail' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}>Timeline</button>
                    <button onClick={() => setView('history/medications')} className={`flex-1 py-2.5 px-4 font-semibold rounded-full transition-colors ${page === 'medications' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}>Medications</button>
            </div>
            )}
            {renderContent()}
        </div>
    );
};
