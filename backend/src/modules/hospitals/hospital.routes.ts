/**
 * Hospital Routes
 * Defines API endpoints for hospital finder
 */

import { Router } from 'express';
import { HospitalController } from './hospital.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const hospitalController = new HospitalController();

/**
 * GET /hospitals
 * Get nearby hospitals
 * Query params: lat, lng, radius (optional, default 5000m)
 * Requires authentication
 */
router.get(
  '/',
  authenticateToken,
  hospitalController.getNearbyHospitals.bind(hospitalController)
);

export default router;

