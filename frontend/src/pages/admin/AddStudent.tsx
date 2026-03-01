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
    const [photoFile, setPhotoFile] = useState<File | null>(null);

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
        gender: 'Male',
        photoUrl: '',
        ePortalDetails: {
            aadhaarNo: '', nameAsPerAadhaar: '', motherTongue: 'BENGALI', socialCategory: 'General', religion: 'Hinduism',
            heightCms: '', weightKgs: '', isBplBeneficiary: 'No', isAayBeneficiary: 'No', bplNo: '', belongsToEws: 'No',
            isCwsn: 'No', cwsnDisabilityPercent: '', cwsnImpairmentType: '', nationality: 'Indian', isOutOfSchoolChild: 'No',
            bloodGroup: '', identificationMark: '', healthId: '', relationshipWithGuardian: 'Father', annualFamilyIncome: '',
            guardianQualification: '', admissionNumberInSchool: '', admissionDateEportal: '', statusInPreviousYear: 'Studied at Current/Same School',
            appearedForExamsPreviousYear: 'Appeared', resultPreviousYear: 'Passed', marksPercentagePreviousYear: '',
            daysAttendedPreviousYear: '', previousClassStudied: '', capableOfHandlingDigitalDevices: 'Yes'
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('ep_')) {
            const key = name.replace('ep_', '');
            setFormData(prev => ({ ...prev, ePortalDetails: { ...prev.ePortalDetails, [key]: value } }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        if (name.startsWith('ep_')) {
            const key = name.replace('ep_', '');
            setFormData(prev => ({ ...prev, ePortalDetails: { ...prev.ePortalDetails, [key]: value } }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
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
            let uploadedPhotoUrl = '';
            if (photoFile) {
                const uploadResult = await apiService.uploadFile(photoFile, 'student-photos');
                uploadedPhotoUrl = uploadResult.url;
            }

            const payload = [{
                ...formData,
                photoUrl: uploadedPhotoUrl
            }];

            const response = await apiService.bulkImportStudents(payload);

            if (response.results.successCount > 0) {
                toast({
                    title: "Student Added",
                    description: "Student profile has been created successfully.",
                });
                // Redirect to ID Card Generator with pre-filled Class/Section
                navigate(`/admin/id-cards?class=${formData.class}&section=${formData.section}`);
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

    const classes = ["5", "6", "7", "8", "9", "10", "11", "12"];
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

                        {/* Photo Upload Field */}
                        <div className="space-y-2">
                            <Label htmlFor="photo">Student Photo</Label>
                            <div className="flex items-center gap-4">
                                <Input id="photo" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
                                {photoFile && <span className="text-sm text-green-600">Selected: {photoFile.name}</span>}
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
                                        {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
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
                                        {sections.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
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

                        {/* ePORTAL Details Collapsible Section */}
                        <details className="group border p-4 rounded bg-gray-50/50">
                            <summary className="font-semibold cursor-pointer text-blue-800 hover:text-blue-600 outline-none">
                                ePORTAL Details (Optional) - Click to Expand
                            </summary>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                                {/* Sample Top Level Fields, limiting raw HTML weight by omitting standard repetitive selects if empty texts work in import */}
                                <div className="space-y-2"><Label>Aadhaar No</Label><Input name="ep_aadhaarNo" value={formData.ePortalDetails.aadhaarNo} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Name as Per Aadhaar</Label><Input name="ep_nameAsPerAadhaar" value={formData.ePortalDetails.nameAsPerAadhaar} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Mother Tongue</Label><Input name="ep_motherTongue" value={formData.ePortalDetails.motherTongue} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Social Category</Label><Input name="ep_socialCategory" placeholder="General, SC, ST..." value={formData.ePortalDetails.socialCategory} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Religion</Label><Input name="ep_religion" value={formData.ePortalDetails.religion} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Height (cms)</Label><Input name="ep_heightCms" type="number" value={formData.ePortalDetails.heightCms} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Weight (kgs)</Label><Input name="ep_weightKgs" type="number" value={formData.ePortalDetails.weightKgs} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Is BPL?</Label><Input name="ep_isBplBeneficiary" placeholder="Yes/No" value={formData.ePortalDetails.isBplBeneficiary} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>BPL No.</Label><Input name="ep_bplNo" value={formData.ePortalDetails.bplNo} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Is CWSN?</Label><Input name="ep_isCwsn" placeholder="Yes/No" value={formData.ePortalDetails.isCwsn} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>CWSN Dis. %</Label><Input name="ep_cwsnDisabilityPercent" type="number" value={formData.ePortalDetails.cwsnDisabilityPercent} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Nationality</Label><Input name="ep_nationality" value={formData.ePortalDetails.nationality} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Blood Group</Label><Input name="ep_bloodGroup" value={formData.ePortalDetails.bloodGroup} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Health ID</Label><Input name="ep_healthId" value={formData.ePortalDetails.healthId} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Family Income</Label><Input name="ep_annualFamilyIncome" type="number" value={formData.ePortalDetails.annualFamilyIncome} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Previous Class</Label><Input name="ep_previousClassStudied" value={formData.ePortalDetails.previousClassStudied} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Previous Result</Label><Input name="ep_resultPreviousYear" placeholder="Passed/Failed" value={formData.ePortalDetails.resultPreviousYear} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Previous Marks %</Label><Input name="ep_marksPercentagePreviousYear" type="number" value={formData.ePortalDetails.marksPercentagePreviousYear} onChange={handleChange} /></div>
                                <div className="space-y-2"><Label>Attended Days</Label><Input name="ep_daysAttendedPreviousYear" type="number" value={formData.ePortalDetails.daysAttendedPreviousYear} onChange={handleChange} /></div>
                            </div>
                        </details>

                        <Button type="submit" className="w-full bg-school-primary hover:bg-school-dark" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Student & Generate ID
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddStudent;
