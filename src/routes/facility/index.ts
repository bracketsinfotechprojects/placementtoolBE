import { Router } from 'express';
import facilityCrudRoutes from './facility-crud.route';
import facilityRelatedRoutes from './facility-related.route';
import facilityBulkRoutes from './facility-bulk.route';

const router = Router();

/**
 * Facility Routes - Main Entry Point
 * 
 * Modular route structure:
 * - CRUD operations (create, read, update, delete)
 * - Related entities (attributes, organization, branches, agreements, documents, rules)
 * - Bulk operations (bulk upload)
 */

// Mount CRUD routes
router.use('/', facilityCrudRoutes);

// Mount related entities routes
router.use('/', facilityRelatedRoutes);

// Mount bulk routes
router.use('/', facilityBulkRoutes);

export default router;
