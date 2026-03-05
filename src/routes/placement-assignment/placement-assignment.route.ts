import express from 'express';
import PlacementAssignmentController from '../../controllers/placement-assignment/placement-assignment.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Placement Assignments
 *     description: Student assignment to placement slots management
 */

/**
 * @swagger
 * /api/placement-assignments:
 *   post:
 *     summary: Assign a student to a placement slot
 *     description: |
 *       Assigns a student to a placement slot with validation checks:
 *       - Slot must exist and not be deleted
 *       - Placement end date must not have passed
 *       - Slot must not be full (based on total_slots_offered)
 *       - Student must exist
 *       - Student must not already be assigned to this slot
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlacementAssignmentInput'
 *     responses:
 *       201:
 *         description: Student assigned successfully
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
 *                   $ref: '#/components/schemas/PlacementAssignment'
 *       400:
 *         description: Bad request - validation failed (slot full, past date, etc.)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Slot or student not found
 */
router.post('/', PlacementAssignmentController.create);

/**
 * @swagger
 * /api/placement-assignments:
 *   get:
 *     summary: List placement assignments with full details and pagination
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: placementslot_id
 *         schema:
 *           type: integer
 *         description: Filter by placement slot ID
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: Filter by student ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Assigned, Active, Completed, Cancelled, Dropped]
 *         description: Filter by assignment status
 *       - in: query
 *         name: start_date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date from
 *       - in: query
 *         name: start_date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date to
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: assignment_id
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
 *         description: List of placement assignments with related placement slot and student details
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/PlacementAssignment'
 *                       - type: object
 *                         properties:
 *                           placementSlot:
 *                             type: object
 *                             description: Full placement slot details
 *                           student:
 *                             type: object
 *                             description: Full student details
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
router.get('/', PlacementAssignmentController.list);

/**
 * @swagger
 * /api/placement-assignments/slot/{slotId}:
 *   get:
 *     summary: Get all assignments for a specific placement slot
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlacementAssignment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/slot/:slotId', PlacementAssignmentController.getBySlotId);

/**
 * @swagger
 * /api/placement-assignments/student/{studentId}:
 *   get:
 *     summary: Get all assignments for a specific student with full details
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: List of placement assignments with related placement slot details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/PlacementAssignment'
 *                       - type: object
 *                         properties:
 *                           placementSlot:
 *                             type: object
 *                             description: Full placement slot details
 *                           student:
 *                             type: object
 *                             description: Full student details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/student/:studentId', PlacementAssignmentController.getByStudentId);

/**
 * @swagger
 * /api/placement-assignments/{id}:
 *   get:
 *     summary: Get placement assignment by ID
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
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
 *                   $ref: '#/components/schemas/PlacementAssignment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/:id', PlacementAssignmentController.getById);

/**
 * @swagger
 * /api/placement-assignments/{id}:
 *   put:
 *     summary: Update placement assignment
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlacementAssignmentUpdateInput'
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
 *                   $ref: '#/components/schemas/PlacementAssignment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.put('/:id', PlacementAssignmentController.update);

/**
 * @swagger
 * /api/placement-assignments/{id}:
 *   delete:
 *     summary: Delete placement assignment
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
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
router.delete('/:id', PlacementAssignmentController.delete);

export default router;
