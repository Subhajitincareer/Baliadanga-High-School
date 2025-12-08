import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Staff } from '@/services/api'; // Assuming Staff interface is added to api.ts
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface StaffDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedStaff: Staff | null;
    onSuccess: () => void;
}

export const StaffDialog: React.FC<StaffDialogProps> = ({
    isOpen,
    onOpenChange,
    selectedStaff,
    onSuccess
}) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [position, setPosition] = useState<'Teacher' | 'Admin' | 'Principal' | 'Vice Principal' | 'Coordinator'>('Teacher');
    const [department, setDepartment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (selectedStaff) {
            setFullName(selectedStaff.fullName);
            setEmail(selectedStaff.email);
            setEmployeeId(selectedStaff.employeeId);
            setPosition(selectedStaff.position);
            setDepartment(selectedStaff.department);
        } else {
            resetForm();
        }
    }, [selectedStaff, isOpen]);

    const resetForm = () => {
        setFullName('');
        setEmail('');
        setEmployeeId('');
        setPosition('Teacher');
        setDepartment('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const staffData: any = {
                fullName,
                email,
                // employeeId is handled by backend for new staff
                position,
                department
            };

            if (selectedStaff) {
                staffData.employeeId = employeeId;
            }

            if (selectedStaff && selectedStaff._id) {
                await apiService.updateStaff(selectedStaff._id, staffData);
                toast({ title: 'Staff updated', description: 'Updated successfully.' });
            } else {
                await apiService.createStaff(staffData);
                toast({ title: 'Staff created', description: 'User account created with default password (changeme123).' });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to save staff member',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. John Doe"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@school.edu"
                            required
                            disabled={!!selectedStaff} // Prevent changing email for simplicity as it links to User
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input
                            id="employeeId"
                            value={selectedStaff ? employeeId : 'Auto-generated'}
                            disabled
                            placeholder="Auto-generated"
                        />
                        {!selectedStaff && <p className="text-xs text-slate-500">ID will be generated automatically (e.g. EMP-001)</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="position">Position</Label>
                            <Select value={position} onValueChange={(v: any) => setPosition(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Teacher">Teacher</SelectItem>
                                    <SelectItem value="Principal">Principal</SelectItem>
                                    <SelectItem value="Vice Principal">Vice Principal</SelectItem>
                                    <SelectItem value="Coordinator">Coordinator</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="e.g. Science"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Staff'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
