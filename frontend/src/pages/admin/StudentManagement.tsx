import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Download, CheckCircle, AlertTriangle, Loader2, Search, User, Eye, Filter, X, Zap, Trash2, Edit } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import apiService, { StudentProfile } from '@/services/api';
import { Link } from 'react-router-dom';

const StudentManagement = () => {
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('ALL');
    const [sectionFilter, setSectionFilter] = useState('ALL');

    const { toast } = useToast();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setIsLoading(true);
            const data = await apiService.getStudents();

            // Normalize data to handle both flat and nested (studentProfile) structures
            const normalizedData = data.map((s: any) => ({
                ...s,
                // Prioritize top-level, fall back to nested studentProfile or user object
                _id: s._id,
                studentId: s.studentId || s.employeeId || s.user?.username || 'N/A',
                fullName: s.name || s.fullName || s.user?.name || 'Unknown',
                email: s.email || s.user?.email || '',
                class: s.class || s.studentProfile?.class || 'N/A',
                section: s.section || s.studentProfile?.section || 'N/A',
                rollNumber: s.rollNumber || s.studentProfile?.rollNumber || 'N/A',
                guardianName: s.guardianName || s.studentProfile?.guardianName || '',
                guardianPhone: s.guardianPhone || s.studentProfile?.guardianPhone || '',
                // Preserve original objects if needed
                user: s.user,
                studentProfile: s.studentProfile
            }));

            setStudents(normalizedData as any);
        } catch (error) {
            console.error("Failed to fetch students:", error);
            toast({
                title: "Error",
                description: "Failed to load student list",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (studentId: string) => {
        if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            return;
        }

        try {
            await apiService.deleteStudent(studentId);
            toast({
                title: 'Success',
                description: 'Student deleted successfully',
            });
            fetchStudents(); // Refresh list
        } catch (error: any) {
            console.error('Failed to delete student:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete student',
                variant: 'destructive',
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCsvFile(e.target.files[0]);
            setUploadResult(null);
        }
    };

    const parseCSV = (text: string) => {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        const result = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const currentLine = lines[i].split(',');
            const obj: any = {};

            headers.forEach((header, index) => {
                let val = currentLine[index]?.trim();
                obj[header] = val;
            });

            if (obj.name && obj.email) {
                result.push({ ...obj });
            }
        }
        return result;
    };

    const handleUpload = async () => {
        if (!csvFile) return;

        setIsUploading(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const text = e.target?.result as string;
            try {
                const parsedData = parseCSV(text);

                if (parsedData.length === 0) {
                    throw new Error("No valid data found in CSV");
                }

                const response = await apiService.bulkImportStudents(parsedData);
                setUploadResult(response);
                toast({
                    title: "Import Complete",
                    description: `Successfully processed ${parsedData.length} rows.`
                });
                setCsvFile(null);
                fetchStudents();
            } catch (error) {
                console.error(error);
                toast({
                    title: "Import Failed",
                    description: error instanceof Error ? error.message : "Failed to import students",
                    variant: 'destructive'
                });
            } finally {
                setIsUploading(false);
            }
        };

        reader.readAsText(csvFile);
    };

    const downloadTemplate = () => {
        // Note: Removed studentId as it is now auto-generated if missing
        const headers = "name,email,rollNumber,class,section,guardianName,guardianPhone,address,dateOfBirth,gender,studentId";
        const sample = "John Doe,john@example.com,01,X,A,Mr. Doe,9876543210,Village+PO,2010-01-01,Male,";
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + sample;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_import_template_v2.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Unique Classes and Sections for filters
    const classes = ['ALL', ...Array.from(new Set(students.map(s => s.class))).sort()];
    const sections = ['ALL', ...Array.from(new Set(students.map(s => s.section))).sort()];

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesClass = classFilter === 'ALL' || student.class === classFilter;
        const matchesSection = sectionFilter === 'ALL' || student.section === sectionFilter;

        return matchesSearch && matchesClass && matchesSection;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
                    <p className="text-muted-foreground">Manage student records, admission, and bulk import.</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/admin/students/quick-add">
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                            <Zap className="mr-2 h-4 w-4" /> Quick Add
                        </Button>
                    </Link>
                    <Link to="/admin/students/new">
                        <Button variant="outline">
                            <User className="mr-2 h-4 w-4" /> Single Add
                        </Button>
                    </Link>
                    <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-school-primary hover:bg-school-primary/90">
                                <Upload className="mr-2 h-4 w-4" /> Bulk Import
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Import Students via CSV</DialogTitle>
                                <DialogDescription>
                                    Upload a CSV file. <strong>Student ID will be auto-generated</strong> if left blank (Format: ST-YYYY-Class-Sec-Roll).
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="flex flex-col gap-2">
                                    <Label>1. Download Template</Label>
                                    <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-fit">
                                        <Download className="mr-2 h-4 w-4" /> Download CSV Template
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>2. Upload Filled CSV</Label>
                                    <Input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                    />
                                    {csvFile && (
                                        <p className="text-sm text-green-600 flex items-center">
                                            <FileText className="w-4 h-4 mr-1" /> {csvFile.name}
                                        </p>
                                    )}
                                </div>

                                {uploadResult && (
                                    <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm">
                                        <p className="font-semibold mb-2">Result Summary:</p>
                                        <div className="flex items-center text-green-600 mb-1">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Added: {uploadResult.results.successCount}
                                        </div>
                                        {uploadResult.results.errors.length > 0 && (
                                            <div className="text-red-600">
                                                <div className="flex items-center mb-1">
                                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                                    Errors: {uploadResult.results.errors.length}
                                                </div>
                                                <ScrollArea className="h-24 w-full rounded border p-2 bg-white">
                                                    {uploadResult.results.errors.map((err: any, i: number) => (
                                                        <div key={i} className="mb-1 text-xs">
                                                            Row {err.email}: {err.message}
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="secondary" onClick={() => setIsImportOpen(false)}>Close</Button>
                                <Button onClick={handleUpload} disabled={!csvFile || isUploading}>
                                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isUploading ? 'Importing...' : 'Start Import'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Student Directory</CardTitle>
                            <CardDescription>
                                Total Students: {students.length}
                            </CardDescription>
                        </div>

                        <div className="flex flex-col gap-2 md:flex-row">
                            {/* Search */}
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by ID, Name..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2">
                                {/* Class Filter */}
                                <Select value={classFilter} onValueChange={setClassFilter}>
                                    <SelectTrigger className="w-full md:w-[120px]">
                                        <SelectValue placeholder="Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c} value={c}>{c === 'ALL' ? 'All Classes' : `Class ${c}`}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                {/* Section Filter */}
                                <Select value={sectionFilter} onValueChange={setSectionFilter}>
                                    <SelectTrigger className="w-full md:w-[120px]">
                                        <SelectValue placeholder="Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map(s => <SelectItem key={s} value={s}>{s === 'ALL' ? 'All Sections' : `Sec ${s}`}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                {(classFilter !== 'ALL' || sectionFilter !== 'ALL' || searchTerm !== '') && (
                                    <Button variant="ghost" size="icon" onClick={() => {
                                        setClassFilter('ALL');
                                        setSectionFilter('ALL');
                                        setSearchTerm('');
                                    }} title="Clear Filters">
                                        <X className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <Filter className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>No students match your filters.</p>
                            <Button variant="link" onClick={() => {
                                setClassFilter('ALL');
                                setSectionFilter('ALL');
                                setSearchTerm('');
                            }}>Clear all filters</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Desktop Table View */}
                            <div className="hidden rounded-md border md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Roll</TableHead>
                                            <TableHead>Section</TableHead>
                                            <TableHead className="hidden md:table-cell">Guardian</TableHead>
                                            <TableHead className="hidden md:table-cell">Contact</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStudents.map((student) => {
                                            return (
                                                <TableRow key={student._id}>
                                                    <TableCell className="font-mono text-xs">{student.studentId}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{student.fullName}</span>
                                                            <span className="text-xs text-muted-foreground">{student.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{student.class}</span></TableCell>
                                                    <TableCell>{student.rollNumber}</TableCell>
                                                    <TableCell>{student.section}</TableCell>
                                                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{student.guardianName}</TableCell>
                                                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{student.guardianPhone}</TableCell>
                                                    <TableCell className="text-right flex items-center justify-end gap-2">
                                                        <Link to={`/admin/students/${student.studentId}`}>
                                                            <Button size="sm" variant="outline" className="h-8">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link to={`/admin/students/${student.studentId}/edit`}>
                                                            <Button size="sm" variant="outline" className="h-8 text-blue-600 hover:text-blue-700">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button size="sm" variant="outline" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(student.studentId)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="grid gap-4 md:hidden">
                                {filteredStudents.map((student) => {
                                    return (
                                        <div key={student._id} className="rounded-lg border bg-white p-4 shadow-sm">
                                            <div className="mb-2 flex items-start justify-between">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-lg">{student.fullName}</span>
                                                    <span className="text-xs text-muted-foreground">{student.email}</span>
                                                </div>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    Class {student.class}
                                                </span>
                                            </div>

                                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground">Student ID</span>
                                                    <span className="font-mono">{student.studentId}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground">Roll No</span>
                                                    <span>{student.rollNumber}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground">Section</span>
                                                    <span>{student.section}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground">Guardian</span>
                                                    <span>{student.guardianName}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <Link to={`/admin/students/${student.studentId}`} className="flex-1">
                                                    <Button size="sm" variant="outline" className="w-full">
                                                        <Eye className="mr-2 h-4 w-4" /> View Detail
                                                    </Button>
                                                </Link>
                                                <Link to={`/admin/students/${student.studentId}/edit`} className="flex-1">
                                                    <Button size="sm" variant="outline" className="w-full text-blue-600 hover:text-blue-700">
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </Button>
                                                </Link>
                                                <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(student.studentId)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentManagement;
