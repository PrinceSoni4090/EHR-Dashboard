"use client";

import { ReactNode } from "react";
import Navigation from "./navigation";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
	children: ReactNode;
	className?: string;
}

export default function DashboardLayout({
	children,
	className,
}: DashboardLayoutProps) {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />

			{/* Main content */}
			<div className="lg:pl-72">
				<main className={cn("flex-1 p-4 lg:p-8", className)}>{children}</main>
			</div>
		</div>
	);
}
