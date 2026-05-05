import { Router } from 'express';
import trainerCrudRoutes from './trainer-crud.route';
import trainerBulkRoutes from './trainer-bulk.route';

const router = Router();

/**
 * Trainer Routes - Main Entry Point
 * 
 * Modular route structure:
 * - CRUD operations (create, read, update, delete)
 * - Bulk operations (bulk upload, template)
 */

// Mount CRUD routes
router.use('/', trainerCrudRoutes);

// Mount bulk routes
router.use('/', trainerBulkRoutes);

export default router;
