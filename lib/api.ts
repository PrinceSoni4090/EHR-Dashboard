import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  Patient,
  Appointment,
  Condition,
  MedicationRequest,
  Immunization,
  Bundle,
  PatientSearchParams,
  AppointmentSearchParams,
  OperationOutcome
} from '@/types/fhir';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/fhir+json',
    'Accept': 'application/fhir+json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 404) {
      console.error('Resource not found.');
    } else if (error.response?.status >= 500) {
      console.error('Server error. Please try again.');
    }
    return Promise.reject(error);
  }
);

// Helper function to build query string from search parameters
const buildQueryString = (params: Record<string, any>): string => {
  const fhirParams: string[] = [];
  
  // Map our UI params to FHIR search parameters
  if (params.name) {
    // Use standard equality for name matching for better mock API support
    fhirParams.push(`name=${encodeURIComponent(params.name)}`);
  }
  if (params.birthDate) {
    fhirParams.push(`birthdate=${encodeURIComponent(params.birthDate)}`);
  }
  if (params.gender) {
    fhirParams.push(`gender=${encodeURIComponent(params.gender)}`);
  }
  if (params.identifier) {
    fhirParams.push(`identifier=${encodeURIComponent(params.identifier)}`);
  }
  if (params.phone) {
    fhirParams.push(`telecom=phone|${encodeURIComponent(params.phone)}`);
  }
  if (params.email) {
    fhirParams.push(`email=${encodeURIComponent(params.email)}`);
  }
  if (params.address) {
    fhirParams.push(`address=${encodeURIComponent(params.address)}`);
  }
  
  return fhirParams.join('&');
};

// Patient API functions
export const patientApi = {
  // Search patients with optional filters
  search: async (params?: PatientSearchParams): Promise<Bundle<Patient>> => {
    const queryString = params ? buildQueryString(params) : '';
    const url = `/Patient${queryString ? `?${queryString}` : ''}`;
    console.log('FHIR API Request URL:', url);
    const response = await api.get(url);
    return response.data;
  },

  // Get patient by ID
  getById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/Patient/${id}`);
    return response.data;
  },

  // // Create new patient
  // create: async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
  //   const response = await api.post('/Patient', patient);
  //   return response.data;
  // },

  // // Update patient
  // update: async (id: string, patient: Patient): Promise<Patient> => {
  //   const response = await api.put(`/Patient/${id}`, patient);
  //   return response.data;
  // },

  // // Delete patient (soft delete - update active status)
  // delete: async (id: string): Promise<void> => {
  //   await api.delete(`/Patient/${id}`);
  // },
};

// Appointment API functions
// export const appointmentApi = {
//   // Search appointments
//   search: async (params?: AppointmentSearchParams): Promise<Bundle<Appointment>> => {
//     const queryString = params ? buildQueryString(params) : '';
//     const response = await api.get(`/Appointment${queryString ? `?${queryString}` : ''}`);
//     return response.data;
//   },

//   // Get appointment by ID
//   getById: async (id: string): Promise<Appointment> => {
//     const response = await api.get(`/Appointment/${id}`);
//     return response.data;
//   },

//   // Create new appointment
//   create: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
//     const response = await api.post('/Appointment', appointment);
//     return response.data;
//   },

//   // Update appointment
//   update: async (id: string, appointment: Appointment): Promise<Appointment> => {
//     const response = await api.put(`/Appointment/${id}`, appointment);
//     return response.data;
//   },

//   // Cancel appointment
//   cancel: async (id: string): Promise<Appointment> => {
//     const appointment = await appointmentApi.getById(id);
//     const cancelledAppointment = { ...appointment, status: 'cancelled' as const };
//     return appointmentApi.update(id, cancelledAppointment);
//   },

//   // Delete appointment
//   delete: async (id: string): Promise<void> => {
//     await api.delete(`/Appointment/${id}`);
//   },
// };

// Condition API functions
// export const conditionApi = {
//   // Get conditions for a patient
//   getByPatient: async (patientId: string): Promise<Bundle<Condition>> => {
//     const response = await api.get(`/Condition?subject=Patient/${patientId}`);
//     return response.data;
//   },

//   // Create new condition
//   create: async (condition: Omit<Condition, 'id'>): Promise<Condition> => {
//     const response = await api.post('/Condition', condition);
//     return response.data;
//   },

//   // Update condition
//   update: async (id: string, condition: Condition): Promise<Condition> => {
//     const response = await api.put(`/Condition/${id}`, condition);
//     return response.data;
//   },
// };

// Medication Request API functions
// export const medicationRequestApi = {
//   // Get medication requests for a patient
//   getByPatient: async (patientId: string): Promise<Bundle<MedicationRequest>> => {
//     const response = await api.get(`/MedicationRequest?subject=Patient/${patientId}`);
//     return response.data;
//   },

//   // Create new medication request
//   create: async (medicationRequest: Omit<MedicationRequest, 'id'>): Promise<MedicationRequest> => {
//     const response = await api.post('/MedicationRequest', medicationRequest);
//     return response.data;
//   },

//   // Update medication request
//   update: async (id: string, medicationRequest: MedicationRequest): Promise<MedicationRequest> => {
//     const response = await api.put(`/MedicationRequest/${id}`, medicationRequest);
//     return response.data;
//   },
// };

// Immunization API functions
// export const immunizationApi = {
//   // Get immunizations for a patient
//   getByPatient: async (patientId: string): Promise<Bundle<Immunization>> => {
//     const response = await api.get(`/Immunization?patient=Patient/${patientId}`);
//     return response.data;
//   },

//   // Create new immunization
//   create: async (immunization: Omit<Immunization, 'id'>): Promise<Immunization> => {
//     const response = await api.post('/Immunization', immunization);
//     return response.data;
//   },

//   // Update immunization
//   update: async (id: string, immunization: Immunization): Promise<Immunization> => {
//     const response = await api.put(`/Immunization/${id}`, immunization);
//     return response.data;
//   },
// };

// Error handling utility
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const outcome = error.response.data as OperationOutcome;
    if (outcome.resourceType === 'OperationOutcome' && outcome.issue?.[0]) {
      return outcome.issue[0].details?.text || outcome.issue[0].diagnostics || 'An error occurred';
    }
  }
  
  switch (error.response?.status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required.';
    case 403:
      return 'Access denied.';
    case 404:
      return 'Resource not found.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again.';
    default:
      return error.message || 'Network error occurred.';
  }
};

export default api;