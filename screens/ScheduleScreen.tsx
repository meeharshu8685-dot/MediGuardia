import React, { useState } from 'react';
import { BackArrowIcon } from '../constants';

interface Appointment {
    id: string;
    date: string;
    day: string;
    time: string;
    doctorName: string;
    specialty: string;
    reason: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    color: string;
}

const mockAppointments: Appointment[] = [
    { 
        id: '1', 
        date: '12', 
        day: 'Tue', 
        time: '09:30 AM', 
        doctorName: 'Dr. Mim Akhter', 
        specialty: 'Psychiatrist',
        reason: 'Depression', 
        status: 'upcoming',
        color: 'bg-blue-500' 
    },
    { 
        id: '2', 
        date: '13', 
        day: 'We', 
        time: '10:00 AM', 
        doctorName: 'Dr. John Smith', 
        specialty: 'General Physician',
        reason: 'Checkup', 
        status: 'upcoming',
        color: 'bg-orange-500' 
    },
    { 
        id: '3', 
        date: '15', 
        day: 'Fri', 
        time: '02:00 PM', 
        doctorName: 'Dr. Sarah Johnson', 
        specialty: 'Cardiologist',
        reason: 'Heart Checkup', 
        status: 'upcoming',
        color: 'bg-green-500' 
    },
];

const AppointmentCard: React.FC<{ appointment: Appointment; onClick?: () => void }> = ({ appointment, onClick }) => (
    <div 
        onClick={onClick}
        className={`${appointment.color} rounded-2xl p-5 mb-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow`}
    >
        <div className="flex items-start justify-between mb-3">
            <div>
                <p className="text-white font-bold text-2xl">{appointment.date}</p>
                <p className="text-white/90 text-sm">{appointment.day}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                appointment.status === 'upcoming' ? 'bg-white/30 text-white' :
                appointment.status === 'completed' ? 'bg-green-500 text-white' :
                'bg-red-500 text-white'
            }`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
        </div>
        <div className="mt-3">
            <p className="text-white/90 text-xs mb-1">{appointment.time}</p>
            <p className="text-white font-semibold text-base mb-1">{appointment.doctorName}</p>
            <p className="text-white/80 text-xs mb-1">{appointment.specialty}</p>
            <p className="text-white/80 text-xs">{appointment.reason}</p>
        </div>
    </div>
);

const AddAppointmentModal: React.FC<{ onClose: () => void; onAdd: (appointment: Omit<Appointment, 'id'>) => void }> = ({ onClose, onAdd }) => {
    const [doctorName, setDoctorName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [reason, setReason] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const handleSubmit = () => {
        if (doctorName && specialty && reason && date && time) {
            const appointmentDate = new Date(date);
            const dayNames = ['Sun', 'Mon', 'Tue', 'We', 'Thu', 'Fri', 'Sat'];
            const day = dayNames[appointmentDate.getDay()];
            const dateNum = appointmentDate.getDate().toString();
            
            onAdd({
                date: dateNum,
                day,
                time,
                doctorName,
                specialty,
                reason,
                status: 'upcoming',
                color: 'bg-blue-500'
            });
            onClose();
        } else {
            alert('Please fill all fields.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white tracking-tight">Add Appointment</h2>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        value={doctorName} 
                        onChange={(e) => setDoctorName(e.target.value)} 
                        placeholder="Doctor Name" 
                        className="w-full p-3 border-2 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 outline-none" 
                    />
                    <input 
                        type="text" 
                        value={specialty} 
                        onChange={(e) => setSpecialty(e.target.value)} 
                        placeholder="Specialty" 
                        className="w-full p-3 border-2 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 outline-none" 
                    />
                    <input 
                        type="text" 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)} 
                        placeholder="Reason" 
                        className="w-full p-3 border-2 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 outline-none" 
                    />
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        className="w-full p-3 border-2 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 outline-none" 
                    />
                    <input 
                        type="time" 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)} 
                        className="w-full p-3 border-2 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 outline-none" 
                    />
                </div>
                <div className="flex items-center justify-end mt-8 space-x-3">
                    <button onClick={onClose} className="py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-xl">Cancel</button>
                    <button onClick={handleSubmit} className="py-3 px-6 bg-blue-500 text-white font-semibold rounded-xl">Save</button>
                </div>
            </div>
        </div>
    );
};

interface ScheduleScreenProps {
    navigate: (view: string) => void;
    setView: (view: string) => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ navigate, setView }) => {
    const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

    const filteredAppointments = appointments.filter(apt => 
        filter === 'all' ? true : apt.status === filter
    );

    const handleAddAppointment = (appointment: Omit<Appointment, 'id'>) => {
        const newAppointment: Appointment = {
            ...appointment,
            id: Date.now().toString()
        };
        setAppointments([...appointments, newAppointment]);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white pt-12 pb-6 px-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">Schedule</h1>
                
                {/* Filter Tabs */}
                <div className="flex space-x-2 mb-4">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                            filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                            filter === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                            filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            <div className="px-6 py-4">
                {filteredAppointments.length > 0 ? (
                    <div>
                        {filteredAppointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                onClick={() => {
                                    alert(`Appointment with ${appointment.doctorName} on ${appointment.date} ${appointment.day} at ${appointment.time}`);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white rounded-2xl text-gray-500">
                        No appointments found.
                    </div>
                )}
            </div>

            {/* Add Appointment Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-32 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors z-40"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {showAddModal && (
                <AddAppointmentModal
                    onAdd={handleAddAppointment}
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </div>
    );
};

