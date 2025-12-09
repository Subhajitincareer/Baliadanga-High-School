import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiService, { Resource } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Trash2, Upload, Loader2, Download } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ResourceManagementProps {
    hideHeader?: boolean;
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({ hideHeader = false }) => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'policy' | 'form' | 'other'>('policy');
    const [file, setFile] = useState<File | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getResources();
            if (response.success && response.data) {
                setResources(response.data);
            }
        } catch (error: any) {
            console.error('Error fetching resources:', error);
            toast({
                title: 'Error',
                description: 'Failed to load resources.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            // Basic validation
            if (selectedFile.type !== 'application/pdf' &&
                selectedFile.type !== 'application/msword' &&
                selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                toast({
                    title: 'Invalid File',
                    description: 'Please upload PDF or Word documents only.',
                    variant: 'destructive',
                });
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title || !description) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill all fields and select a file.',
                variant: 'destructive'
            });
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('type', type);
            formData.append('file', file);

            await apiService.createResource(formData);

            toast({
                title: 'Success',
                description: 'Resource uploaded successfully.',
            });

            // Reset form
            setTitle('');
            setDescription('');
            setFile(null);
            // Reset file input manually if needed, or rely on state
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            await fetchResources(); // Ensure we wait for fetch
        } catch (error: any) {
            console.error('Upload error:', error);
            toast({
                title: 'Upload Failed',
                description: error.message || 'Failed to upload resource. Please check your connection.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;

        try {
            await apiService.deleteResource(id);
            toast({
                title: 'Deleted',
                description: 'Resource deleted successfully.',
            });
            setResources(prev => prev.filter(r => r._id !== id));
        } catch (error: any) {
            console.error('Delete error:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete resource.',
                variant: 'destructive',
            });
        }
    };

    const getFileUrl = (filePath: string) => {
        if (filePath.startsWith('http')) {
            return filePath;
        }
        return `http://localhost:5000${filePath}`;
    };

    // Filter Logic
    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || resource.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="container py-8">
            {!hideHeader && (
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Resource Management</h1>
                    <p className="text-muted-foreground">Upload and manage school policies and forms.</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload New Resource</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g. Code of Conduct"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={type} onValueChange={(val: any) => setType(val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="policy">Policy</SelectItem>
                                            <SelectItem value="form">Form</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Brief description..."
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="file-upload">PDF/Word Document</Label>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isUploading}>
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" /> Upload Resource
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Resource List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Existing Resources</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={fetchResources} title="Refresh List">
                                    <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Search and Filter Controls */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                <Input
                                    placeholder="Search resources..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1"
                                />
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Filter by Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="policy">Policy</SelectItem>
                                        <SelectItem value="form">Form</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {isLoading ? (
                                <LoadingSpinner />
                            ) : filteredResources.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {resources.length === 0 ? "No resources found. Upload one to get started." : "No resources match your search."}
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredResources.map((resource) => (
                                                <TableRow key={resource._id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <FileText className="h-4 w-4 text-school-primary" />
                                                            <div>
                                                                <div className="font-semibold">{resource.title}</div>
                                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{resource.description}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="capitalize">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${resource.type === 'policy' ? 'bg-blue-100 text-blue-800' :
                                                                resource.type === 'form' ? 'bg-green-100 text-green-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {resource.type}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <a href={getFileUrl(resource.filePath)} target="_blank" rel="noopener noreferrer">
                                                                <Button variant="ghost" size="sm" title="Download">
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </a>
                                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(resource._id)} title="Delete">
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
