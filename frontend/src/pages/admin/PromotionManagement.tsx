import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, ArrowRight, Printer, AlertTriangle, CheckCircle } from 'lucide-react';
import apiService from '@/services/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const PromotionManagement = () => {
    const { toast } = useToast();
    const [searchId, setSearchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [studentData, setStudentData] = useState<any>(null);
    const [promotionData, setPromotionData] = useState({ newClass: '', fee: '' });
    const [promoting, setPromoting] = useState(false);
    const [slipData, setSlipData] = useState<any>(null); // For Yellow Slip

    const handleSearch = async () => {
        if (!searchId) return;
        setLoading(true);
        setStudentData(null);
        try {
            const res = await apiService.checkPromotionEligibility(searchId);
            setStudentData(res);
            // Auto-select next class logic could go here
        } catch (error) {
            toast({ title: "Error", description: "Student not found", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async () => {
        if (!promotionData.newClass || !promotionData.fee) {
            toast({ title: "Incomplete", description: "Please select Class and enter Fee", variant: "destructive" });
            return;
        }
        setPromoting(true);
        try {
            const res = await apiService.promoteStudent({
                studentId: studentData.student.studentId, // Ensure we send ID
                newClass: promotionData.newClass,
                paymentAmount: Number(promotionData.fee)
            });
            setSlipData(res.slipData); // Show Slip
            setStudentData(null); // Clear form
            setSearchId('');
            setPromotionData({ newClass: '', fee: '' });
        } catch (error) {
            toast({ title: "Failed", description: "Promotion failed", variant: "destructive" });
        } finally {
            setPromoting(false);
        }
    };

    const classes = ["V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

    return (
        <div className="container py-8 max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Student Promotion & Re-Admission 🚀</h2>

            {/* 1. Search Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Student</CardTitle>
                    <CardDescription>Enter Student ID to check eligibility for next class.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Input
                        placeholder="e.g. ST-2025-V-A-01"
                        value={searchId}
                        onChange={e => setSearchId(e.target.value)}
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                </CardContent>
            </Card>

            {/* 2. Result & Action Section */}
            {studentData && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Status Card */}
                    <Card className={studentData.eligible ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {studentData.eligible ? <CheckCircle className="text-green-600" /> : <AlertTriangle className="text-red-600" />}
                                {studentData.status}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="font-semibold text-lg">{studentData.student?.studentId}</p>
                            <p>Current Class: <span className="font-bold">{studentData.student?.currentClass}</span></p>
                            <p>Result Summary: {studentData.resultSummary ? `${studentData.resultSummary.percentage}% (${studentData.resultSummary.grade})` : 'No Record'}</p>
                            <p className="text-sm text-gray-600 italic">{studentData.message}</p>
                        </CardContent>
                    </Card>

                    {/* Action Form */}
                    <Card className="border-school-primary/20">
                        <CardHeader>
                            <CardTitle>Promote to Next Class</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select New Class</Label>
                                <Select onValueChange={(val) => setPromotionData({ ...promotionData, newClass: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Admission/Session Fee (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="Enter Amount"
                                    value={promotionData.fee}
                                    onChange={e => setPromotionData({ ...promotionData, fee: e.target.value })}
                                />
                            </div>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={handlePromote}
                                disabled={!studentData.eligible || promoting}
                            >
                                {promoting ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                                Confirm Promotion & Pay
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 3. Yellow Slip Modal */}
            <Dialog open={!!slipData} onOpenChange={(open) => !open && setSlipData(null)}>
                <DialogContent className="max-w-md bg-yellow-100 border-yellow-400">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-serif text-yellow-900 border-b border-yellow-900/20 pb-2">
                            Baliadanga High School
                        </DialogTitle>
                        <DialogDescription className="text-center font-bold text-yellow-800 uppercase tracking-widest mt-1">
                            Admission Receipt
                        </DialogDescription>
                    </DialogHeader>

                    {slipData && (
                        <div className="space-y-4 py-4 text-yellow-900 font-mono text-sm">
                            <div className="flex justify-between">
                                <span>Receipt No:</span>
                                <span className="font-bold">{slipData.receiptNo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Date:</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="border-t border-yellow-900/20 my-2"></div>
                            <div className="flex justify-between">
                                <span>Student ID:</span>
                                <span>{slipData.studentId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Promoted From:</span>
                                <span>Class {slipData.oldClass}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg mt-2">
                                <span>To New Class:</span>
                                <span>{slipData.newClass}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>New Roll No:</span>
                                <span>{slipData.newRoll}</span>
                            </div>
                            <div className="border-t border-yellow-900/20 my-2"></div>
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Amount Paid:</span>
                                <span>₹{slipData.amountPaid}</span>
                            </div>
                        </div>
                    )}

                    <CardFooter className="flex justify-center pt-2">
                        <Button variant="outline" className="border-yellow-900 text-yellow-900 hover:bg-yellow-200" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" /> Print Slip
                        </Button>
                    </CardFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PromotionManagement;
