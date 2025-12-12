import React from 'react';
import { Check, Clock, CreditCard, UserCheck } from 'lucide-react';

interface AdmissionTimelineProps {
    status: 'Pending' | 'Approved' | 'Rejected' | 'Reviewing' | 'Payment_Pending';
}

const steps = [
    { id: 'submitted', label: 'Submitted', icon: Check },
    { id: 'review', label: 'Under Review', icon: Clock },
    { id: 'approved', label: 'Approved', icon: UserCheck },
];

export const AdmissionTimeline: React.FC<AdmissionTimelineProps> = ({ status }) => {
    // Determine current step index
    let currentStep = 0;
    if (status === 'Pending') currentStep = 1; // Submitted, waiting for review
    if (status === 'Reviewing') currentStep = 1;
    if (status === 'Approved') currentStep = 3;
    if (status === 'Rejected') currentStep = 1; // Stays at review with red error

    return (
        <div className="relative w-full py-8">
            {/* Connector Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />

            {/* Active Line */}
            <div
                className="absolute top-1/2 left-0 h-1 bg-school-primary -translate-y-1/2 transition-all duration-500 rounded-full"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            <div className="relative flex justify-between">
                {steps.map((step, index) => {
                    const isActive = index <= currentStep;
                    const isCompleted = index < currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div
                                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isActive
                                        ? 'border-school-primary bg-school-primary text-white scale-110 shadow-lg'
                                        : 'border-gray-300 text-gray-400 bg-white'}
                `}
                            >
                                <Icon size={18} />
                            </div>
                            <span
                                className={`
                  text-xs font-semibold whitespace-nowrap transition-colors
                  ${isActive ? 'text-school-primary' : 'text-gray-400'}
                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
