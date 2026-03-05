import express from 'express';
import PlacementSlotController from '../../controllers/placement-slot/placement-slot.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Placement Slots
 *     description: Placement slot management endpoints
 */

/**
 * @swagger
 * /api/placement-slots:
 *   post:
 *     summary: Create a new placement slot
 *     tags:
 *       - Placement Slots
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlacementSlotInput'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PlacementSlot'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', PlacementSlotController.create);

/**
 * @swagger
 * /api/placement-slots:
 *   get:
 *     summary: List placement slots with filters and pagination
 *     tags:
 *       - Placement Slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *         description: Filter by status (active = not deleted, inactive = deleted, all = both)
 *       - in: query
 *         name: facility_id
 *         schema:
 *           type: integer
 *         description: Filter by facility ID
 *       - in: query
 *         name: created_by
 *         schema:
 *           type: integer
 *         description: Filter by creator user ID
 *       - in: query
 *         name: slot_type
 *         schema:
 *           type: string
 *         description: Filter by slot type
 *       - in: query
 *         name: course_applicable
 *         schema:
 *           type: string
 *         description: Filter by course applicable
 *       - in: query
 *         name: shift_type
 *         schema:
 *           type: string
 *         description: Filter by shift type
 *       - in: query
 *         name: working_days
 *         schema:
 *           type: string
 *         description: Filter by working days
 *       - in: query
 *         name: gender_preference
 *         schema:
 *           type: string
 *         description: Filter by gender preference
 *       - in: query
 *         name: urgent_requirement
 *         schema:
 *           type: boolean
 *         description: Filter by urgent requirement status
 *       - in: query
 *         name: placement_fee_status
 *         schema:
 *           type: boolean
 *         description: Filter by placement fee status
 *       - in: query
 *         name: work_hour_limit
 *         schema:
 *           type: boolean
 *         description: Filter by work hour limit
 *       - in: query
 *         name: priority_category
 *         schema:
 *           type: string
 *         description: Filter by priority category
 *       - in: query
 *         name: placement_start_date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by placement start date from
 *       - in: query
 *         name: placement_start_date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by placement start date to
 *       - in: query
 *         name: placement_end_date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by placement end date from
 *       - in: query
 *         name: placement_end_date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by placement end date to
 *       - in: query
 *         name: created_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by creation date from
 *       - in: query
 *         name: created_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by creation date to
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword across multiple fields
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: placementslot_id
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlacementSlot'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalPages:
 *                       type: integer
 *                     previousPage:
 *                       type: integer
 *                       nullable: true
 *                     currentPage:
 *                       type: integer
 *                     nextPage:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', PlacementSlotController.list);

/**
 * @swagger
 * /api/placement-slots/{id}:
 *   get:
 *     summary: Get placement slot by ID
 *     tags:
 *       - Placement Slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Placement slot ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PlacementSlot'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/:id', PlacementSlotController.getById);

/**
 * @swagger
 * /api/placement-slots/{id}:
 *   put:
 *     summary: Update placement slot
 *     tags:
 *       - Placement Slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Placement slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlacementSlotInput'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PlacementSlot'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.put('/:id', PlacementSlotController.update);

/**
 * @swagger
 * /api/placement-slots/{id}:
 *   delete:
 *     summary: Soft delete placement slot
 *     tags:
 *       - Placement Slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Placement slot ID
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete('/:id', PlacementSlotController.delete);

/**
 * @swagger
 * /api/placement-slots/{id}/permanent:
 *   delete:
 *     summary: Permanently delete placement slot
 *     tags:
 *       - Placement Slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Placement slot ID
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete('/:id/permanent', PlacementSlotController.permanentlyDelete);

export default router;
