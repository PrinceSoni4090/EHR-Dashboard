
export interface Patient {
  id?: string;
  resourceType: 'Patient';
  identifier?: Array<{
    use?: string;
    value: string;
    system?: string;
    type?: {
      text?: string;
    };
  }>;
  active?: boolean;
  name: Array<{
    use?: string;
    family: string;
    given: string[];
    prefix?: string[];
    suffix?: string[];
  }>;
  telecom?: Array<{
    system: 'phone' | 'email' | 'fax';
    value: string;
    use?: 'home' | 'work' | 'mobile';
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Array<{
    use?: string;
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  }>;
  contact?: Array<{
    relationship: Array<{
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    }>;
    name?: {
      family: string;
      given: string[];
    };
    telecom?: Array<{
      system: string;
      value: string;
    }>;
  }>;
  communication?: Array<{
    language: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    preferred?: boolean;
  }>;
  meta?: {
    lastUpdated?: string;
    versionId?: string;
  };
  // Custom fields from API extension
  medicalHistory?: string[];
  allergies?: string[];
}

export interface Appointment {
  id?: string;
  resourceType: 'Appointment';
  status: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow';
  serviceCategory?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  serviceType?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  specialty?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  appointmentType?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  reasonCode?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  }>;
  description?: string;
  start: string;
  end: string;
  minutesDuration?: number;
  comment?: string;
  participant: Array<{
    type?: Array<{
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    }>;
    actor?: {
      reference: string;
      display?: string;
    };
    required?: 'required' | 'optional' | 'information-only';
    status: 'accepted' | 'declined' | 'tentative' | 'needs-action';
  }>;
  meta?: {
    lastUpdated?: string;
    versionId?: string;
  };
}

// API Response Types
export interface Bundle<T> {
  resourceType: 'Bundle';
  type: 'searchset' | 'collection';
  total?: number;
  entry?: Array<{
    resource: T;
    fullUrl?: string;
  }>;
}

// Search Parameters
export interface PatientSearchParams {
  name?: string;
  identifier?: string;
  family?: string;
  given?: string;
  birthdate?: string;
  gender?: string;
  active?: boolean;
  _count?: number;
  _offset?: number;
}

export interface AppointmentSearchParams {
  patient?: string;
  practitioner?: string;
  date?: string;
  status?: string;
  _count?: number;
  _offset?: number;
}
