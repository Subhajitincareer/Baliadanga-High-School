import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, ArrowRight, Printer, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import apiService from '@/services/api';
import { CLASS_OPTIONS, NEXT_CLASS, CURRENT_SESSION } from '@/utils/constants';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const PromotionManagement = () => {
    const { toast } = useToast();
    // --- Individual Promotion state ---
    const [searchId, setSearchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [studentData, setStudentData] = useState<any>(null);
    const [promotionData, setPromotionData] = useState({ newClass: '', fee: '' });
    const [promoting, setPromoting] = useState(false);
    const [slipData, setSlipData] = useState<any>(null);

    // --- Bulk Promotion state ---
    const [bulkClass, setBulkClass] = useState('');
    const [bulkSection, setBulkSection] = useState('');
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [bulkPromoting, setBulkPromoting] = useState(false);

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
                studentId: studentData.student.studentId,
                newClass: promotionData.newClass,
                paymentAmount: Number(promotionData.fee)
            });
            setSlipData(res.slipData);
            toast({ title: 'Promotion Complete!', description: `Admitted to Class ${promotionData.newClass}` });
            setStudentData(null);
            setSearchId('');
            setPromotionData({ newClass: '', fee: '' });
        } catch (error) {
            toast({ title: "Failed", description: "Promotion failed", variant: "destructive" });
        } finally {
            setPromoting(false);
        }
    };

    // --- Bulk Promotion handlers ---
    const handleBulkPreview = async () => {
        if (!bulkClass) return;
        setPreviewLoading(true);
        setPreviewData(null);
        try {
            const res = await apiService.getPromotionPreview(bulkClass, bulkSection || undefined);
            setPreviewData(res);
        } catch (error: any) {
            toast({ title: 'Preview failed', description: error.message, variant: 'destructive' });
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleBulkConfirm = async () => {
        if (!bulkClass || !previewData) return;
        setBulkPromoting(true);
        try {
            const res = await apiService.bulkPromoteStudents({
                fromClass: bulkClass,
                toClass: NEXT_CLASS[bulkClass],
                newSession: CURRENT_SESSION,
                promoteAll: true
            });
            toast({
                title: 'Bulk Promotion Done',
                description: `${res.promoted} students promoted. ${res.failed ?? 0} failed.`
            });
            setPreviewData(null);
        } catch (error: any) {
            toast({ title: 'Bulk Promotion Failed', description: error.message, variant: 'destructive' });
        } finally {
            setBulkPromoting(false);
        }
    };

    const classes = CLASS_OPTIONS;

    return (
        <div className="container py-8 max-w-5xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Student Promotion &amp; Re-Admission 🚀</h2>

            <Tabs defaultValue="individual">
                <TabsList>
                    <TabsTrigger value="individual">Individual Promotion</TabsTrigger>
                    <TabsTrigger value="bulk"><Users className="mr-2 h-4 w-4" />Bulk Promotion</TabsTrigger>
                </TabsList>

                {/* --------- INDIVIDUAL TAB --------- */}
                <TabsContent value="individual" className="space-y-6 mt-4">
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
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : <Search className="w-4 h-4" />}
                            </Button>
                        </CardContent>
                    </Card>

                    {studentData && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className={studentData.eligible ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {studentData.eligible ? <CheckCircle className="text-green-600" /> : <AlertTriangle className="text-red-600" />}
                                        {studentData.status}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="font-semibold text-lg">{studentData.student?.studentId}</p>
                                    <p>Current Class: <span className="font-bold">{studentData.student?.class || studentData.student?.currentClass}</span></p>
                                    <p>Result: {studentData.resultSummary ? `${studentData.resultSummary.percentage}% (${studentData.resultSummary.grade})` : 'No Record'}</p>
                                    <p className="text-sm text-gray-600 italic">{studentData.message}</p>
                                </CardContent>
                            </Card>

                            <Card className="border-school-primary/20">
                                <CardHeader><CardTitle>Promote to Next Class</CardTitle></CardHeader>
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
                                        Confirm Promotion &amp; Pay
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                {/* --------- BULK TAB --------- */}
                <TabsContent value="bulk" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Class Promotion</CardTitle>
                            <CardDescription>
                                Preview which students will be promoted, then confirm. All eligible students in the selected class move to the next class.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="space-y-2">
                                    <Label>Current Class</Label>
                                    <Select onValueChange={setBulkClass} value={bulkClass}>
                                        <SelectTrigger className="w-40"><SelectValue placeholder="Class" /></SelectTrigger>
                                        <SelectContent>
                                            {CLASS_OPTIONS.filter(c => c !== 'XII').map(c =>
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Section (optional)</Label>
                                    <Select onValueChange={setBulkSection} value={bulkSection}>
                                        <SelectTrigger className="w-32"><SelectValue placeholder="All" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Sections</SelectItem>
                                            {['A','B','C','D'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleBulkPreview} disabled={!bulkClass || previewLoading} variant="outline">
                                    {previewLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />}
                                    Preview
                                </Button>
                            </div>

                            {previewData && (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <Badge variant="default">Eligible: {previewData.eligible?.length ?? 0}</Badge>
                                        <Badge variant="destructive">Ineligible: {previewData.ineligible?.length ?? 0}</Badge>
                                        <Badge variant="outline">→ Class {NEXT_CLASS[bulkClass]}</Badge>
                                    </div>

                                    <div className="rounded-md border max-h-64 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Student ID</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>%</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {[...(previewData.eligible ?? []), ...(previewData.ineligible ?? [])].map((s: any) => (
                                                    <TableRow key={s.studentId}>
                                                        <TableCell className="font-mono text-xs">{s.studentId}</TableCell>
                                                        <TableCell>{s.name}</TableCell>
                                                        <TableCell>{s.percentage ?? '—'}</TableCell>
                                                        <TableCell>
                                                            {s.eligible
                                                                ? <Badge variant="default" className="bg-green-600">Eligible</Badge>
                                                                : <Badge variant="destructive">Ineligible</Badge>}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={handleBulkConfirm}
                                        disabled={bulkPromoting || (previewData.eligible?.length ?? 0) === 0}
                                    >
                                        {bulkPromoting ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                                        Promote {previewData.eligible?.length ?? 0} Students to Class {NEXT_CLASS[bulkClass]}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Yellow Slip Modal */}
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
                            <div className="flex justify-between"><span>Receipt No:</span><span className="font-bold">{slipData.receiptNo}</span></div>
                            <div className="flex justify-between"><span>Date:</span><span>{new Date().toLocaleDateString()}</span></div>
                            <div className="border-t border-yellow-900/20 my-2" />
                            <div className="flex justify-between"><span>Student ID:</span><span>{slipData.studentId}</span></div>
                            <div className="flex justify-between"><span>Promoted From:</span><span>Class {slipData.oldClass}</span></div>
                            <div className="flex justify-between font-bold text-lg mt-2"><span>To New Class:</span><span>{slipData.newClass}</span></div>
                            <div className="flex justify-between font-bold text-lg"><span>New Roll No:</span><span>{slipData.newRoll}</span></div>
                            <div className="border-t border-yellow-900/20 my-2" />
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Amount Paid:</span><span>₹{slipData.amountPaid}</span>
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
