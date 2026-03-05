import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
    ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { StudentResult } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Star, AlertCircle, BarChart2 } from 'lucide-react';

interface InsightfulResultViewProps {
    results: StudentResult[];
}

/* ── Helpers ───────────────────────────────────────────────── */

const gradeColor = (pct: number) => {
    if (pct >= 90) return '#16a34a'; // green-600
    if (pct >= 75) return '#2563eb'; // blue-600
    if (pct >= 60) return '#d97706'; // amber-600
    return '#dc2626';               // red-600
};

/* ── Component ─────────────────────────────────────────────── */

export const InsightfulResultView: React.FC<InsightfulResultViewProps> = ({ results }) => {
    if (!results || results.length === 0) return null;

    // Sort chronologically
    const sorted = useMemo(() =>
        [...results].sort((a, b) =>
            new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
        ), [results]);

    const latest = sorted[sorted.length - 1];
    const previous = sorted.length >= 2 ? sorted[sorted.length - 2] : null;

    /* ── Trend line data ── */
    const trendData = sorted.map(r => ({
        name: r.examType,
        Percentage: r.percentage,
    }));

    /* ── Radar data from latest exam ── */
    const radarData = (latest.subjects as unknown as Array<{ name: string; marks: number; maxMarks: number }>).map(s => ({
        subject: s.name?.length > 7 ? s.name.slice(0, 7) + '…' : s.name,
        fullName: s.name,
        score: s.maxMarks > 0 ? Math.round((s.marks / s.maxMarks) * 100) : 0,
    }));

    /* ── Smart Insights ── */
    const topSubject = [...radarData].sort((a, b) => b.score - a.score)[0];
    const lowSubject = [...radarData].sort((a, b) => a.score - b.score)[0];
    const diff = previous ? latest.percentage - previous.percentage : null;
    const trend = diff === null ? 'neutral' : diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
    const trendLabel = diff === null
        ? 'This is your first recorded exam — great start!'
        : diff === 0
        ? 'Your performance is steady compared to the previous exam.'
        : `${trend === 'up' ? '▲ Up' : '▼ Down'} ${Math.abs(diff).toFixed(1)}% from the previous exam (${previous?.examType}).`;

    return (
        <div className="space-y-5 mb-6">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex items-center gap-2 text-school-primary">
                <BarChart2 className="h-5 w-5" />
                <h3 className="font-bold text-base">Performance Insights</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ── Trend Chart ──────────────────────────────────── */}
                <Card className="col-span-1 overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Score Trend</CardTitle>
                        <CardDescription className="text-xs">Your percentage across all exams</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[180px] p-2 pr-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                                <ReTooltip
                                    contentStyle={{ fontSize: 12, borderRadius: 8, padding: '6px 12px' }}
                                    formatter={(v: number) => [`${v}%`, 'Score']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Percentage"
                                    stroke="var(--color-school-primary, #1d4ed8)"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: 'var(--color-school-primary, #1d4ed8)' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* ── Radar Chart ──────────────────────────────────── */}
                <Card className="col-span-1 overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Subject Mastery</CardTitle>
                        <CardDescription className="text-xs">Latest exam: {latest.examType}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[180px] p-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                                <Radar
                                    name="Score %"
                                    dataKey="score"
                                    stroke="var(--color-school-primary, #1d4ed8)"
                                    fill="var(--color-school-primary, #1d4ed8)"
                                    fillOpacity={0.22}
                                />
                                <ReTooltip
                                    contentStyle={{ fontSize: 12, borderRadius: 8, padding: '6px 12px' }}
                                    formatter={(v: number, _: string, props: any) =>
                                        [`${v}%`, props?.payload?.fullName ?? 'Score']
                                    }
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* ── Smart Insights ───────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Top Subject */}
                <div className="flex items-start gap-3 rounded-xl border p-3 bg-green-50/60 border-green-100">
                    <Star className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-semibold text-green-800 leading-snug">Top Strength</p>
                        <p className="text-sm text-green-900 font-bold">{topSubject?.fullName}</p>
                        <p className="text-xs text-green-700">{topSubject?.score}% in latest exam</p>
                    </div>
                </div>

                {/* Focus Area */}
                <div className="flex items-start gap-3 rounded-xl border p-3 bg-amber-50/60 border-amber-100">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-semibold text-amber-800 leading-snug">Focus Area</p>
                        <p className="text-sm text-amber-900 font-bold">{lowSubject?.fullName}</p>
                        <p className="text-xs text-amber-700">{lowSubject?.score}% — needs attention</p>
                    </div>
                </div>

                {/* Trend */}
                <div className={`flex items-start gap-3 rounded-xl border p-3 ${
                    trend === 'up' ? 'bg-blue-50/60 border-blue-100' :
                    trend === 'down' ? 'bg-red-50/60 border-red-100' : 'bg-gray-50 border-gray-100'
                }`}>
                    <TrendIcon className={`h-5 w-5 mt-0.5 shrink-0 ${trendColor}`} />
                    <div>
                        <p className={`text-xs font-semibold leading-snug ${trendColor}`}>
                            {trend === 'up' ? 'Improving 🎉' : trend === 'down' ? 'Needs Push 💪' : 'Steady'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{trendLabel}</p>
                    </div>
                </div>
            </div>

            <hr className="border-dashed border-muted" />
        </div>
    );
};
