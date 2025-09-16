'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'appointment' | 'patient' | 'condition' | 'medication';
  action: string;
  patient: {
    name: string;
    id: string;
  };
  timestamp: Date;
  status?: 'completed' | 'pending' | 'cancelled';
}

interface RecentActivityProps {
  activities?: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const defaultActivities: Activity[] = [
    {
      id: '1',
      type: 'appointment',
      action: 'Appointment completed',
      patient: { name: 'John Smith', id: 'PAT001' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: 'completed'
    },
    {
      id: '2',
      type: 'patient',
      action: 'New patient registered',
      patient: { name: 'Emily Johnson', id: 'PAT002' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: '3',
      type: 'condition',
      action: 'Condition updated',
      patient: { name: 'Michael Davis', id: 'PAT003' },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      id: '4',
      type: 'medication',
      action: 'Prescription issued',
      patient: { name: 'Sarah Wilson', id: 'PAT004' },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      id: '5',
      type: 'appointment',
      action: 'Appointment scheduled',
      patient: { name: 'Robert Brown', id: 'PAT005' },
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      status: 'pending'
    }
  ];

  const data = activities || defaultActivities;

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-500';
      case 'patient':
        return 'bg-green-500';
      case 'condition':
        return 'bg-yellow-500';
      case 'medication':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      completed: 'default',
      pending: 'secondary',
      cancelled: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'default'} className="ml-2 text-xs">
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                    {getStatusBadge(activity.status)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center mt-1 space-x-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {activity.patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-gray-600">
                    {activity.patient.name} • {activity.patient.id}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}