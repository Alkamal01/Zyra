// API base URL - adjust this based on your backend setup
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types for our API responses
export interface FarmerReportRequest {
  farmer_id: string;
  lga: string;
  state: string;
  lat: number;
  lon: number;
  crop: string;
  category: string;
  description: string;
}

export interface Incident {
  incident_id: string;
  farmer_id: string;
  lga: string;
  state: string;
  geo: {
    lat: number;
    lon: number;
  };
  crop: string;
  category: string;
  description: string;
  reported_at: string;
  enriched: {
    weather_hint: string;
    severity_score: number;
    tags: string[];
  };
  status: string;
  recommendations: Array<{
    step: string;
    source: string;
    created_at: string;
  }>;
  resource_request: {
    requested: boolean;
    type: string;
    notes: string;
    created_at?: string;
  };
  audit: Array<{
    event: string;
    at: string;
  }>;
}

export interface SystemStats {
  total_incidents: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  by_lga: Record<string, number>;
  high_severity_count: number;
}

export interface LGAQueryResponse {
  lga: string;
  total_incidents: number;
  category_breakdown: Record<string, number>;
  high_severity_count: number;
  top_high_severity: string[];
  incidents: Incident[];
}

export interface SubmitReportResponse {
  success: boolean;
  message: string;
  incident_id: string;
  severity: number;
  recommendation: string;
  resource_requested: boolean;
}

// API functions
export async function submitFarmerReport(data: FarmerReportRequest): Promise<SubmitReportResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/submit-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
}

export async function getSystemStats(): Promise<SystemStats> {
  try {
    const response = await fetch(`${API_BASE}/api/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
}

export async function getAllIncidents(): Promise<Incident[]> {
  try {
    const response = await fetch(`${API_BASE}/api/incidents`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
}

export async function queryIncidentsByLGA(lga: string): Promise<LGAQueryResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/query-lga`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lga }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error querying LGA:', error);
    throw error;
  }
}

// Utility functions for data transformation
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'pest': 'bg-red-500',
    'disease': 'bg-orange-500',
    'flood': 'bg-blue-500',
    'drought': 'bg-purple-500',
    'input_need': 'bg-green-500',
    'other': 'bg-gray-500'
  };
  return colors[category] || 'bg-gray-500';
}

export function getSeverityColor(severity: number): string {
  if (severity >= 70) return 'bg-red-500/20 text-red-700 border-red-500/30';
  if (severity >= 50) return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
  return 'bg-green-500/20 text-green-700 border-green-500/30';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'recommended': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    'resolved': 'bg-green-500/20 text-green-700 border-green-500/30',
    'in-progress': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
    'pending': 'bg-gray-500/20 text-gray-700 border-gray-500/30'
  };
  return colors[status] || 'bg-gray-500/20 text-gray-700 border-gray-500/30';
}
