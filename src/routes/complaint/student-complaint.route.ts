import { Router } from 'express';
import StudentComplaintController from '../../controllers/complaint/student-complaint.controller';
import { upload } from '../../configs/multer.config';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();

/**
 * @swagger
 * /api/students/{studentId}/complaints:
 *   post:
 *     summary: Create a new student complaint
 *     description: |
 *       Create a new complaint regarding facility issues. 
 *       Supports file attachments (PDF, DOC, DOCX, JPG, PNG - max 10MB each).
 *       Files are stored in /uploads/complaints/{facilityId}/{complaintId}/ directory.
 *     tags:
 *       - Student Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - priority
 *               - description
 *               - location
 *               - urgency_level
 *             properties:
 *               facility_id:
 *                 type: integer
 *                 description: ID of the facility the complaint is about (optional)
 *                 example: 5
 *               category:
 *                 type: string
 *                 description: Category of complaint
 *                 example: "Facility Issues"
 *               priority:
 *                 type: string
 *                 description: Priority level
 *                 example: "High"
 *               description:
 *                 type: string
 *                 description: Detailed description of the complaint (max 1000 chars)
 *                 example: "The water cooler in the study area is not working properly"
 *               location:
 *                 type: string
 *                 description: Location where the issue occurred
 *                 example: "Building A, Room 203"
 *               urgency_level:
 *                 type: string
 *                 description: Urgency level
 *                 example: "High"
 *               is_anonymous:
 *                 type: boolean
 *                 description: Whether to report anonymously (student_id won't be in response)
 *                 example: false
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: File attachments (max 5 files, 10MB each)
 *     responses:
 *       201:
 *         description: Complaint created successfully
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
 *                   example: "Complaint created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     complaint_id:
 *                       type: integer
 *                     student_id:
 *                       type: integer
 *                       description: Only included if is_anonymous is false
 *                     facility_id:
 *                       type: integer
 *                     category:
 *                       type: string
 *                     priority:
 *                       type: string
 *                     description:
 *                       type: string
 *                     location:
 *                       type: string
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: string
 *                     urgency_level:
 *                       type: string
 *                     is_anonymous:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                       example: "Pending"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student or facility not found
 */
router.post('/:studentId/complaints', (req: any, res, next) => {
  // Custom multer middleware to create dynamic upload directory
  const studentId = req.params.studentId;
  const facilityId = req.body.facility_id || 'unknown';
  
  const uploadDir = path.join(process.cwd(), 'uploads', 'complaints', facilityId.toString());
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create multer instance with dynamic destination
  const dynamicUpload = upload.array('attachments', 5);
  
  dynamicUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: { message: err.message }
      });
    }
    next();
  });
}, StudentComplaintController.create);

/**
 * @swagger
 * /api/students/{studentId}/complaints/{complaintId}:
 *   get:
 *     summary: Get complaint by ID
 *     description: Retrieve a specific complaint by its ID
 *     tags:
 *       - Student Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Complaint retrieved successfully
 *       404:
 *         description: Complaint not found
 */
router.get('/:studentId/complaints/:complaintId', StudentComplaintController.getById);

/**
 * @swagger
 * /api/students/{studentId}/complaints:
 *   get:
 *     summary: Get all complaints for a student
 *     description: Retrieve all complaints for a specific student with pagination
 *     tags:
 *       - Student Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Complaints retrieved successfully
 */
router.get('/:studentId/complaints', StudentComplaintController.getByStudentId);

/**
 * @swagger
 * /api/students/{studentId}/complaints/{complaintId}:
 *   put:
 *     summary: Update complaint
 *     description: Update a specific complaint
 *     tags:
 *       - Student Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               urgency_level:
 *                 type: string
 *               status:
 *                 type: string
 *               resolution_notes:
 *                 type: string
 *               resolved_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       404:
 *         description: Complaint not found
 */
router.put('/:studentId/complaints/:complaintId', StudentComplaintController.update);

/**
 * @swagger
 * /api/students/{studentId}/complaints/{complaintId}:
 *   delete:
 *     summary: Delete complaint
 *     description: Soft delete a specific complaint
 *     tags:
 *       - Student Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Complaint deleted successfully
 *       404:
 *         description: Complaint not found
 */
router.delete('/:studentId/complaints/:complaintId', StudentComplaintController.delete);

export default router;
