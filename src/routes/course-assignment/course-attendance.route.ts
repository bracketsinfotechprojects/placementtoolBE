import { Router, Request, Response, NextFunction } from 'express';
import { CourseAttendanceController } from '../../controllers/course-assignment/course-attendance.controller';
import { jwtAuth } from '../../middlewares/jwt-auth.middleware';
import multer, { Multer } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();

/**
 * Initialize certificates upload directory
 * Ensures the directory exists and is writable
 */
const initCertificatesDirectory = (): string => {
  try {
    const uploadDir = path.join(__dirname, '../../../uploads/certificates');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`✅ Created certificates upload directory: ${uploadDir}`);
    }
    
    // Verify directory is writable by checking permissions
    try {
      fs.accessSync(uploadDir, fs.constants.W_OK);
      console.log(`✅ Certificates directory is writable`);
    } catch (err) {
      console.warn(`⚠️  Certificates directory may not be writable`);
    }
    
    return uploadDir;
  } catch (error: any) {
    console.error(`❌ Failed to initialize certificates directory:`, error.message);
    throw new Error(`Cannot initialize upload directory: ${error.message}`);
  }
};

/**
 * Middleware to ensure directory exists before upload
 * This runs BEFORE multer processes the file
 */
const ensureCertificatesDir = (req: Request, res: Response, next: NextFunction) => {
  try {
    const uploadDir = path.join(__dirname, '../../../uploads/certificates');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`📁 Pre-upload: Created certificates directory`);
    }
    
    // Verify it's writable
    fs.accessSync(uploadDir, fs.constants.W_OK);
    
    console.log(`✅ Pre-upload: Certificates directory verified`);
    next();
  } catch (error: any) {
    console.error('Pre-upload directory check failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to prepare upload directory',
      error: error.message
    });
  }
};

// Initialize certificates directory on route setup
let certificatesDir = '';
try {
  certificatesDir = initCertificatesDirectory();
} catch (error: any) {
  console.error('Initial directory creation failed (will retry on upload):', error);
}

// Multer setup for certificate uploads
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    try {
      // Ensure directory exists (triple check)
      const uploadDir = path.join(__dirname, '../../../uploads/certificates');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`📁 Multer: Created certificates directory`);
      }
      
      cb(null, uploadDir);
    } catch (error: any) {
      console.error('Error in multer destination:', error.message);
      cb(new Error(`Failed to create upload directory: ${error.message}`));
    }
  },
  filename: (req: any, file: any, cb: any) => {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = 'cert-' + uniqueSuffix + path.extname(file.originalname);
      console.log(`📄 Generated filename: ${fileName}`);
      cb(null, fileName);
    } catch (error: any) {
      console.error('Error in multer filename:', error);
      cb(new Error(`Failed to generate filename: ${error.message}`));
    }
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    // Allow only PDF and image files
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only PDF and image files are allowed. Received: ${file.mimetype}`));
    }
  }
});

// Attendance Routes

/**
 * @swagger
 * /api/course-assignments/{assignmentId}:
 *   put:
 *     summary: Update course attendance for a student
 *     tags:
 *       - CourseAttendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseAttendanceUpdate'
 *     responses:
 *       200:
 *         description: Attendance updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized - not the assigned trainer
 *       404:
 *         description: Course assignment not found
 */
router.put(
  '/:assignmentId',
  jwtAuth,
  CourseAttendanceController.updateAttendance
);

/**
 * @swagger
 * /api/course-assignments/bulk/update:
 *   put:
 *     summary: Bulk update attendance for multiple students
 *     tags:
 *       - CourseAttendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseAttendanceBulkUpdate'
 *     responses:
 *       200:
 *         description: Bulk update completed
 *       400:
 *         description: Bad request
 */
router.put(
  '/bulk/update',
  jwtAuth,
  CourseAttendanceController.bulkUpdateAttendance
);

// Certificate Routes

/**
 * @swagger
 * /api/course-assignments/certificates/upload:
 *   post:
 *     summary: Upload certificate for a student
 *     tags:
 *       - Certificates
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - assignment_id
 *               - assignment_type
 *               - certificate
 *             properties:
 *               student_id:
 *                 type: integer
 *                 description: Student ID
 *               assignment_id:
 *                 type: integer
 *                 description: Course or placement assignment ID
 *               assignment_type:
 *                 type: string
 *                 enum: [course, placement]
 *                 description: Type of assignment
 *               certificate:
 *                 type: string
 *                 format: binary
 *                 description: Certificate file (PDF, JPG, PNG, GIF - max 50MB)
 *     responses:
 *       201:
 *         description: Certificate uploaded successfully
 *       400:
 *         description: Bad request
 */
router.post(
  '/certificates/upload',
  ensureCertificatesDir,  // Ensure directory exists BEFORE multer
  jwtAuth,
  upload.single('certificate'),
  CourseAttendanceController.uploadCertificate
);

/**
 * @swagger
 * /api/course-assignments/certificates/{certificateId}/download:
 *   get:
 *     summary: Download certificate file
 *     tags:
 *       - Certificates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Certificate file downloaded
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Not authorized to download
 *       404:
 *         description: Certificate not found
 */
router.get(
  '/certificates/:certificateId/download',
  jwtAuth,
  CourseAttendanceController.downloadCertificate
);

/**
 * @swagger
 * /api/course-assignments/certificates/{certificateId}:
 *   get:
 *     summary: Get certificate details
 *     tags:
 *       - Certificates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Certificate details retrieved
 *       404:
 *         description: Certificate not found
 */
router.get(
  '/certificates/:certificateId',
  jwtAuth,
  CourseAttendanceController.getCertificate
);

/**
 * @swagger
 * /api/course-assignments/certificates/student/{studentId}:
 *   get:
 *     summary: List certificates for a student
 *     tags:
 *       - Certificates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Records per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of student certificates
 *       400:
 *         description: Bad request
 */
router.get(
  '/certificates/student/:studentId',
  jwtAuth,
  CourseAttendanceController.listStudentCertificates
);

export default router;
