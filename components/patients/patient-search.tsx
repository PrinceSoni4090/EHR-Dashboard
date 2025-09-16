"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { PatientSearchParams } from "@/types/fhir";
import { Badge } from "@/components/ui/badge";

interface PatientSearchProps {
  onSearch: (params: PatientSearchParams) => void;
  loading?: boolean;
  onClear?: () => void;
  debounceMs?: number;
}

export default function PatientSearch({
	onSearch,
	loading,
	onClear,
	debounceMs = 500, // Fixed: was 40000ms (40 seconds!)
  }: PatientSearchProps) {
	const [searchParams, setSearchParams] = useState<PatientSearchParams>({});
	const [showAdvanced, setShowAdvanced] = useState(false);
	const debounceTimer = useRef<NodeJS.Timeout>();
	const isInitialMount = useRef(true);
  
	// Cleanup timer on unmount
	useEffect(() => {
	  return () => {
		if (debounceTimer.current) {
		  clearTimeout(debounceTimer.current);
		}
	  };
	}, []);
  
	// Debounced search effect
	useEffect(() => {
	  // Skip initial mount to avoid triggering search on component load
	  if (isInitialMount.current) {
		isInitialMount.current = false;
		return;
	  }
  
	  // Clear existing timer
	  if (debounceTimer.current) {
		clearTimeout(debounceTimer.current);
	  }
  
	  // Set new timer
	  debounceTimer.current = setTimeout(() => {
		const filtered = getFilteredParams(searchParams);
		const hasFilters = Object.keys(filtered).length > 0;
		
		if (hasFilters) {
		  console.debug('[PatientSearch] debounced onSearch', filtered);
		  onSearch(filtered);
		} else {
		  console.debug('[PatientSearch] debounced onClear');
		  onClear?.();
		}
	  }, debounceMs);
  
	  // Cleanup function
	  return () => {
		if (debounceTimer.current) {
		  clearTimeout(debounceTimer.current);
		}
	  };
	}, [searchParams, debounceMs, onSearch, onClear]);
  
	const getFilteredParams = (params: PatientSearchParams): PatientSearchParams => {
	  return Object.entries(params).reduce((acc, [key, value]) => {
		if (value !== undefined && value !== null && value !== "" && value !== "all") {
		  acc[key as keyof PatientSearchParams] = value;
		}
		return acc;
	  }, {} as PatientSearchParams);
	};
  
	const handleQuickSearch = useCallback((value: string) => {
	  setSearchParams((prev) => ({ 
		...prev, 
		name: value.trim() || undefined 
	  }));
	}, []);

	const handleAdvancedSearch = useCallback(() => {
		setSearchParams(prev => ({ ...prev }));
	  }, []);
  
	const handleClear = useCallback(() => {
	  setSearchParams({});
	}, []);
  
	const activeFilters = Object.entries(searchParams).filter(
	  ([_, value]) => value !== undefined && value !== null && value !== "" && value !== "all"
	);

	return (
		<Card>
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Patient Search</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowAdvanced(!showAdvanced)}
					>
						<Filter className="h-4 w-4 mr-2" />
						{showAdvanced ? "Basic" : "Advanced"}
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Quick Search */}
				<div className="flex space-x-2">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by name, ID, or identifier..."
							value={searchParams.name || ""}
							onChange={(e) => {
								const value = e.target.value;
								handleQuickSearch(value);
							}}
							className="w-full pl-10"
							disabled={loading}
						/>
					</div>
					<Button
						onClick={handleClear}
						variant="outline"
						size="icon"
						disabled={activeFilters.length === 0}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Advanced Search */}
				{showAdvanced && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
						<div className="space-y-2">
							<Label htmlFor="identifier">ID/Identifier</Label>
							<Input
								id="identifier"
								placeholder="Patient ID or identifier"
								value={searchParams.identifier || ""}
								onChange={(e) =>
									setSearchParams((prev) => ({
										...prev,
										identifier: e.target.value || undefined,
									}))
								}
								disabled={loading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="given-name">Given Name</Label>
							<Input
								id="given-name"
								placeholder="First name"
								value={searchParams.given || ""}
								onChange={(e) =>
									setSearchParams((prev) => ({
										...prev,
										given: e.target.value || undefined,
									}))
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="identifier">Identifier</Label>
							<Input
								id="identifier"
								placeholder="Patient ID, SSN, etc."
								value={searchParams.identifier || ""}
								onChange={(e) =>
									setSearchParams((prev) => ({
										...prev,
										identifier: e.target.value || undefined,
									}))
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="gender">Gender</Label>
							<Select
								value={searchParams.gender ?? "all"}
								onValueChange={(value) =>
									setSearchParams((prev) => {
										const updated = { ...prev };
										if (value === "all") {
											delete updated.gender;
										} else {
											updated.gender = value as any;
										}
										return updated;
									})
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select gender" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="male">Male</SelectItem>
									<SelectItem value="female">Female</SelectItem>
									<SelectItem value="other">Other</SelectItem>
									<SelectItem value="unknown">Unknown</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="birthdate">Birth Date</Label>
							<Input
								id="birthdate"
								type="date"
								value={searchParams.birthdate || ""}
								onChange={(e) =>
									setSearchParams((prev) => ({
										...prev,
										birthdate: e.target.value,
									}))
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="active">Status</Label>
							<Select
								value={
									searchParams.active === undefined
										? "all"
										: searchParams.active === true
										? "true"
										: searchParams.active === false
										? "false"
										: "all"
								}
								onValueChange={(value) =>
									setSearchParams((prev) => {
										const updated = { ...prev };
										if (value === "all") {
											delete updated.active;
										} else {
											updated.active = value === "true";
										}
										return updated;
									})
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="true">Active</SelectItem>
									<SelectItem value="false">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="col-span-full flex space-x-2">
							<Button
								onClick={handleAdvancedSearch}
								disabled={loading}
								className="flex-1"
							>
								<Search className="h-4 w-4 mr-2" />
								{loading ? "Searching..." : "Search"}
							</Button>
							<Button
								onClick={handleClear}
								variant="outline"
								disabled={activeFilters.length === 0}
							>
								Clear All
							</Button>
						</div>
					</div>
				)}

				{/* Active Filters */}
				{activeFilters.length > 0 && (
					<div className="flex flex-wrap gap-2 pt-2 border-t">
						<span className="text-sm text-gray-500">Active filters:</span>
						{activeFilters.map(([key, value]) => (
							<Badge key={key} variant="secondary" className="text-xs">
								{key}: {value.toString()}
								<button
									onClick={() =>
										setSearchParams((prev) => ({
											...prev,
											[key]: undefined,
										}))
									}
									className="ml-2 hover:text-red-500"
								>
									×
								</button>
							</Badge>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
