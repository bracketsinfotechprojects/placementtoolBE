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
 * /api/placement-slots/available:
 *   get:
 *     summary: Get available placement slots by period
 *     description: |
 *       Retrieve available placement slots filtered by time period (today, week, or month).
 *       
 *       Optionally filter by student ID to exclude slots where the student is already assigned.
 *       
 *       Returns only slots with:
 *       - Available seats (remaining_seats > 0)
 *       - Start date within the specified period
 *       - Not soft-deleted
 *     tags:
 *       - Placement Slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *           default: today
 *         description: |
 *           Time period to filter slots:
 *           - today: Current day only
 *           - week: Current week (Monday to Sunday)
 *           - month: Current month
 *         example: "today"
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: |
 *           Optional student ID to exclude slots where student is already assigned.
 *           If provided, slots where this student has active assignments (Allocated or Started status) will be excluded.
 *         example: 1
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
 *         description: Available slots retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Available placement slots retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       placementslot_id:
 *                         type: integer
 *                         example: 5
 *                       facility_id:
 *                         type: string
 *                         example: "FAC001"
 *                       placementslot_type:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Clinical Placement"]
 *                       course_applicable:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["CHC33015"]
 *                       total_slots_offered:
 *                         type: integer
 *                         example: 5
 *                       remaining_seats:
 *                         type: integer
 *                         description: Number of available seats
 *                         example: 2
 *                       placement_start_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-05-05"
 *                       placement_end_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-06-05"
 *                       total_hours_required:
 *                         type: integer
 *                         example: 120
 *                       shift_type:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Morning"]
 *                       shift_timings:
 *                         type: string
 *                         example: "07:00 - 15:00"
 *                       working_days:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Weekdays"]
 *                       gender_preference:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Any"]
 *                       urgent_requirement:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     previousPage:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     nextPage:
 *                       type: integer
 *                       nullable: true
 *                       example: 2
 *                     totalItems:
 *                       type: integer
 *                       example: 45
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */
router.get('/available', PlacementSlotController.getAvailableSlots);

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
