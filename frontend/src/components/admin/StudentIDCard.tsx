import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { User, MapPin, Phone } from 'lucide-react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

interface StudentProfile {
    studentId: string;
    fullName: string;
    class: string;
    section?: string;
    rollNumber?: string;
    bloodGroup?: string;
    contactNumber?: string;
    address?: string;
    photoUrl?: string; // Add photo URL support
    dateOfBirth?: string;
}

interface StudentIDCardProps {
    student: StudentProfile;
    schoolName?: string;
    schoolAddress?: string;
    academicYear?: string;
}

export const StudentIDCard: React.FC<StudentIDCardProps> = ({
    student,
    schoolName,
    schoolAddress,
    academicYear = "2025-2026"
}) => {
    const { settings } = useSiteSettings();
    const finalAddress = schoolAddress || settings.idCard.address || "Baliadanga, Kaliachak, Malda";
    const displayName = schoolName ?? settings.schoolInfo.name.toUpperCase();
    return (
        <div className="w-[350px] h-[220px] border-2 border-school-primary/20 rounded-xl bg-white relative overflow-hidden flex flex-row shadow-sm print:shadow-none print:border-school-primary">
            {/* Background design element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-school-primary/5 rounded-bl-full -mr-10 -mt-10 z-0"></div>

            {/* Left Side: Photo & QR */}
            <div className="w-1/3 flex flex-col items-center justify-center p-3 border-r bg-gray-50/50 z-10 gap-3">
                <div className="relative w-20 h-20 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-200">
                    {student.photoUrl ? (
                        <img
                            src={student.photoUrl}
                            alt={student.fullName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User className="w-10 h-10" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center gap-1">
                    <QRCodeSVG
                        value={student.studentId}
                        size={60}
                        level="M"
                        includeMargin={false}
                    />
                    <span className="text-[10px] font-mono font-bold text-gray-500">{student.studentId}</span>
                </div>
            </div>

            {/* Right Side: Details */}
            <div className="w-2/3 p-3 flex flex-col z-10">
                {/* Header */}
                <div className="text-center mb-2 border-b pb-1">
                    <h3 className="font-bold text-school-primary text-sm leading-tight">{displayName}</h3>
                    <p className="text-[9px] text-muted-foreground">{finalAddress}</p>
                </div>

                {/* Student Info */}
                <div className="flex-1 flex flex-col justify-center space-y-1">
                    <div>
                        <h2 className="font-bold text-lg leading-none uppercase text-gray-800 truncate">{student.fullName}</h2>
                        <p className="text-[10px] text-school-primary font-medium">Student</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] mt-1">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-muted-foreground uppercase">Class</span>
                            <span className="font-semibold">{student.class} {student.section && `(${student.section})`}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-muted-foreground uppercase">Roll No</span>
                            <span className="font-semibold">{student.rollNumber || "N/A"}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-muted-foreground uppercase">DOB</span>
                            <span className="font-semibold">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-muted-foreground uppercase">Blood Group</span>
                            <span className="font-semibold">{student.bloodGroup || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-2 border-t flex justify-between items-end">
                    <div className="text-[9px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Phone className="w-2 h-2" />
                            <span>{student.contactNumber || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 max-w-[120px] truncate">
                            <MapPin className="w-2 h-2" />
                            <span className="truncate">{student.address || "N/A"}</span>
                        </div>
                    </div>
                    <div className="text-center flex flex-col items-center justify-end">
                        {settings.idCard.signatureUrl ? (
                            <img src={settings.idCard.signatureUrl} alt="Signature" className="h-8 object-contain mb-0.5" />
                        ) : (
                            <div className="h-6 w-16 border-b border-dashed border-gray-400 mb-0.5"></div>
                        )}
                        <p className="text-[8px] text-muted-foreground leading-none">Authority Sign</p>
                    </div>
                </div>
            </div>

            {/* Year Badge */}
            <div className="absolute bottom-0 left-0 bg-school-primary text-white text-[8px] font-bold px-2 py-0.5 rounded-tr-md z-20">
                {academicYear}
            </div>
        </div>
    );
};
