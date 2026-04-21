export interface SearchMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  actions?: string[];
  keyFindings?: string[];
}

export interface SearchCompany {
  id: string;
  name: string;
  description: string;
  website?: string;
  country?: string;
  sector?: string;
  revenue?: string;
  employees?: string | number;
  score?: number;
  siren?: string;
  city?: string;
  logo?: string;
  signal?: string;
  structure?: string;
  founded?: string;
}

export interface SearchFilter {
  id: string;
  type: string;
  label: string;
  value: string;
  icon?: string;
}
