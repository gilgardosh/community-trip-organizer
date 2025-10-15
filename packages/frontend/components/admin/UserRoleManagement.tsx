'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Shield,
  Crown,
  UserCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getAllUsers, updateUserRole } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { AdminUser, UpdateUserRoleData } from '@/types/admin';
import type { Role } from '@/types/auth';

export function UserRoleManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<Role | ''>('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בטעינת משתמשים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setUpdating(true);
      const data: UpdateUserRoleData = { role: newRole };
      await updateUserRole(selectedUser.id, data);

      toast({
        title: 'הצלחה',
        description: `תפקיד של ${selectedUser.name} עודכן ל-${getRoleDisplayName(newRole)}`,
      });

      setSelectedUser(null);
      setNewRole('');
      await loadUsers();
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בעדכון תפקיד',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <Badge className="bg-primary text-primary-foreground">
            <Crown className="w-3 h-3 ml-1" />
            סופר אדמין
          </Badge>
        );
      case 'TRIP_ADMIN':
        return (
          <Badge className="bg-secondary text-secondary-foreground">
            <Shield className="w-3 h-3 ml-1" />
            מנהל טיול
          </Badge>
        );
      case 'FAMILY':
        return (
          <Badge variant="outline">
            <UserCheck className="w-3 h-3 ml-1" />
            משפחה
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getRoleDisplayName = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'סופר אדמין';
      case 'TRIP_ADMIN':
        return 'מנהל טיול';
      case 'FAMILY':
        return 'משפחה';
      default:
        return role;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="mr-2">טוען משתמשים...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>ניהול תפקידי משתמשים</CardTitle>
          <CardDescription>
            נהל תפקידים והרשאות של משתמשים במערכת
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="חיפוש לפי שם או אימייל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as Role | 'all')}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל התפקידים</SelectItem>
                <SelectItem value="SUPER_ADMIN">סופר אדמין</SelectItem>
                <SelectItem value="TRIP_ADMIN">מנהל טיול</SelectItem>
                <SelectItem value="FAMILY">משפחה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">פעולות</TableHead>
                  <TableHead className="text-right">תפקיד</TableHead>
                  <TableHead className="text-right">אימייל</TableHead>
                  <TableHead className="text-right">שם</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-8 w-8" />
                        <p>לא נמצאו משתמשים</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                          }}
                        >
                          שנה תפקיד
                        </Button>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {user.email || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.type === 'adult' ? 'מבוגר' : 'ילד'}
                            </div>
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profilePhotoUrl} />
                            <AvatarFallback className="text-xs">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            סך הכל: {filteredUsers.length} משתמשים
          </div>
        </CardContent>
      </Card>

      {/* Update Role Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>עדכון תפקיד משתמש</DialogTitle>
            <DialogDescription>
              שנה את התפקיד של {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">תפקיד נוכחי:</label>
              <div>{selectedUser && getRoleBadge(selectedUser.role)}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">תפקיד חדש:</label>
              <Select
                value={newRole}
                onValueChange={(value) => setNewRole(value as Role)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר תפקיד" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">סופר אדמין</SelectItem>
                  <SelectItem value="TRIP_ADMIN">מנהל טיול</SelectItem>
                  <SelectItem value="FAMILY">משפחה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUser(null);
                setNewRole('');
              }}
              disabled={updating}
            >
              ביטול
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={!newRole || newRole === selectedUser?.role || updating}
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  מעדכן...
                </>
              ) : (
                'עדכן תפקיד'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
