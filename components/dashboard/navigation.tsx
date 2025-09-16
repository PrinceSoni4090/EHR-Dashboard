"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Users,
	Calendar,
	Activity,
	Pill,
	Shield,
	Settings,
	Menu,
	X,
	Home,
} from "lucide-react";

const navigation = [
	{
		name: "Dashboard",
		href: "/",
		icon: Home,
		description: "Overview and quick actions",
	},
	{
		name: "Patients",
		href: "/patients",
		icon: Users,
		description: "Patient management and records",
	},
	{
		name: "Appointments",
		href: "/appointments",
		icon: Calendar,
		description: "Schedule and manage appointments",
	},
	// {
	//   name: 'Conditions',
	//   href: '/conditions',
	//   icon: Activity,
	//   description: 'Medical conditions and diagnoses'
	// },
	// {
	//   name: 'Medications',
	//   href: '/medications',
	//   icon: Pill,
	//   description: 'Medication requests and prescriptions'
	// },
	// {
	//   name: 'Immunizations',
	//   href: '/immunizations',
	//   icon: Shield,
	//   description: 'Vaccination records'
	// }
];

interface NavigationProps {
	className?: string;
}

export default function Navigation({ className }: NavigationProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const pathname = usePathname();

	return (
		<>
			{/* Mobile menu button */}
			<div className="lg:hidden fixed top-4 left-4 z-50">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					className="bg-white shadow-md"
				>
					{mobileMenuOpen ? (
						<X className="h-4 w-4" />
					) : (
						<Menu className="h-4 w-4" />
					)}
				</Button>
			</div>

			{/* Mobile menu overlay */}
			{mobileMenuOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={() => setMobileMenuOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<nav
				className={cn(
					"fixed left-0 top-0 z-40 h-full w-72 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0",
					mobileMenuOpen
						? "translate-x-0"
						: "-translate-x-full lg:translate-x-0",
					className
				)}
			>
				<div className="flex h-full flex-col">
					{/* Header */}
					<div className="flex h-16 items-center border-b border-gray-200 px-6">
						<div className="flex items-center space-x-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
								<Activity className="h-5 w-5 text-white" />
							</div>
							<h1 className="text-xl font-semibold text-gray-900">
								HealthCare EHR
							</h1>
						</div>
					</div>

					{/* Main navigation */}
					<div className="flex-1 space-y-1 px-3 py-6">
						{navigation.map((item) => {
							const isActive =
								pathname === item.href ||
								(item.href !== "/" && pathname.startsWith(item.href));

							return (
								<Link
									key={item.name}
									href={item.href}
									onClick={() => setMobileMenuOpen(false)}
									className={cn(
										"group flex items-center rounded-lg p-3 text-sm font-medium transition-colors",
										isActive
											? "bg-blue-50 text-blue-700 border border-blue-200"
											: "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
									)}
								>
									<item.icon
										className={cn(
											"mr-3 h-5 w-5 flex-shrink-0",
											isActive
												? "text-blue-700"
												: "text-gray-400 group-hover:text-gray-500"
										)}
									/>
									<div className="flex-1">
										<div className="font-medium">{item.name}</div>
										<div className="text-xs text-gray-500 mt-0.5">
											{item.description}
										</div>
									</div>
								</Link>
							);
						})}
					</div>

					{/* Footer */}
					<div className="border-t border-gray-200 p-4">
						<div className="flex items-center space-x-3">
							<div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
								<span className="text-sm font-medium text-blue-600">DR</span>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-gray-900 truncate">
									Dr. Sarah Wilson
								</p>
								<p className="text-xs text-gray-500 truncate">
									Primary Care Physician
								</p>
							</div>
						</div>
					</div>
				</div>
			</nav>
		</>
	);
}
