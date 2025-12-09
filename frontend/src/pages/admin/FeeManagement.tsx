import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Search, DollarSign, CheckCircle } from 'lucide-react';
import apiService from '@/services/api';

const FeeManagement = () => {
    const { toast } = useToast();
    const [structures, setStructures] = useState<any[]>([]);
    const [loadingStructures, setLoadingStructures] = useState(false);

    // Create Structure State
    const [newFee, setNewFee] = useState({ name: '', currentClass: '', amount: '', type: 'Session', frequency: 'Annually' });

    // Payment State
    const [searchId, setSearchId] = useState('');
    const [duesData, setDuesData] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [loadingDues, setLoadingDues] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    useEffect(() => {
        fetchStructures();
    }, []);

    const fetchStructures = async () => {
        setLoadingStructures(true);
        try {
            const data = await apiService.getFeeStructures();
            setStructures(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStructures(false);
        }
    };

    const handleCreateFee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiService.createFeeStructure({
                ...newFee,
                amount: Number(newFee.amount)
            });
            toast({ title: "Success", description: "Fee structure added" });
            setNewFee({ name: '', currentClass: '', amount: '', type: 'Session', frequency: 'Annually' });
            fetchStructures();
        } catch (error) {
            toast({ title: "Error", description: "Failed to add fee", variant: "destructive" });
        }
    };

    const handleSearchDues = async () => {
        if (!searchId) return;
        setLoadingDues(true);
        setDuesData(null);
        try {
            const data = await apiService.getStudentDues(searchId);
            setDuesData(data);
        } catch (error) {
            toast({ title: "Student Not Found", description: "Could not find student details", variant: "destructive" });
        } finally {
            setLoadingDues(false);
        }
    };

    const handlePayment = async () => {
        if (!duesData || !paymentAmount) return;
        setPaymentProcessing(true);
        try {
            await apiService.recordPayment({
                studentId: searchId, // Or duesData.student._id if mapped
                amountPaid: Number(paymentAmount),
                paymentMethod: 'Cash',
                // feeStructureId: optional, generic payment for now
            });
            toast({ title: "Payment Recorded", description: `Received ₹${paymentAmount}` });
            setPaymentAmount('');
            handleSearchDues(); // Refresh
        } catch (error) {
            toast({ title: "Error", description: "Payment failed", variant: "destructive" });
        } finally {
            setPaymentProcessing(false);
        }
    };

    const classes = ["V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "ALL"];

    return (
        <div className="container py-8 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Fee Management (Cashier)</h2>

            <Tabs defaultValue="collection">
                <TabsList>
                    <TabsTrigger value="collection">Fee Collection</TabsTrigger>
                    <TabsTrigger value="structure">Fee Structures</TabsTrigger>
                </TabsList>

                {/* COLLECTION TAB */}
                <TabsContent value="collection" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Collect Student Fees</CardTitle>
                            <CardDescription>Search for a student to view dues and record payment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 max-w-md mb-6">
                                <Input
                                    placeholder="Enter Student ID (e.g. ST-2025-X-A-01)"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                />
                                <Button onClick={handleSearchDues} disabled={loadingDues}>
                                    {loadingDues ? <Loader2 className="animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>

                            {duesData && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                                        <h3 className="font-semibold text-lg flex items-center">
                                            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                                            {duesData.student} (Roll: {duesData.roll})
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>Total Annual Fees:</div>
                                            <div className="font-bold">₹{duesData.totalFees}</div>
                                            <div>Paid So Far:</div>
                                            <div className="text-green-600 font-bold">₹{duesData.totalPaid}</div>
                                            <div className="border-t pt-2 mt-2 font-bold text-base">Current Balance:</div>
                                            <div className={`border-t pt-2 mt-2 font-bold text-base ${duesData.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                ₹{duesData.balance}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 border p-4 rounded-lg">
                                        <h3 className="font-semibold">Record New Payment</h3>
                                        <div className="space-y-2">
                                            <Label>Amount (₹)</Label>
                                            <Input
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                placeholder="Enter amount received"
                                            />
                                        </div>
                                        <Button className="w-full" onClick={handlePayment} disabled={paymentProcessing || !paymentAmount}>
                                            {paymentProcessing ? <Loader2 className="mr-2 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
                                            Receive Payment
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* STRUCTURE TAB */}
                <TabsContent value="structure" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* List */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Current Fee Structures</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingStructures ? <div className="text-center p-4">Loading...</div> : (
                                    <div className="space-y-2">
                                        {structures.map((fee: any) => (
                                            <div key={fee._id} className="flex justify-between items-center p-3 border rounded hover:bg-slate-50">
                                                <div>
                                                    <div className="font-medium">{fee.name}</div>
                                                    <div className="text-xs text-muted-foreground">Class {fee.currentClass} • {fee.type} • {fee.frequency}</div>
                                                </div>
                                                <div className="font-bold">₹{fee.amount}</div>
                                            </div>
                                        ))}
                                        {structures.length === 0 && <p className="text-muted-foreground text-center">No fees defined yet.</p>}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Create Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Add New Fee</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateFee} className="space-y-3">
                                    <div className="space-y-1">
                                        <Label>Fee Name</Label>
                                        <Input placeholder="e.g. Exam Fee" value={newFee.name} onChange={e => setNewFee({ ...newFee, name: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Class</Label>
                                        <Select onValueChange={v => setNewFee({ ...newFee, currentClass: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                                            <SelectContent>
                                                {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Amount (₹)</Label>
                                        <Input type="number" placeholder="500" value={newFee.amount} onChange={e => setNewFee({ ...newFee, amount: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Type</Label>
                                        <Select defaultValue="Session" onValueChange={v => setNewFee({ ...newFee, type: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Admission">Admission</SelectItem>
                                                <SelectItem value="Session">Session/Annual</SelectItem>
                                                <SelectItem value="Exam">Exam</SelectItem>
                                                <SelectItem value="Development">Development</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="submit" className="w-full mt-2">Add Fee Structure</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FeeManagement;
