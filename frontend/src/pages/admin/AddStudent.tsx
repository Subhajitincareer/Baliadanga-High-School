import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import apiService from '@/services/api';

const AddStudent = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '', // Custom password
        studentId: '', // Optional, auto-gen if empty
        rollNumber: '',
        class: '',
        section: '',
        guardianName: '',
        guardianPhone: '',
        address: '',
        dateOfBirth: '',
        gender: 'Male'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // We'll use the bulk import API with a single item array for simplicity
            // or we could create a proper single create endpoint. 
            // The controller exists: createStudent (POST /) but requires specific payload.
            // Let's us bulk import as it handles User + Profile creation logic seamlessly we built earlier.
            // Actually, let's look at studentController.js again... it has `createStudent` which does User+Profile.
            // But let's verify if `apiService` has `createStudent`. 
            // It was not in the interface... I'll check api.ts or just use bulk for now as it's robust.
            // Wait, bulk is /students/bulk.
            // Let's use bulk for consistency with the "auto-id" logic we just added there.

            const payload = [{
                ...formData
            }];

            const response = await apiService.bulkImportStudents(payload);

            if (response.results.successCount > 0) {
                toast({
                    title: "Student Added",
                    description: "Student profile has been created successfully.",
                });
                navigate('/admin/dashboard');
            } else {
                const errorMsg = response.results.errors[0]?.message || "Failed to create student";
                throw new Error(errorMsg);
            }

        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add student",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const classes = ["V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const sections = ["A", "B", "C", "D"];

    return (
        <div className="container py-8 max-w-2xl mx-auto">
            <Button variant="ghost" className="mb-4" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Student</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password (Optional)</Label>
                                <Input id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Default: Student@2025" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="class">Class *</Label>
                                <Select onValueChange={(val) => handleSelectChange('class', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="section">Section *</Label>
                                <Select onValueChange={(val) => handleSelectChange('section', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rollNumber">Roll Number *</Label>
                                <Input id="rollNumber" name="rollNumber" required value={formData.rollNumber} onChange={handleChange} placeholder="01" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="studentId">Student ID (Optional)</Label>
                                <Input id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="Leave empty to auto-generate" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="guardianName">Guardian Name</Label>
                                <Input id="guardianName" name="guardianName" value={formData.guardianName} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="guardianPhone">Guardian Phone</Label>
                                <Input id="guardianPhone" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select defaultValue="Male" onValueChange={(val) => handleSelectChange('gender', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Student
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddStudent;
