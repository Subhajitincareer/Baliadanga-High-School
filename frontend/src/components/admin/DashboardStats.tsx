import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Users, UserCheck, FileText, TrendingUp, IndianRupee, Megaphone
} from 'lucide-react';
import apiService from '@/services/api';

interface SummaryData {
    totalStudents: number;
    totalStaff: number;
    pendingAdmissions: number;
    todayAttendancePercent: number;
    todayPresentCount: number;
    thisMonthFees: number;
    recentAnnouncements: number;
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sub, color }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-800">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
                {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
            </div>
        </CardContent>
    </Card>
);

export const DashboardStats: React.FC = () => {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await apiService.getDashboardSummary();
                setSummary(res.data);
            } catch (err) {
                console.error('Failed to load dashboard summary', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-5">
                            <Skeleton className="h-10 w-20 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!summary) return null;

    const stats: StatCardProps[] = [
        {
            icon: <Users className="w-6 h-6 text-blue-600" />,
            label: 'Total Students',
            value: summary.totalStudents,
            color: 'bg-blue-100',
            sub: 'Active enrolments'
        },
        {
            icon: <UserCheck className="w-6 h-6 text-green-600" />,
            label: 'Today\'s Attendance',
            value: `${summary.todayAttendancePercent}%`,
            sub: `${summary.todayPresentCount} present`,
            color: summary.todayAttendancePercent >= 75 ? 'bg-green-100' : summary.todayAttendancePercent >= 50 ? 'bg-amber-100' : 'bg-red-100'
        },
        {
            icon: <Users className="w-6 h-6 text-purple-600" />,
            label: 'Total Staff',
            value: summary.totalStaff,
            color: 'bg-purple-100',
            sub: 'Active members'
        },
        {
            icon: <FileText className="w-6 h-6 text-orange-600" />,
            label: 'Pending Admissions',
            value: summary.pendingAdmissions,
            color: summary.pendingAdmissions > 0 ? 'bg-orange-100' : 'bg-gray-100',
            sub: 'Awaiting review'
        },
        {
            icon: <IndianRupee className="w-6 h-6 text-teal-600" />,
            label: 'Fees This Month',
            value: `₹${summary.thisMonthFees.toLocaleString('en-IN')}`,
            color: 'bg-teal-100',
            sub: 'Collected'
        },
        {
            icon: <Megaphone className="w-6 h-6 text-pink-600" />,
            label: 'Recent Announcements',
            value: summary.recentAnnouncements,
            color: 'bg-pink-100',
            sub: 'Last 7 days'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {stats.map(s => (
                <StatCard key={s.label} {...s} />
            ))}
        </div>
    );
};

export default DashboardStats;
