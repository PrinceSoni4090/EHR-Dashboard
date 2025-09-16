import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  Patient,
  Bundle,
  PatientSearchParams,
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
    const status = error.response?.status;
    if (status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
    } else if (status === 404) {
      console.error('Resource not found.');
    } else if ((status ?? 0) >= 500) {
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
};


// Error handling utility
export const handleApiError = (error: AxiosError): string => {
  const data: any = error.response?.data;
  if (data?.resourceType === 'OperationOutcome' && Array.isArray(data.issue) && data.issue[0]) {
    return data.issue[0].details?.text || data.issue[0].diagnostics || 'An error occurred';
  }

  const status = error.response?.status;
  switch (status) {
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