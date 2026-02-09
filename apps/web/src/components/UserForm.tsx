import { useState, useEffect, memo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Button,
    Input,
    Label,
    Select,
} from '@sdk-repo/sdk/components';
import type { User } from '@sdk-repo/sdk/api';

const ROLE_OPTIONS = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Developer', label: 'Developer' },
    { value: 'Designer', label: 'Designer' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Viewer', label: 'Viewer' },
];

interface UserFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; email: string; role: string }) => Promise<void>;
    initialData?: User | null;
}

export const UserForm = memo(function UserForm({
    open,
    onClose,
    onSubmit,
    initialData,
}: UserFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Developer',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                email: initialData.email,
                role: initialData.role,
            });
        } else {
            setFormData({ name: '', email: '', role: 'Developer' });
        }
        setErrors({});
    }, [initialData, open]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.role) {
            newErrors.role = 'Role is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit User' : 'Create New User'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Update user information below'
                            : 'Fill in the details to create a new user'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g. Rahul Kumar"
                        />
                        {errors.name && (
                            <p className="text-destructive text-sm">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="e.g. rahul@company.com"
                        />
                        {errors.email && (
                            <p className="text-destructive text-sm">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            id="role"
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({ ...formData, role: e.target.value })
                            }
                            options={ROLE_OPTIONS}
                        />
                        {errors.role && (
                            <p className="text-destructive text-sm">{errors.role}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading
                                ? 'Saving...'
                                : initialData
                                ? 'Update User'
                                : 'Create User'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
});
