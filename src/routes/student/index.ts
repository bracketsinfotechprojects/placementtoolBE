import { Router } from 'express';
import studentCrudRoutes from './student-crud.route';
import studentRecordsRoutes from './student-records.route';
import studentBulkRoutes from './student-bulk.route';
import studentEligibilityRoutes from './student-eligibility.route';

const router = Router();

/**
 * Student Routes - Main Entry Point
 * 
 * Modular route structure:
 * - CRUD operations (create, read, update, delete)
 * - Records operations (facility, address, job status, self-placement)
 * - Bulk operations (bulk upload, bulk update, template)
 * - Eligibility operations (credentials, notifications)
 */

// Mount CRUD routes
router.use('/', studentCrudRoutes);

// Mount records routes
router.use('/', studentRecordsRoutes);

// Mount bulk routes
router.use('/', studentBulkRoutes);

// Mount eligibility routes
router.use('/', studentEligibilityRoutes);

export default router;
