import express from 'express';
import PlacementAssignmentController from '../../controllers/placement-assignment/placement-assignment.controller';
import { getRepository } from 'typeorm';
import { PlacementAssignment } from '../../entities/placement-assignment/placement-assignment.entity';
import PlacementAssignmentService from '../../services/assignment/placement-assignment.service';
import AssignmentService from '../../services/assignment/assignment.service';

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
 *     summary: List placement assignments with filters and pagination
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
 *                     $ref: '#/components/schemas/PlacementAssignment'
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
 *     summary: Get all assignments for a specific student
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

/**
 * @swagger
 * /api/placement-assignments/placement-slots/{placementSlotId}/students:
 *   get:
 *     summary: Get all students assigned to a specific placement slot
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placementSlotId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Placement Slot ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['Assigned', 'Active', 'Completed', 'Cancelled', 'Dropped']
 *         description: Filter by assignment status, defaults to Assigned
 *     responses:
 *       200:
 *         description: Placement slot details with assigned students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 placementslot_id:
 *                   type: integer
 *                   example: 1
 *                 total_students:
 *                   type: integer
 *                   example: 5
 *                 placement_slot:
 *                   type: object
 *                   properties:
 *                     placementslot_id:
 *                       type: integer
 *                     facility_id:
 *                       type: string
 *                     placementslot_type:
 *                       type: array
 *                       items:
 *                         type: string
 *                     placement_start_date:
 *                       type: string
 *                       format: date
 *                     placement_end_date:
 *                       type: string
 *                       format: date
 *                     total_slots_offered:
 *                       type: integer
 *                     shift_type:
 *                       type: array
 *                       items:
 *                         type: string
 *                     shift_timings:
 *                       type: string
 *                 students:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       assignment_id:
 *                         type: integer
 *                       start_date:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                       end_date:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                       status:
 *                         type: string
 *                         enum: ['Assigned', 'Active', 'Completed', 'Cancelled', 'Dropped']
 *                       notes:
 *                         type: string
 *                         nullable: true
 *                       student:
 *                         type: object
 *                         properties:
 *                           student_id:
 *                             type: integer
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           email:
 *                             type: string
 *                             nullable: true
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                           status:
 *                             type: string
 *       404:
 *         description: Placement slot not found or no students assigned
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/placement-slots/:placementSlotId/students',
  async (req: any, res: any) => {
    try {
      const { placementSlotId } = req.params;
      const { status } = req.query;
      
      const result = await PlacementAssignmentService.getStudentsForPlacementSlot(
        parseInt(placementSlotId), 
        { status }
      );
      
      if (!result) {
        return res.status(404).json(
          AssignmentService.createErrorResponse('No students found for this placement slot')
        );
      }
      
      return res.status(200).json(result);
      
    } catch (error: any) {
      console.error('Error fetching placement slot students:', error);
      return res.status(500).json(
        AssignmentService.createErrorResponse(
          error.message || 'Failed to fetch placement slot students'
        )
      );
    }
  }
);

/**
 * @swagger
 * /api/placement-assignments/facilities/{facilityId}/placement-slots:
 *   get:
 *     summary: Get all placement slots for a facility with their assigned students
 *     tags:
 *       - Placement Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['Assigned', 'Active', 'Completed', 'Cancelled', 'Dropped']
 *         description: Filter by assignment status, defaults to Assigned
 *     responses:
 *       200:
 *         description: List of placement slots with their assigned students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 facility_id:
 *                   type: string
 *                   example: "1"
 *                 total_students:
 *                   type: integer
 *                   example: 15
 *                 placement_slots_count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       placement_slot:
 *                         type: object
 *                         properties:
 *                           placementslot_id:
 *                             type: integer
 *                           facility_id:
 *                             type: string
 *                           placementslot_type:
 *                             type: array
 *                             items:
 *                               type: string
 *                           placement_start_date:
 *                             type: string
 *                             format: date
 *                           placement_end_date:
 *                             type: string
 *                             format: date
 *                           total_slots_offered:
 *                             type: integer
 *                       students:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             assignment_id:
 *                               type: integer
 *                             start_date:
 *                               type: string
 *                               format: date
 *                               nullable: true
 *                             end_date:
 *                               type: string
 *                               format: date
 *                               nullable: true
 *                             status:
 *                               type: string
 *                             student:
 *                               type: object
 *                               properties:
 *                                 student_id:
 *                                   type: integer
 *                                 first_name:
 *                                   type: string
 *                                 last_name:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                                   nullable: true
 *                                 phone:
 *                                   type: string
 *                                   nullable: true
 *       404:
 *         description: No placement slots found for this facility
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/facilities/:facilityId/placement-slots',
  async (req: any, res: any) => {
    try {
      const { facilityId } = req.params;
      const { status } = req.query;
      
      const result = await PlacementAssignmentService.getPlacementSlotsForFacility(
        facilityId, 
        { status }
      );
      
      if (!result) {
        return res.status(404).json(
          AssignmentService.createErrorResponse('No placement slots found for this facility')
        );
      }
      
      return res.status(200).json(result);
      
    } catch (error: any) {
      console.error('Error fetching facility placement slots:', error);
      return res.status(500).json(
        AssignmentService.createErrorResponse(
          error.message || 'Failed to fetch facility placement slots'
        )
      );
    }
  }
);

export default router;
