'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  User,
  Calendar,
  Database,
} from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userAvatar?: string;
  action: 'create' | 'update' | 'delete' | 'login';
  entityType: 'Trip' | 'Family' | 'Gear' | 'User';
  entityName: string;
  details: Record<string, unknown>;
}

export default function ActivityLogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data
  const activityLog: ActivityLogEntry[] = [
    {
      id: '1',
      timestamp: '2024-03-15T14:30:00Z',
      userName: 'שרה מנהלת',
      userAvatar: '/placeholder.svg?height=32&width=32',
      action: 'create',
      entityType: 'Trip',
      entityName: 'טיול לגן לאומי עין גדי',
      details: { location: 'עין גדי', date: '2024-04-15', status: 'draft' },
    },
    {
      id: '2',
      timestamp: '2024-03-15T13:45:00Z',
      userName: 'דוד כהן',
      action: 'update',
      entityType: 'Family',
      entityName: 'משפחת כהן',
      details: { dietary_info: 'צמחוני', attendance: true },
    },
    {
      id: '3',
      timestamp: '2024-03-15T12:20:00Z',
      userName: 'אדמין ראשי',
      userAvatar: '/placeholder.svg?height=32&width=32',
      action: 'delete',
      entityType: 'Gear',
      entityName: 'כיסאות ישנים',
      details: { reason: 'פריטים פגומים' },
    },
    {
      id: '4',
      timestamp: '2024-03-15T11:15:00Z',
      userName: 'רחל אברהם',
      action: 'login',
      entityType: 'User',
      entityName: 'רחל אברהם',
      details: { ip: '192.168.1.100', device: 'mobile' },
    },
    {
      id: '5',
      timestamp: '2024-03-15T10:30:00Z',
      userName: 'יוסי מארגן',
      userAvatar: '/placeholder.svg?height=32&width=32',
      action: 'update',
      entityType: 'Trip',
      entityName: 'קמפינג בגליל',
      details: { status: 'published', admin_assigned: 'יוסי מארגן' },
    },
    {
      id: '6',
      timestamp: '2024-03-15T09:45:00Z',
      userName: 'מיכל לוי',
      action: 'create',
      entityType: 'Family',
      entityName: 'משפחת לוי',
      details: { members: 3, status: 'pending' },
    },
    {
      id: '7',
      timestamp: '2024-03-15T08:20:00Z',
      userName: 'אדמין ראשי',
      userAvatar: '/placeholder.svg?height=32&width=32',
      action: 'update',
      entityType: 'User',
      entityName: 'שרה מנהלת',
      details: { role: 'מנהל טיול', previous_role: 'משתתף' },
    },
    {
      id: '8',
      timestamp: '2024-03-14T16:30:00Z',
      userName: 'דוד כהן',
      action: 'create',
      entityType: 'Gear',
      entityName: 'אוהלים חדשים',
      details: { quantity: 5, assigned_to: 'משפחת כהן' },
    },
  ];

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return (
          <Badge className="bg-secondary text-secondary-foreground">
            יצירה
          </Badge>
        );
      case 'update':
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            עדכון
          </Badge>
        );
      case 'delete':
        return <Badge variant="destructive">מחיקה</Badge>;
      case 'login':
        return <Badge variant="secondary">כניסה</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'Trip':
        return <Database className="w-4 h-4 text-primary" />;
      case 'Family':
        return <User className="w-4 h-4 text-secondary" />;
      case 'Gear':
        return <Activity className="w-4 h-4 text-muted-foreground" />;
      case 'User':
        return <User className="w-4 h-4 text-accent" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDetails = (details: Record<string, unknown>) => {
    return JSON.stringify(details, null, 0).slice(0, 100) + '...';
  };

  const filteredLog = activityLog.filter((entry) => {
    const matchesSearch =
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntityFilter =
      entityFilter === 'all' || entry.entityType === entityFilter;
    const matchesActionFilter =
      actionFilter === 'all' || entry.action === actionFilter;
    return matchesSearch && matchesEntityFilter && matchesActionFilter;
  });

  const totalPages = Math.ceil(filteredLog.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLog = filteredLog.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">יומן פעילות</h1>
            <p className="text-muted-foreground">
              מעקב אחר פעולות משתמשים ושינויים במערכת
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm font-medium">אדמין ראשי</p>
              <p className="text-xs text-muted-foreground">סופר אדמין</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="חיפוש לפי משתמש, ישות או פעולה..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-right"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="סוג ישות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הישויות</SelectItem>
                    <SelectItem value="Trip">טיולים</SelectItem>
                    <SelectItem value="Family">משפחות</SelectItem>
                    <SelectItem value="Gear">ציוד</SelectItem>
                    <SelectItem value="User">משתמשים</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="פעולה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הפעולות</SelectItem>
                    <SelectItem value="create">יצירה</SelectItem>
                    <SelectItem value="update">עדכון</SelectItem>
                    <SelectItem value="delete">מחיקה</SelectItem>
                    <SelectItem value="login">כניסה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              יומן פעילות ({filteredLog.length} רשומות)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">פרטים</TableHead>
                    <TableHead className="text-right">ישות</TableHead>
                    <TableHead className="text-right">פעולה</TableHead>
                    <TableHead className="text-right">משתמש</TableHead>
                    <TableHead className="text-right">תאריך</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLog.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="max-w-xs">
                        <code className="text-xs bg-muted p-1 rounded text-right block">
                          {formatDetails(entry.details)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEntityIcon(entry.entityType)}
                          <div className="text-right">
                            <div className="font-medium text-sm">
                              {entry.entityName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {entry.entityType}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(entry.action)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-medium text-sm">
                              {entry.userName}
                            </div>
                          </div>
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={entry.userAvatar || '/placeholder.svg'}
                            />
                            <AvatarFallback className="text-xs">
                              {entry.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                מציג {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredLog.length)} מתוך{' '}
                {filteredLog.length} רשומות
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                  הקודם
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  הבא
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
