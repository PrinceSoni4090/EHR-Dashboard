'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Clock, User, MapPin, Edit, X } from 'lucide-react';
import Link from 'next/link';
import { appointmentApi, handleApiError } from '@/lib/api';
import { Appointment, AppointmentSearchParams } from '@/types/fhir';
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );

  // Load appointments
  useEffect(() => {
    loadAppointments({ date: selectedDate });
  }, [selectedDate]);

  const loadAppointments = useCallback(async (params?: AppointmentSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await appointmentApi.search(params);
      setAppointments(response.entry?.map(entry => entry.resource) || []);
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCancelAppointment = useCallback(async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentApi.cancel(appointmentId);
      // Reload appointments
      loadAppointments({ date: selectedDate });
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      alert(`Error cancelling appointment: ${errorMessage}`);
    }
  }, [selectedDate, loadAppointments]);

  const getStatusBadge = (status: Appointment['status']) => {
    const statusConfig = {
      proposed: { label: 'Proposed', variant: 'secondary' as const },
      pending: { label: 'Pending', variant: 'secondary' as const },
      booked: { label: 'Booked', variant: 'default' as const },
      arrived: { label: 'Arrived', variant: 'default' as const },
      fulfilled: { label: 'Completed', variant: 'default' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const },
      noshow: { label: 'No Show', variant: 'destructive' as const }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getAppointmentTime = (start: string, end: string) => {
    const startTime = format(parseISO(start), 'h:mm a');
    const endTime = format(parseISO(end), 'h:mm a');
    return `${startTime} - ${endTime}`;
  };

  const getRelativeDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  };

  const getPatientName = (appointment: Appointment) => {
    const patient = appointment.participant?.find(p => 
      p.type?.some(t => t.coding?.some(c => c.code === 'PART'))
    );
    return patient?.actor?.display || 'Unknown Patient';
  };

  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const date = format(parseISO(appointment.start), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600">
              Manage patient appointments and scheduling
            </p>
          </div>
          <Link href="/appointments/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </Link>
        </div>

        {/* Date Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'))}
                >
                  Tomorrow
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">
                Error loading appointments: {error}
              </p>
              <p className="text-sm text-red-500 mt-1">
                Showing demo data for now.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Appointments List */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading appointments...</div>
              </div>
            </CardContent>
          </Card>
        ) : Object.keys(groupedAppointments).length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                No appointments found for the selected date.
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedAppointments)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dayAppointments]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>{getRelativeDate(dayAppointments[0].start)}</span>
                    <span className="text-sm font-normal text-gray-500">
                      ({dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dayAppointments
                    .sort((a, b) => a.start.localeCompare(b.start))
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-mono text-gray-900">
                              {format(parseISO(appointment.start), 'h:mm')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(parseISO(appointment.start), 'a')}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {getPatientName(appointment)}
                              </h3>
                              {getStatusBadge(appointment.status)}
                            </div>

                            <div className="space-y-1 text-sm text-gray-600">
                              {appointment.serviceType?.[0]?.coding?.[0]?.display && (
                                <p>{appointment.serviceType[0].coding[0].display}</p>
                              )}
                              
                              {appointment.description && (
                                <p>{appointment.description}</p>
                              )}

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Duration: {appointment.minutesDuration || 30} min
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>Room 101</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link href={`/appointments/${appointment.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          
                          {appointment.status !== 'cancelled' && appointment.status !== 'fulfilled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelAppointment(appointment.id!)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </DashboardLayout>
  );
}