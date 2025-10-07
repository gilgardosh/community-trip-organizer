import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { TripStatus } from '@/types/trip';
import { Calendar, CheckCircle, Clock, FileText } from 'lucide-react';

interface TripStatusBadgeProps {
  status: TripStatus;
  className?: string;
}

const statusConfig = {
  draft: {
    label: 'טיוטה',
    variant: 'secondary' as const,
    icon: FileText,
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  },
  upcoming: {
    label: 'קרוב',
    variant: 'default' as const,
    icon: Calendar,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
  active: {
    label: 'פעיל',
    variant: 'default' as const,
    icon: Clock,
    className: 'bg-green-100 text-green-700 hover:bg-green-200',
  },
  past: {
    label: 'הסתיים',
    variant: 'outline' as const,
    icon: CheckCircle,
    className: 'bg-gray-50 text-gray-500 hover:bg-gray-100',
  },
  published: {
    label: 'פורסם',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-700 hover:bg-green-200',
  },
};

export function TripStatusBadge({ status, className }: TripStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className} ${className || ''}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
}
