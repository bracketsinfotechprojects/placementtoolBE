import { Router } from 'express';
import EligibilityCredentialController from '../../controllers/student/eligibility-credential.controller';

const router = Router();

/**
 * Student Eligibility & Credentials Routes
 * Send credentials, batch send, notify eligibility
 */

// Send credentials to single student
router.post('/:studentId/send-credentials', EligibilityCredentialController.sendCredentialsToStudent);

// Batch send credentials to multiple students
router.post('/batch-send-credentials', EligibilityCredentialController.batchSendCredentials);

// Notify student of eligibility status
router.post('/:studentId/notify-eligibility', EligibilityCredentialController.notifyEligibilityStatus);

export default router;
