/**
 * Hospital Controller
 * Handles HTTP requests for hospital finder
 */

import { Request, Response } from 'express';
import { HospitalService } from './hospital.service';

export class HospitalController {
  private hospitalService: HospitalService;

  constructor() {
    this.hospitalService = new HospitalService();
  }

  /**
   * GET /hospitals
   * Get nearby hospitals
   */
  async getNearbyHospitals(req: Request, res: Response): Promise<void> {
    try {
      // Extract and validate query parameters
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseInt(req.query.radius as string) || 5000; // Default 5km

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({
          error: 'Invalid coordinates',
          message: 'lat and lng are required and must be valid numbers',
        });
        return;
      }

      if (lat < -90 || lat > 90) {
        res.status(400).json({
          error: 'Invalid latitude',
          message: 'Latitude must be between -90 and 90',
        });
        return;
      }

      if (lng < -180 || lng > 180) {
        res.status(400).json({
          error: 'Invalid longitude',
          message: 'Longitude must be between -180 and 180',
        });
        return;
      }

      // Validate radius
      if (radius < 100 || radius > 50000) {
        res.status(400).json({
          error: 'Invalid radius',
          message: 'Radius must be between 100 and 50000 meters',
        });
        return;
      }

      // Get nearby hospitals
      const hospitals = await this.hospitalService.getNearbyHospitals(
        { lat, lng },
        radius
      );

      // Return JSON response
      res.status(200).json(hospitals);
    } catch (error: any) {
      console.error('Error fetching hospitals:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Failed to fetch hospitals',
      });
    }
  }
}

