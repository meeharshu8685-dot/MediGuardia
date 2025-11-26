/**
 * Overpass API Client
 * Handles communication with OpenStreetMap Overpass API
 */

import axios, { AxiosInstance } from 'axios';

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    [key: string]: string;
  };
}

export interface OverpassResponse {
  elements: OverpassElement[];
}

export class OverpassClient {
  private client: AxiosInstance;
  private readonly baseUrl = 'https://overpass-api.de/api/interpreter';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Fetch hospitals near a location using Overpass API
   * @param lat Latitude
   * @param lng Longitude
   * @param radius Radius in meters
   * @returns Array of hospital elements
   */
  async fetchNearbyHospitals(
    lat: number,
    lng: number,
    radius: number
  ): Promise<OverpassElement[]> {
    const query = this.buildQuery(lat, lng, radius);

    try {
      const response = await this.client.post<OverpassResponse>('', query, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data.elements || [];
    } catch (error: any) {
      console.error('Overpass API Error:', error.message);
      throw new Error(`Failed to fetch hospitals from Overpass API: ${error.message}`);
    }
  }

  /**
   * Build Overpass QL query
   */
  private buildQuery(lat: number, lng: number, radius: number): string {
    return `[out:json];
(
  node["amenity"="hospital"](around:${radius},${lat},${lng});
  way["amenity"="hospital"](around:${radius},${lat},${lng});
  relation["amenity"="hospital"](around:${radius},${lat},${lng});
);
out center;`;
  }
}

