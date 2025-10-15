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
import { Badge } from '@/components/ui/badge';
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
  Loader2,
  Search,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { getActivityLogs } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { ActivityLog, ActivityLogsFilters } from '@/types/admin';

export function ActivityLogsViewer() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ActivityLogsFilters>({});
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getActivityLogs({ ...filters, limit: 100 });
      setLogs(data);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בטעינת לוגים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: ActivityLog['actionType']) => {
    const badges: Record<
      ActivityLog['actionType'],
      {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
      }
    > = {
      CREATE: { label: 'יצירה', variant: 'default' },
      UPDATE: { label: 'עדכון', variant: 'secondary' },
      DELETE: { label: 'מחיקה', variant: 'destructive' },
      LOGIN: { label: 'כניסה', variant: 'outline' },
      LOGOUT: { label: 'יציאה', variant: 'outline' },
      APPROVE: { label: 'אישור', variant: 'default' },
      DEACTIVATE: { label: 'השבתה', variant: 'destructive' },
      REACTIVATE: { label: 'הפעלה מחדש', variant: 'default' },
    };

    const badge = badges[action];
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const getEntityTypeBadge = (entityType: ActivityLog['entityType']) => {
    const labels: Record<ActivityLog['entityType'], string> = {
      TRIP: 'טיול',
      FAMILY: 'משפחה',
      GEAR_ITEM: 'ציוד',
      USER: 'משתמש',
      WHATSAPP_TEMPLATE: 'תבנית WhatsApp',
      WHATSAPP_MESSAGE: 'הודעת WhatsApp',
    };

    return <Badge variant="outline">{labels[entityType]}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;

    return (
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>לוג פעילות מערכת</CardTitle>
        <CardDescription>צפה בכל הפעולות שבוצעו במערכת</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="חיפוש לפי משתמש או ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
            />
          </div>

          <Select
            value={filters.entityType || 'all'}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                entityType:
                  value === 'all'
                    ? undefined
                    : (value as ActivityLog['entityType']),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="סוג ישות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הישויות</SelectItem>
              <SelectItem value="TRIP">טיול</SelectItem>
              <SelectItem value="FAMILY">משפחה</SelectItem>
              <SelectItem value="GEAR_ITEM">ציוד</SelectItem>
              <SelectItem value="USER">משתמש</SelectItem>
              <SelectItem value="WHATSAPP_TEMPLATE">תבנית WhatsApp</SelectItem>
              <SelectItem value="WHATSAPP_MESSAGE">הודעת WhatsApp</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.actionType || 'all'}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                actionType:
                  value === 'all'
                    ? undefined
                    : (value as ActivityLog['actionType']),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="סוג פעולה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הפעולות</SelectItem>
              <SelectItem value="CREATE">יצירה</SelectItem>
              <SelectItem value="UPDATE">עדכון</SelectItem>
              <SelectItem value="DELETE">מחיקה</SelectItem>
              <SelectItem value="LOGIN">כניסה</SelectItem>
              <SelectItem value="LOGOUT">יציאה</SelectItem>
              <SelectItem value="APPROVE">אישור</SelectItem>
              <SelectItem value="DEACTIVATE">השבתה</SelectItem>
              <SelectItem value="REACTIVATE">הפעלה מחדש</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="mr-2">טוען לוגים...</span>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך ושעה</TableHead>
                  <TableHead className="text-right">משתמש</TableHead>
                  <TableHead className="text-right">פעולה</TableHead>
                  <TableHead className="text-right">סוג ישות</TableHead>
                  <TableHead className="text-right">מזהה ישות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileText className="h-8 w-8" />
                        <p>לא נמצאו לוגים</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-right text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {log.userName || log.userId}
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.actionType)}</TableCell>
                      <TableCell>
                        {getEntityTypeBadge(log.entityType)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {log.entityId}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          סך הכל: {filteredLogs.length} פעולות
        </div>
      </CardContent>
    </Card>
  );
}
