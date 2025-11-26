/**
 * Hospital Service
 * Business logic for hospital finder
 */

import { OverpassClient, OverpassElement } from './overpass.client';
import { calculateDistance, Coordinates } from '../../utils/distance.util';

export interface Hospital {
  name: string;
  distance_km: number;
  address: string;
  lat: number;
  lng: number;
  fields: string[];
  google_maps_url: string;
}

export class HospitalService {
  private overpassClient: OverpassClient;

  constructor() {
    this.overpassClient = new OverpassClient();
  }

  /**
   * Get nearby hospitals
   * @param userLocation User's current location
   * @param radius Search radius in meters
   * @returns Array of hospitals sorted by distance
   */
  async getNearbyHospitals(
    userLocation: Coordinates,
    radius: number
  ): Promise<Hospital[]> {
    // Fetch hospitals from Overpass API
    const elements = await this.overpassClient.fetchNearbyHospitals(
      userLocation.lat,
      userLocation.lng,
      radius
    );

    // Transform and process hospitals
    const hospitals = this.transformElements(elements, userLocation);

    // Sort by distance
    hospitals.sort((a, b) => a.distance_km - b.distance_km);

    return hospitals;
  }

  /**
   * Transform Overpass elements to Hospital objects
   */
  private transformElements(
    elements: OverpassElement[],
    userLocation: Coordinates
  ): Hospital[] {
    const hospitals: Hospital[] = [];

    for (const element of elements) {
      const name = this.extractName(element);
      if (!name) continue; // Skip if no name

      const coordinates = this.extractCoordinates(element);
      if (!coordinates) continue; // Skip if no coordinates

      const distance = calculateDistance(userLocation, coordinates);
      const address = this.extractAddress(element);
      const fields = this.classifyHospital(element, name);
      const googleMapsUrl = this.buildGoogleMapsUrl(coordinates);

      hospitals.push({
        name,
        distance_km: distance,
        address,
        lat: coordinates.lat,
        lng: coordinates.lng,
        fields,
        google_maps_url: googleMapsUrl,
      });
    }

    return hospitals;
  }

  /**
   * Extract hospital name from element
   */
  private extractName(element: OverpassElement): string {
    const tags = element.tags || {};
    return (
      tags.name ||
      tags['name:en'] ||
      tags['name:local'] ||
      tags['official_name'] ||
      'Unknown Hospital'
    );
  }

  /**
   * Extract coordinates from element
   */
  private extractCoordinates(element: OverpassElement): Coordinates | null {
    // For nodes, use lat/lon directly
    if (element.type === 'node' && element.lat && element.lon) {
      return { lat: element.lat, lng: element.lon };
    }

    // For ways and relations, use center
    if (element.center && element.center.lat && element.center.lon) {
      return { lat: element.center.lat, lng: element.center.lon };
    }

    return null;
  }

  /**
   * Extract address from element tags
   */
  private extractAddress(element: OverpassElement): string {
    const tags = element.tags || {};
    const addressParts: string[] = [];

    if (tags['addr:street']) addressParts.push(tags['addr:street']);
    if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber']);
    if (tags['addr:city']) addressParts.push(tags['addr:city']);
    if (tags['addr:postcode']) addressParts.push(tags['addr:postcode']);
    if (tags['addr:country']) addressParts.push(tags['addr:country']);

    return addressParts.length > 0 ? addressParts.join(', ') : 'Address not available';
  }

  /**
   * Classify hospital based on name and tags
   * Uses rule-based classification
   */
  private classifyHospital(element: OverpassElement, name: string): string[] {
    const fields: Set<string> = new Set();
    const nameLower = name.toLowerCase();
    const tags = element.tags || {};
    const tagsString = JSON.stringify(tags).toLowerCase();

    // Pediatrics
    if (
      nameLower.includes('children') ||
      nameLower.includes('pediatric') ||
      nameLower.includes('paediatric') ||
      nameLower.includes('kids') ||
      tagsString.includes('pediatric')
    ) {
      fields.add('Pediatrics');
    }

    // Emergency / Surgery
    if (
      nameLower.includes('emergency') ||
      nameLower.includes('trauma') ||
      nameLower.includes('surgery') ||
      nameLower.includes('surgical') ||
      tagsString.includes('emergency') ||
      tagsString.includes('trauma')
    ) {
      fields.add('Emergency');
      fields.add('Surgery');
    }

    // Cardiology
    if (
      nameLower.includes('cardiac') ||
      nameLower.includes('cardiology') ||
      nameLower.includes('heart') ||
      tagsString.includes('cardiac')
    ) {
      fields.add('Cardiology');
    }

    // Orthopedics
    if (
      nameLower.includes('orthopedic') ||
      nameLower.includes('orthopaedic') ||
      nameLower.includes('bone') ||
      tagsString.includes('orthopedic')
    ) {
      fields.add('Orthopedics');
    }

    // Maternity
    if (
      nameLower.includes('maternity') ||
      nameLower.includes('obstetric') ||
      nameLower.includes('women') ||
      tagsString.includes('maternity')
    ) {
      fields.add('Maternity');
    }

    // Mental Health
    if (
      nameLower.includes('mental') ||
      nameLower.includes('psychiatric') ||
      nameLower.includes('psychology') ||
      tagsString.includes('mental')
    ) {
      fields.add('Mental Health');
    }

    // Cancer / Oncology
    if (
      nameLower.includes('cancer') ||
      nameLower.includes('oncology') ||
      nameLower.includes('tumor') ||
      tagsString.includes('cancer')
    ) {
      fields.add('Oncology');
    }

    // Eye / Ophthalmology
    if (
      nameLower.includes('eye') ||
      nameLower.includes('ophthalmic') ||
      nameLower.includes('vision') ||
      tagsString.includes('eye')
    ) {
      fields.add('Ophthalmology');
    }

    // If no specific fields found, add General
    if (fields.size === 0) {
      fields.add('General');
    }

    return Array.from(fields).sort();
  }

  /**
   * Build Google Maps URL for directions
   */
  private buildGoogleMapsUrl(coordinates: Coordinates): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
  }
}

