'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { GearItem, getGearItemStatus } from '@/types/gear';

interface GearStatusIndicatorProps {
  gearItem: GearItem;
  showIcon?: boolean;
}

export default function GearStatusIndicator({
  gearItem,
  showIcon = true,
}: GearStatusIndicatorProps) {
  const status = getGearItemStatus(gearItem);

  const statusConfig = {
    complete: {
      label: 'הוקצה במלואו',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
      icon: CheckCircle,
    },
    partial: {
      label: 'הוקצה חלקית',
      variant: 'secondary' as const,
      className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      icon: AlertCircle,
    },
    unassigned: {
      label: 'לא הוקצה',
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      icon: XCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="h-3 w-3 ml-1" />}
      {config.label}
    </Badge>
  );
}
