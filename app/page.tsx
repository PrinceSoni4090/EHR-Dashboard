"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout";
import StatsCards from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { patientApi } from "@/lib/api";
import { Patient } from "@/types/fhir";
import { format, isToday, parseISO, compareAsc } from "date-fns";

export default function DashboardPage() {
	const [currentTime, setCurrentTime] = useState(new Date());
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Patients via FHIR API
        const p = await patientApi.search();
        const pList = p.entry?.map(e => e.resource) || [];
        setPatients(pList);
        // Appointments via mock endpoint
        const res = await fetch('https://fd4c78c2-c031-4081-ae2a-49d2adcda12a.mock.pstmn.io/Appointment');
        const data = await res.json();
        const aList = data.entry?.map((e: any) => e.resource) || [];
        setAppointments(aList);
      } catch (e: any) {
        console.error('Dashboard load error:', e);
        setError(e?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getPatientName = (p: Patient) => {
    const n = p.name?.[0];
    const given = n?.given?.join(' ') || '';
    const family = n?.family || '';
    return `${given} ${family}`.trim() || 'Unknown Patient';
  };

  const todayCount = appointments.filter(a => a?.start && isToday(parseISO(a.start))).length;
  const completedCount = appointments.filter(a => a?.status === 'fulfilled').length;

  // Simple previews: latest 5 patients by meta.lastUpdated (fallback to as-is) and upcoming 5 appointments by start
  const patientsPreview = [...patients].slice(0, 5);
  const apptPreview = [...appointments]
    .filter(a => !!a?.start)
    .sort((a, b) => compareAsc(parseISO(a.start), parseISO(b.start)))
    .slice(0, 5);

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
						<p className="text-gray-600">
							Welcome back, Dr. Prince. Today is{" "}
							{currentTime.toLocaleDateString("en-US", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</div>
				</div>

				{/* Stats Cards */}
				<StatsCards
				  stats={{
					  totalPatients: patients.length,
					  todayAppointments: todayCount,
					  activeConditions: 0,
					  completedAppointments: completedCount,
				  }}
				/>



				{/* Upcoming Appointments Preview */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg font-semibold">Upcoming Appointments</CardTitle>
						<Link href="/appointments">
							<Button variant="outline" size="sm">
								View All
							</Button>
						</Link>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{!loading && apptPreview.length === 0 && (
								<p className="text-gray-500 text-sm">No upcoming appointments.</p>
							)}
							{apptPreview.map((a, idx) => (
								<div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
									<div className="flex items-center space-x-3">
										<div>
											<p className="font-medium">{a?.patient?.name || 'Unknown Patient'}</p>
											<p className="text-xs text-gray-600">{a?.description || 'Appointment'}</p>
										</div>
									</div>
									<div className="text-right">
										<div className="text-sm text-gray-700 font-medium">
											{format(parseISO(a.start), 'EEE, MMM d')}
										</div>
										<div className="text-xs text-gray-500">
											{format(parseISO(a.start), 'p')} – {format(parseISO(a.end), 'p')}
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Patients Preview */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg font-semibold">
							Recent Patients
						</CardTitle>
						<Link href="/patients">
							<Button variant="outline" size="sm">View All</Button>
						</Link>
					</CardHeader>
					<CardContent>
						<div className="divide-y">
							{!loading && patientsPreview.length === 0 && (
								<p className="text-gray-500 text-sm py-3">No patients found.</p>
							)}
							{patientsPreview.map((p, i) => (
								<div key={i} className="flex items-center justify-between py-3">
									<div>
										<p className="font-medium">{getPatientName(p)}</p>
										<p className="text-xs text-gray-600">{p.gender || 'unknown'} {p.birthDate ? `• ${format(new Date(p.birthDate), 'PPP')}` : ''}</p>
									</div>
									<Link href="/patients">
										<Button variant="ghost" size="sm">Open</Button>
									</Link>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

			</div>
		</DashboardLayout>
	);
}
