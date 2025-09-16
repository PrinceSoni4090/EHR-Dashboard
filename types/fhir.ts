// FHIR-compliant TypeScript definitions for EHR system

export interface Patient {
  id?: string;
  resourceType: 'Patient';
  identifier?: Array<{
    use?: string;
    value: string;
    system?: string;
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

export interface Condition {
  id?: string;
  resourceType: 'Condition';
  clinicalStatus?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  verificationStatus?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  severity?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  onsetDateTime?: string;
  recordedDate?: string;
  recorder?: {
    reference: string;
    display?: string;
  };
  note?: Array<{
    text: string;
    time?: string;
  }>;
}

export interface MedicationRequest {
  id?: string;
  resourceType: 'MedicationRequest';
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
  medicationCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  authoredOn?: string;
  requester?: {
    reference: string;
    display?: string;
  };
  dosageInstruction?: Array<{
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: string;
      };
    };
    route?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    doseAndRate?: Array<{
      doseQuantity?: {
        value: number;
        unit: string;
        system: string;
        code: string;
      };
    }>;
  }>;
}

export interface Immunization {
  id?: string;
  resourceType: 'Immunization';
  status: 'completed' | 'entered-in-error' | 'not-done';
  vaccineCode: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  patient: {
    reference: string;
    display?: string;
  };
  occurrenceDateTime?: string;
  primarySource?: boolean;
  manufacturer?: {
    display: string;
  };
  lotNumber?: string;
  expirationDate?: string;
  site?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  route?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  doseQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  note?: Array<{
    text: string;
  }>;
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

// Error Types
export interface OperationOutcome {
  resourceType: 'OperationOutcome';
  issue: Array<{
    severity: 'fatal' | 'error' | 'warning' | 'information';
    code: string;
    details?: {
      text: string;
    };
    diagnostics?: string;
  }>;
}