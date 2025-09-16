"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Plus, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const quickActions = [
		{
			title: "New Patient",
			description: "Register a new patient",
			icon: Users,
			href: "/patients/new",
			color: "bg-blue-500 hover:bg-blue-600",
		},
		{
			title: "Schedule Appointment",
			description: "Book a new appointment",
			icon: Calendar,
			href: "/appointments/new",
			color: "bg-green-500 hover:bg-green-600",
		},
		{
			title: "Add Condition",
			description: "Record medical condition",
			icon: Activity,
			href: "/conditions/new",
			color: "bg-yellow-500 hover:bg-yellow-600",
		},
	];

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
				<StatsCards />

				{/* Quick Actions and Recent Activity */}
				<div className="grid gap-6 lg:grid-cols-3">
					{/* Quick Actions */}
					<div className="lg:col-span-1">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg font-semibold">
									Quick Actions
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{quickActions.map((action, index) => (
									<Link key={index} href={action.href}>
										<Button
											variant="outline"
											className="w-full justify-start h-auto p-4 hover:shadow-md transition-shadow"
										>
											<div className={`p-2 rounded-lg ${action.color} mr-3`}>
												<action.icon className="h-4 w-4 text-white" />
											</div>
											<div className="text-left">
												<div className="font-medium">{action.title}</div>
												<div className="text-xs text-gray-500">
													{action.description}
												</div>
											</div>
										</Button>
									</Link>
								))}
							</CardContent>
						</Card>
					</div>

					{/* Recent Activity */}
					<div className="lg:col-span-2">
						<RecentActivity />
					</div>
				</div>

				{/* Today's Schedule Preview */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg font-semibold">
							Today's Appointments
						</CardTitle>
						<Link href="/appointments">
							<Button variant="outline" size="sm">
								View All
							</Button>
						</Link>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{/* Sample appointments */}
							{/* <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
								<div className="flex items-center space-x-3">
									<div className="text-blue-600 font-mono text-sm">09:00</div>
									<div>
										<p className="font-medium">John Smith</p>
										<p className="text-sm text-gray-600">Annual checkup</p>
									</div>
								</div>
								<div className="text-blue-600 text-sm">Room 101</div>
							</div> */}

							{/* <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
								<div className="flex items-center space-x-3">
									<div className="text-green-600 font-mono text-sm">10:30</div>
									<div>
										<p className="font-medium">Emily Johnson</p>
										<p className="text-sm text-gray-600">Follow-up visit</p>
									</div>
								</div>
								<div className="text-green-600 text-sm">Room 102</div>
							</div> */}

							{/* <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
								<div className="flex items-center space-x-3">
									<div className="text-yellow-600 font-mono text-sm">14:00</div>
									<div>
										<p className="font-medium">Michael Davis</p>
										<p className="text-sm text-gray-600">Consultation</p>
									</div>
								</div>
								<div className="text-yellow-600 text-sm">Room 103</div>
							</div> */}
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}
