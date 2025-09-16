'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar} from 'lucide-react';

interface StatsCardsProps {
  stats?: {
    totalPatients?: number;
    todayAppointments?: number;
    activeConditions?: number;
    completedAppointments?: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const defaultStats = {
    totalPatients: 1247,
    todayAppointments: 23,
    activeConditions: 89,
    completedAppointments: 156
  };

  // Merge provided stats with defaults to guarantee defined values
  const data = { ...defaultStats, ...(stats || {}) };

  const cards = [
    {
      title: 'Total Patients',
      value: data.totalPatients.toLocaleString(),
      icon: Users,
      description: '+12 from last month',
      trend: 'up'
    },
    {
      title: "Today's Appointments",
      value: data.todayAppointments.toString(),
      icon: Calendar,
      description: '4 upcoming, 19 completed',
      trend: 'up'
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {card.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}