import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import apiService, { Staff, User } from '@/services/api'; // Ensure User is imported
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Save } from 'lucide-react';

// Extend Staff interface locally to include populated user
interface PopulatedStaff extends Staff {
    userId: User; // We updated the backend to populate this
}

const PERMISSIONS = [
    { key: 'MANAGE_ADMISSION', label: 'Admission' },
    { key: 'MANAGE_FEES', label: 'Fees' },
    { key: 'MANAGE_RESULTS', label: 'Results' },
    { key: 'TAKE_ATTENDANCE', label: 'Attendance' },
    { key: 'MANAGE_RESOURCES', label: 'Resources' },
];

const PermissionManagement = () => {
    const [staffList, setStaffList] = useState<PopulatedStaff[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const data = await apiService.getStaff();
            // Cast data to PopulatedStaff[] as backend is updated
            setStaffList(data as unknown as PopulatedStaff[]);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load staff list.",
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionToggle = async (userId: string, permission: string, currentPermissions: string[] = []) => {
        // Optimistic update logic could go here, but let's do direct save for simplicity
        // Or better: Update local state then save?
        // Let's implement individual save per toggle or a "Save" button per user?
        // Instant save is better for UX if fast.

        const newPermissions = currentPermissions.includes(permission)
            ? currentPermissions.filter(p => p !== permission)
            : [...currentPermissions, permission];

        setSaving(userId);
        try {
            await apiService.updateUserPermissions(userId, newPermissions);

            // Update local state
            setStaffList(prev => prev.map(staff => {
                if (staff.userId._id === userId) {
                    return {
                        ...staff,
                        userId: {
                            ...staff.userId,
                            permissions: newPermissions
                        }
                    };
                }
                return staff;
            }));

            toast({
                title: "Permissions Updated",
                description: "User permissions have been saved."
            });
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Could not update permissions.",
                variant: 'destructive'
            });
        } finally {
            setSaving(null);
        }
    };

    if (loading) return <LoadingSpinner text="Loading staff permissions..." />;

    return (
        <div className="container py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Permission Management</h1>
                <p className="text-muted-foreground">Grant or revoke operational permissions for staff members.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Staff Permissions</CardTitle>
                    <CardDescription>
                        Toggle permissions for each staff member. Admins have full access by default.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Name</TableHead>
                                <TableHead>Role</TableHead>
                                {PERMISSIONS.map(p => (
                                    <TableHead key={p.key} className="text-center">{p.label}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staffList.map(staff => {
                                const user = staff.userId;
                                if (!user) return null; // Fallback if population failed
                                const isAdmin = user.role === 'admin';

                                return (
                                    <TableRow key={staff._id}>
                                        <TableCell>
                                            <div className="font-medium">{staff.fullName}</div>
                                            <div className="text-xs text-muted-foreground">{staff.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">{staff.position}</Badge>
                                        </TableCell>
                                        {PERMISSIONS.map(p => {
                                            const hasPermission = user.permissions?.includes(p.key);
                                            return (
                                                <TableCell key={p.key} className="text-center">
                                                    <Checkbox
                                                        checked={isAdmin || hasPermission}
                                                        disabled={isAdmin || saving === user._id}
                                                        onCheckedChange={() => handlePermissionToggle(user._id, p.key, user.permissions)}
                                                    />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default PermissionManagement;
