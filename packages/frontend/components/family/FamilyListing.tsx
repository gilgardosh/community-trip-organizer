'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert } from '@/components/ui/alert';
import { getFamilies } from '@/lib/api';
import type { Family, FamilyFilters } from '@/types/family';
import {
  Users,
  Search,
  Filter,
  Eye,
  UserCheck,
  Baby,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export default function FamilyListing() {
  const router = useRouter();
  const [families, setFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'PENDING' | 'APPROVED'
  >('all');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  useEffect(() => {
    loadFamilies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [families, searchQuery, statusFilter, activeFilter]);

  const loadFamilies = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getFamilies();
      setFamilies(data);
    } catch (err: any) {
      setError(err.message || 'אירעה שגיאה בטעינת רשימת המשפחות');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...families];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((family) => {
        const nameMatch = family.name?.toLowerCase().includes(query);
        const memberMatch = family.members.some(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.email.toLowerCase().includes(query),
        );
        return nameMatch || memberMatch;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((family) => family.status === statusFilter);
    }

    // Active filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((family) =>
        activeFilter === 'active' ? family.isActive : !family.isActive,
      );
    }

    setFilteredFamilies(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default">מאושר</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">ממתין</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewFamily = (familyId: string) => {
    router.push(`/family/${familyId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" dir="rtl">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">טוען רשימת משפחות...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4" dir="rtl">
        <Alert variant="destructive">{error}</Alert>
        <Button onClick={loadFamilies} className="mt-4">
          נסה שוב
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            רשימת משפחות ({filteredFamilies.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">חיפוש</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חפש לפי שם משפחה או חבר..."
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">סטטוס</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="all">הכל</option>
                <option value="PENDING">ממתין לאישור</option>
                <option value="APPROVED">מאושר</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">פעילות</label>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="all">הכל</option>
                <option value="active">פעיל</option>
                <option value="inactive">לא פעיל</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              מציג {filteredFamilies.length} מתוך {families.length} משפחות
            </span>
            {(searchQuery ||
              statusFilter !== 'all' ||
              activeFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setActiveFilter('all');
                }}
              >
                נקה סינון
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם משפחה</TableHead>
                  <TableHead>מבוגרים</TableHead>
                  <TableHead>ילדים</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>פעילות</TableHead>
                  <TableHead>תאריך הצטרפות</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFamilies.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      לא נמצאו משפחות
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFamilies.map((family) => {
                    const adults = family.members.filter(
                      (m) => m.type === 'ADULT',
                    );
                    const children = family.members.filter(
                      (m) => m.type === 'CHILD',
                    );

                    return (
                      <TableRow key={family.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold">
                              {(family.name || 'M').charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">
                                {family.name || 'משפחה ללא שם'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {family.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            {adults.length}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Baby className="h-4 w-4 text-muted-foreground" />
                            {children.length}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(family.status)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={family.isActive ? 'default' : 'secondary'}
                          >
                            {family.isActive ? 'פעיל' : 'לא פעיל'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(family.createdAt), 'dd/MM/yyyy', {
                              locale: he,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewFamily(family.id)}
                          >
                            <Eye className="h-4 w-4 ml-1" />
                            צפה
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">
              {families.length}
            </div>
            <div className="text-sm text-muted-foreground">
              סה&quot;כ משפחות
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">
              {families.filter((f) => f.status === 'PENDING').length}
            </div>
            <div className="text-sm text-muted-foreground">ממתינות לאישור</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">
              {families.filter((f) => f.status === 'APPROVED').length}
            </div>
            <div className="text-sm text-muted-foreground">מאושרות</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">
              {families.filter((f) => f.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">פעילות</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
