"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/layout";
import PatientSearch from "@/components/patients/patient-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Eye, Edit, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { patientApi, handleApiError } from "@/lib/api";
import { Patient, PatientSearchParams } from "@/types/fhir";
import { format } from "date-fns";

export default function PatientsPage() {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
	const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAllPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await patientApi.search();
        const patients = response.entry?.map((entry) => entry.resource) || [];
        setAllPatients(patients);
        setFilteredPatients(patients);
      } catch (err: any) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
        console.error("Error loading patients:", err);
      } finally {
        setLoading(false);
      }
    };
		fetchAllPatients();
	}, []);

	const handleSearch = useCallback((params: PatientSearchParams) => {
    setLoading(true);
    let results = [...allPatients];

    if (params.name) {
      results = results.filter(p => 
        getPatientName(p).toLowerCase().includes(params.name?.toLowerCase() || '')
      );
    }
    if (params.identifier) {
      const needle = params.identifier.toLowerCase();
      results = results.filter(p => {
        const idMatch = (p.id || '').toLowerCase().includes(needle);
        const identifiers = p.identifier || [];
        const identifierMatch = identifiers.some(i => (i.value || '').toLowerCase().includes(needle));
        return idMatch || identifierMatch;
      });
    }
    if (params.birthdate) {
      results = results.filter(p => p.birthDate === params.birthdate);
    }
    if (params.gender) {
      results = results.filter(p => p.gender === params.gender);
    }

    setFilteredPatients(results);
    setLoading(false);
  }, [allPatients]);

  const handleClear = useCallback(() => {
    setFilteredPatients(allPatients);
  }, [allPatients]);

	const getPatientName = (patient: Patient): string => {
		const name = patient.name?.[0];
		if (!name) return "Unknown Patient";

		const given = name.given?.join(" ") || "";
		const family = name.family || "";
		return `${given} ${family}`.trim();
	};

	const getPatientContact = (patient: Patient) => {
		const phone = patient.telecom?.find((t) => t.system === "phone")?.value;
		const email = patient.telecom?.find((t) => t.system === "email")?.value;
		return { phone, email };
	};

	const getPatientAddress = (patient: Patient): string => {
		const address = patient.address?.[0];
		if (!address) return "No address on file";

		const line = address.line?.join(", ") || "";
		const city = address.city || "";
		const state = address.state || "";
		const postal = address.postalCode || "";

		return `${line}, ${city}, ${state} ${postal}`
			.replace(/^,\s*/, "")
			.replace(/,\s*$/, "");
	};

  const getPatientIdentifier = (patient: Patient): string | undefined => {
    const identifiers = patient.identifier || [];
    if (!identifiers.length) return undefined;
    const preferred =
      identifiers.find((i) =>
        (i.system || "").toLowerCase().includes("mrn") || (i.type?.text || "").toLowerCase().includes("mrn")
      ) || identifiers[0];
    return preferred.value;
  };

	return (
		<DashboardLayout>
		  <div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
			  <div>
				<h1 className="text-2xl font-bold text-gray-900">Patients</h1>
				<p className="text-gray-600">
				  Manage patient records and information
				</p>
			  </div>
			  <Link href="/patients/new">
				<Button>
				  <Plus className="h-4 w-4 mr-2" />
				  Add Patient
				</Button>
			  </Link>
			</div>
	  
			{/* Search */}
			<PatientSearch onSearch={handleSearch} onClear={handleClear} loading={loading} debounceMs={800} />
	  
			{/* Error State */}
			{error && (
			  <Card className="border-red-200 bg-red-50">
				<CardContent className="pt-6">
				  <p className="text-red-600">Error loading patients: {error}</p>
				  <p className="text-sm text-red-500 mt-1">
					Showing demo data for now.
				  </p>
				</CardContent>
			  </Card>
			)}
	  
			{/* Results */}
			<Card>
			  <CardHeader>
				<CardTitle className="text-lg">
				  Patient Records ({filteredPatients.length})
				</CardTitle>
			  </CardHeader>
			  <CardContent>
				{loading && (
				  <div className="text-center py-10">
					<p>Loading patients...</p>
				  </div>
				)}
				{!loading && !error && filteredPatients.length > 0 && (
				  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredPatients.map((patient) => (
					  <Card key={patient.id} className="overflow-hidden">
						<CardHeader className="bg-gray-50 p-4 border-b">
						  <div className="flex items-center space-x-4">
							<Avatar>
							  <AvatarFallback>
								{getPatientName(patient).charAt(0)}
							  </AvatarFallback>
							</Avatar>
							<div>
							  <CardTitle className="text-base font-semibold">
								{getPatientName(patient)}
							  </CardTitle>
							  {/* Show external identifier (e.g., MRN) when available */}
							  {getPatientIdentifier(patient) && (
                                <div className="text-xs text-gray-600 mt-0.5">
                                  ID: <span className="font-medium">{getPatientIdentifier(patient)}</span>
                                </div>
                              )}
							  <div className="text-sm text-gray-500">
								<Badge variant={patient.active ? "default" : "secondary"}>
								  {patient.active ? "Active" : "Inactive"}
								</Badge>
								<span className="mx-1">•</span>
								<span>
								  {patient.gender} • Born{" "}
								  {patient.birthDate
									? format(new Date(patient.birthDate), "PPP")
									: "N/A"}
								</span>
							  </div>
							</div>
						  </div>
						</CardHeader>
						<CardContent className="p-4 space-y-3">
						  <div className="flex items-center text-sm text-gray-600">
							<Phone className="h-4 w-4 mr-2 flex-shrink-0" />
							<span>{getPatientContact(patient).phone || "No phone"}</span>
						  </div>
						  <div className="flex items-center text-sm text-gray-600">
							<Mail className="h-4 w-4 mr-2 flex-shrink-0" />
							<span>{getPatientContact(patient).email || "No email"}</span>
						  </div>
						  <div className="flex items-start text-sm text-gray-600">
							<MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
							<span>{getPatientAddress(patient)}</span>
						  </div>
						  <div className="flex justify-end space-x-2 pt-2">
							<Button variant="outline" size="sm">
							  <Eye className="h-4 w-4 mr-1" />
							  View
							</Button>
							<Button variant="secondary" size="sm">
							  <Edit className="h-4 w-4 mr-1" />
							  Edit
							</Button>
						  </div>
						</CardContent>
					  </Card>
					))}
				  </div>
				)}
				{!loading && !error && filteredPatients.length === 0 && (
				  <div className="text-center py-10">
					<p className="text-gray-500">No patients found.</p>
				  </div>
				)}
			  </CardContent>
			</Card>
		  </div>
		</DashboardLayout>
	  );
}
