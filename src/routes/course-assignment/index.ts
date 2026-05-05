import express from 'express';
import crudRoutes from './course-assignment-crud.route';
import queryRoutes from './course-assignment-query.route';

const router = express.Router();

router.use('/', crudRoutes);
router.use('/', queryRoutes);

export default router;
