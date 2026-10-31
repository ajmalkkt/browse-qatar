const API_URL = import.meta.env.VITE_BASE_API || "http://localhost:5000/api";

export interface Vertical {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  icon: string;
  color: string;
  route: string;
  providerTypes: string[];
  subcategories?: string[];
  industries?: string[];
  filters?: Array<{ key: string; label: string; type: string; options?: string[]; unit?: string }>;
  additionalAttributes?: any[];
}

export const getAllVerticals = async (): Promise<Vertical[]> => {
  try {
    const response = await fetch(`${API_URL}/verticals`);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching verticals:", error);
    return [];
  }
};
