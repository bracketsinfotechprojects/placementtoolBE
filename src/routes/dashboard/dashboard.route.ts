import * as express from 'express';
import DashboardController from '../../controllers/dashboard/dashboard.controller';

const router = express.Router();

router.get('/admin-stats',              DashboardController.getAdminStats);
router.get('/student-stats',            DashboardController.getStudentStats);
router.get('/facility-stats',           DashboardController.getFacilityStats);
router.get('/trainer-stats',            DashboardController.getTrainerStats);
router.get('/supervisor-stats',         DashboardController.getSupervisorStats);
router.get('/facility-payment-summary', DashboardController.getFacilityPaymentSummary);

export default router;
