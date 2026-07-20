import express from 'express';
import PlacementPaymentController from '../../controllers/placement-payment/placement-payment.controller';
import { upload } from '../../configs/multer.config';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Placement Payments
 *     description: |
 *       Placement fee payment tracking. `placement_fee` on a placement slot is a per-student amount;
 *       the total payable for a slot is `accepted_students (facility_confirmation_status = Approved) × placement_fee`.
 *       Payments are recorded as a ledger (`placement_payment_transactions`) so multiple partial payments
 *       are supported until the slot is fully paid.
 */

/**
 * @swagger
 * /api/placement-payments:
 *   get:
 *     summary: List placement slots with payment summary (Admin / Placement Executive)
 *     tags: [Placement Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: facility_id
 *         schema: { type: integer }
 *       - in: query
 *         name: payment_status
 *         schema: { type: string, enum: [Pending, "Partially Paid", Paid] }
 *       - in: query
 *         name: start_date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: start_date_to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by facility name
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', PlacementPaymentController.list);

/**
 * @swagger
 * /api/placement-payments/facility/my-payments:
 *   get:
 *     summary: List payment summary for the logged-in facility/supervisor's own placements
 *     tags: [Placement Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/facility/my-payments', PlacementPaymentController.listForFacilityUser);

/**
 * @swagger
 * /api/placement-payments/{slotId}:
 *   get:
 *     summary: Get full payment detail for a placement slot (accepted students + transaction history)
 *     tags: [Placement Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Placement slot not found
 */
router.get('/:slotId', PlacementPaymentController.getSlotDetail);

/**
 * @swagger
 * /api/placement-payments/{slotId}/transactions:
 *   post:
 *     summary: Record a payment against a placement slot (Admin / Placement Executive)
 *     description: |
 *       Amount must be greater than 0 and less than or equal to the current remaining balance.
 *       Supports an optional proof-of-payment file upload.
 *     tags: [Placement Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, example: 255.00 }
 *               payment_date: { type: string, format: date }
 *               payment_reference: { type: string }
 *               invoice_number: { type: string }
 *               notes: { type: string }
 *               proof: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Payment recorded
 *       400:
 *         description: Validation error (e.g. amount exceeds remaining balance)
 */
router.post('/:slotId/transactions', upload.array('proof', 5), PlacementPaymentController.createTransaction);

/**
 * @swagger
 * /api/placement-payments/transactions/{transactionId}/reverse:
 *   put:
 *     summary: Reverse (soft-cancel) a payment transaction (Admin only)
 *     tags: [Placement Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Transaction reversed
 */
router.put('/transactions/:transactionId/reverse', PlacementPaymentController.reverseTransaction);

export default router;
