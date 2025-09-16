'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Stethoscope, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Types matching the mock API response
type MockAppointment = {
  resourceType: 'Appointment';
  id: string;
  status: 'booked' | 'cancelled' | 'pending' | 'fulfilled' | 'arrived' | 'noshow' | 'proposed';
  start: string; // ISO
  end: string;   // ISO
  patient: {
    id: string;
    name: string;
    gender?: string;
    medicalHistory?: string[];
    allergies?: string[];
  };
  provider?: {
    id: string;
    name: string;
    specialty?: string;
  };
  description?: string;
};

type MockBundle = {
  resourceType: 'Bundle';
  type: 'searchset' | 'collection';
  total?: number;
  entry?: Array<{ resource: MockAppointment }>;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<MockAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MockAppointment['status']>('all');
  const [is24h, setIs24h] = useState(false);
  const [selected, setSelected] = useState<MockAppointment | null>(null);

  const formatDateTime = (iso: string) => {
    const date = parseISO(iso);
    // Example: Sep 20, 2025 9:00 AM  or  Sep 20, 2025 09:00
    const timeFmt = is24h ? 'HH:mm' : 'p';
    return `${format(date, 'PPP')} ${format(date, timeFmt)}`;
  };

  const formatTimeOnly = (iso: string) => {
    const date = parseISO(iso);
    const timeFmt = is24h ? 'HH:mm' : 'h:mm a';
    return format(date, timeFmt);
  };

  const filtered = appointments.filter((a) => {
    const matchName = nameFilter
      ? (a.patient?.name || '').toLowerCase().includes(nameFilter.toLowerCase())
      : true;
    const matchStatus = statusFilter === 'all' ? true : a.status === statusFilter;
    return matchName && matchStatus;
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('https://fd4c78c2-c031-4081-ae2a-49d2adcda12a.mock.pstmn.io/Appointment');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MockBundle = await res.json();
        const items = data.entry?.map(e => e.resource) || [];
        setAppointments(items);
      } catch (e: any) {
        console.error('Error loading appointments:', e);
        setError(e?.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const renderStatusBadge = (status: MockAppointment['status']) => {
    const map: Record<MockAppointment['status'], { label: string; className: string }> = {
      booked:   { label: 'Booked',   className: 'bg-green-100 text-green-800 border-green-200' },
      cancelled:{ label: 'Cancelled',className: 'bg-gray-100 text-gray-800 border-gray-200' },
      pending:  { label: 'Pending',  className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      fulfilled:{ label: 'Completed',className: 'bg-blue-100 text-blue-800 border-blue-200' },
      arrived:  { label: 'Arrived',  className: 'bg-blue-100 text-blue-800 border-blue-200' },
      noshow:   { label: 'No Show',  className: 'bg-red-100 text-red-800 border-red-200' },
      proposed: { label: 'Proposed', className: 'bg-purple-100 text-purple-800 border-purple-200' },
    };
    const cfg = map[status] || map['pending'];
    return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${cfg.className}`}>{cfg.label}</span>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600">View upcoming and recent appointments</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Patient name</label>
                <Input
                  placeholder="Search by patient name..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">All</option>
                  <option value="booked">Booked</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                  <option value="fulfilled">Completed</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={() => setIs24h((v) => !v)} className="w-full">
                  Time: {is24h ? '24h' : '12h'}
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
            </CardContent>
          </Card>
        )}

        {/* Appointments List */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8 text-gray-500">
                Loading appointments...
              </div>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                No appointments found.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((appt) => (
              <Card key={appt.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center text-sm text-gray-800 font-medium">
                    <User className="h-4 w-4 mr-2" />
                    <span>{appt.patient?.name || 'Unknown Patient'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(parseISO(appt.start), 'PPP')}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Clock className="h-3.5 w-3.5 mr-2" />
                    <span>{formatTimeOnly(appt.start)} — {formatTimeOnly(appt.end)}</span>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button variant="outline" size="sm" onClick={() => setSelected(appt)}>View</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Details Modal */}
        <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Appointment #{selected?.id}</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  <div><span className="font-semibold">Status:</span> {selected.status}</div>
                  <div><span className="font-semibold">When:</span> {formatDateTime(selected.start)} — {formatDateTime(selected.end)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">Patient</div>
                  <div className="text-sm text-gray-800">{selected.patient?.name}{selected.patient?.gender ? ` • ${selected.patient.gender}` : ''}</div>
                  <div className="text-xs text-gray-600"><span className="font-semibold">Medical History:</span> {selected.patient?.medicalHistory?.length ? selected.patient.medicalHistory.join(', ') : 'N/A'}</div>
                  <div className="text-xs text-gray-600"><span className="font-semibold">Allergies:</span> {selected.patient?.allergies?.length ? selected.patient.allergies.join(', ') : 'N/A'}</div>
                </div>
                {selected.provider && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Provider</div>
                    <div className="text-sm text-gray-800">{selected.provider.name}{selected.provider.specialty ? ` — ${selected.provider.specialty}` : ''}</div>
                  </div>
                )}
                {selected.description && (
                  <div className="text-sm text-gray-700">
                    <div className="text-sm font-medium">Description</div>
                    <div>{selected.description}</div>
                  </div>
                )}
            </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}