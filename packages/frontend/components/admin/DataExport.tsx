'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Loader2, FileJson, FileSpreadsheet } from 'lucide-react';
import { exportData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { ExportDataRequest } from '@/types/admin';

export function DataExport() {
  const [dataType, setDataType] =
    useState<ExportDataRequest['dataType']>('all');
  const [fileFormat, setFileFormat] =
    useState<ExportDataRequest['format']>('json');
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setExporting(true);

      const request: ExportDataRequest = {
        dataType,
        format: fileFormat,
      };

      const result = await exportData(request);

      // Create a blob and download the file
      const blob = new Blob([result.data], { type: result.contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'הצלחה',
        description: 'הקובץ יוצא בהצלחה',
      });
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בייצוא הנתונים',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ייצוא נתונים</CardTitle>
        <CardDescription>
          ייצא נתוני מערכת לקובץ לצורכי גיבוי או ניתוח
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Type Selection */}
        <div className="space-y-2">
          <Label>סוג נתונים</Label>
          <Select
            value={dataType}
            onValueChange={(value) =>
              setDataType(value as ExportDataRequest['dataType'])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הנתונים</SelectItem>
              <SelectItem value="families">משפחות</SelectItem>
              <SelectItem value="trips">טיולים</SelectItem>
              <SelectItem value="users">משתמשים</SelectItem>
              <SelectItem value="logs">לוגים</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            בחר את סוג הנתונים שברצונך לייצא
          </p>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label>פורמט קובץ</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={fileFormat === 'json' ? 'default' : 'outline'}
              onClick={() => setFileFormat('json')}
              className="justify-start"
            >
              <FileJson className="h-4 w-4 ml-2" />
              JSON
            </Button>
            <Button
              type="button"
              variant={fileFormat === 'csv' ? 'default' : 'outline'}
              onClick={() => setFileFormat('csv')}
              className="justify-start"
            >
              <FileSpreadsheet className="h-4 w-4 ml-2" />
              CSV
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            JSON מתאים למערכות אחרות, CSV מתאים ל-Excel
          </p>
        </div>

        {/* Export Summary */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-semibold">סיכום ייצוא</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">סוג נתונים:</span>
              <span className="font-medium">
                {dataType === 'all' && 'כל הנתונים'}
                {dataType === 'families' && 'משפחות'}
                {dataType === 'trips' && 'טיולים'}
                {dataType === 'users' && 'משתמשים'}
                {dataType === 'logs' && 'לוגים'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">פורמט:</span>
              <span className="font-medium">{fileFormat.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="w-full"
          size="lg"
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              מייצא נתונים...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 ml-2" />
              ייצא נתונים
            </>
          )}
        </Button>

        {/* Info Message */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>שים לב:</strong> הנתונים המיוצאים כוללים מידע רגיש. שמור את
            הקובץ במקום מאובטח ואל תשתף אותו עם גורמים לא מורשים.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
