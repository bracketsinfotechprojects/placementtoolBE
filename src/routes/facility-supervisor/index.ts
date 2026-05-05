import express from 'express';
import crudRoutes from './facility-supervisor-crud.route';
import bulkRoutes from './facility-supervisor-bulk.route';
import deleteRoutes from './facility-supervisor-delete.route';

const router = express.Router();

// Mount all sub-routes
router.use('/', crudRoutes);
router.use('/', bulkRoutes);
router.use('/', deleteRoutes);

export default router;
