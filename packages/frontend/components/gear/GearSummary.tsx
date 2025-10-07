'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { getGearSummary } from '@/lib/api';
import { GearSummary as GearSummaryType } from '@/types/gear';

interface GearSummaryProps {
  tripId: string;
}

export default function GearSummary({ tripId }: GearSummaryProps) {
  const [summary, setSummary] = useState<GearSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGearSummary(tripId);
        setSummary(data);
      } catch (err) {
        console.error('Error loading gear summary:', err);
        setError('שגיאה בטעינת סיכום הציוד');
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [tripId]);

  if (loading) {
    return (
      <Card dir="rtl">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">טוען סיכום...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !summary) {
    return null;
  }

  const completionRate = summary.totalQuantityNeeded > 0
    ? Math.round((summary.totalQuantityAssigned / summary.totalQuantityNeeded) * 100)
    : 0;

  return (
    <Card dir="rtl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle>סיכום ציוד</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{summary.totalItems}</div>
            <div className="text-xs text-muted-foreground mt-1">סה&quot;כ פריטים</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {summary.fullyAssignedItems}
              </div>
            </div>
            <div className="text-xs text-green-700 mt-1">הוקצה במלואו</div>
          </div>

          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {summary.partiallyAssignedItems}
              </div>
            </div>
            <div className="text-xs text-orange-700 mt-1">הוקצה חלקית</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <XCircle className="h-4 w-4 text-gray-600" />
              <div className="text-2xl font-bold text-gray-600">
                {summary.unassignedItems}
              </div>
            </div>
            <div className="text-xs text-gray-700 mt-1">לא הוקצה</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">התקדמות כוללת</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                completionRate === 100
                  ? 'bg-green-600'
                  : completionRate > 50
                  ? 'bg-orange-500'
                  : 'bg-gray-400'
              }`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>
              {summary.totalQuantityAssigned} מתוך {summary.totalQuantityNeeded} יחידות
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
