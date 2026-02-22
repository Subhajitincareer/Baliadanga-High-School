import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import apiService from '@/services/api';

const EditStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [existingPhotoUrl, setExistingPhotoUrl] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        studentId: '',
        rollNumber: '',
        class: '',
        section: '',
        guardianName: '',
        guardianPhone: '',
        address: '',
        dateOfBirth: '',
        gender: 'Male',
        photoUrl: ''
    });

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!id) return;
            setIsFetching(true);
            try {
                // Fetch all students and find the specific one for now
                // (Backend has /api/students/:id but api.ts lacked a clean fetcher, so using existing full list)
                const allStudents = await apiService.getStudents();
                const student = allStudents.find(s => s.studentId === id);

                if (!student) {
                    throw new Error("Student not found");
                }

                setFormData({
                    name: student.fullName || student.name || student.user?.name || '',
                    email: student.email || student.user?.email || '',
                    studentId: student.studentId || '',
                    rollNumber: student.rollNumber || '',
                    class: student.class || '',
                    section: student.section || '',
                    guardianName: student.guardianName || '',
                    guardianPhone: student.guardianPhone || '',
                    address: student.address || '',
                    dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
                    gender: student.gender || 'Male',
                    photoUrl: student.photoUrl || ''
                });

                if (student.photoUrl) {
                    setExistingPhotoUrl(student.photoUrl);
                }

            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to load student details",
                    variant: "destructive"
                });
                navigate('/admin/students');
            } finally {
                setIsFetching(false);
            }
        };

        fetchStudentData();
    }, [id, navigate, toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let uploadedPhotoUrl = formData.photoUrl; // Keep existing by default

            // If a new photo is selected, upload it
            if (photoFile) {
                const uploadResult = await apiService.uploadFile(photoFile, 'student-photos');
                uploadedPhotoUrl = uploadResult.url;
            }

            const payload = {
                ...formData,
                photoUrl: uploadedPhotoUrl
            };

            await apiService.updateStudent(id as string, payload);

            toast({
                title: "Student Updated",
                description: "Student profile has been updated successfully.",
            });
            // Redirect back to management/details
            navigate(`/admin/students/${id}`);

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.message || "Failed to update student",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const classes = ["5", "6", "7", "8", "9", "10", "11", "12"];
    const sections = ["A", "B", "C", "D"];

    if (isFetching) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-school-primary" />
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-2xl mx-auto">
            <Button variant="ghost" className="mb-4" onClick={() => navigate('/admin/students')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Student: {formData.studentId}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" name="name" required value={formData.name} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Photo Upload Field */}
                        <div className="space-y-2">
                            <Label htmlFor="photo">Student Photo</Label>
                            {existingPhotoUrl && !photoFile && (
                                <div className="mb-2">
                                    <img src={existingPhotoUrl} alt="Current profile" className="h-16 w-16 rounded object-cover border" />
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <Input id="photo" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
                                {photoFile && <span className="text-sm text-green-600">Selected: {photoFile.name}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="class">Class *</Label>
                                <Select value={formData.class} onValueChange={(val) => handleSelectChange('class', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="section">Section *</Label>
                                <Select value={formData.section} onValueChange={(val) => handleSelectChange('section', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rollNumber">Roll Number *</Label>
                                <Input id="rollNumber" name="rollNumber" required value={formData.rollNumber} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="studentId">Student ID</Label>
                                <Input id="studentId" name="studentId" value={formData.studentId} disabled className="bg-gray-100" />
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
                                <Select value={formData.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
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

                        <Button type="submit" className="w-full bg-school-primary hover:bg-school-dark" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Update Student
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditStudent;
