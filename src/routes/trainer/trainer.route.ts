import express from 'express';
import TrainerController from '../../controllers/trainer/trainer.controller';
import { upload } from '../../configs/multer.config';

/**
 * @swagger
 * components:
 *   schemas:
 *     BulkUploadResult:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: True if at least one record was processed successfully
 *         totalRows:
 *           type: integer
 *           description: Total number of rows in the Excel file
 *           example: 150
 *         successCount:
 *           type: integer
 *           description: Number of trainers created successfully
 *           example: 145
 *         failureCount:
 *           type: integer
 *           description: Number of rows that failed processing
 *           example: 5
 *         errors:
 *           type: array
 *           description: Detailed error information for failed rows
 *           items:
 *             $ref: '#/components/schemas/BulkUploadError'
 *         createdTrainers:
 *           type: array
 *           description: List of successfully created trainers
 *           items:
 *             $ref: '#/components/schemas/CreatedTrainer'
 *     
 *     BulkUploadError:
 *       type: object
 *       properties:
 *         row:
 *           type: integer
 *           description: Excel row number (including header)
 *           example: 23
 *         email:
 *           type: string
 *           description: Email from the failed row (if available)
 *           example: "invalid.email@domain"
 *         errors:
 *           type: array
 *           description: List of validation errors for this row
 *           items:
 *             type: string
 *           example: ["Invalid email format", "mobile_number must be 10-15 digits"]
 *     
 *     CreatedTrainer:
 *       type: object
 *       properties:
 *         trainer_id:
 *           type: integer
 *           description: Generated trainer ID
 *           example: 1001
 *         email:
 *           type: string
 *           description: Trainer's email address
 *           example: "john.doe@example.com"
 *         full_name:
 *           type: string
 *           description: Trainer's full name
 *           example: "John Doe"
 *     
 *     TrainerLogin:
 *       type: object
 *       required:
 *         - userID
 *         - password
 *       properties:
 *         userID:
 *           type: string
 *           description: Must be unique across the system
 *           example: "john.doe"
 *         password:
 *           type: string
 *           description: Strong password for login
 *           minLength: 8
 *           example: "SecurePass123"
 */

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Trainers
 *     description: |
 *       Trainer management endpoints for creating, updating, and managing trainer profiles.
 *       
 *       **Available Operations:**
 *       - Individual trainer creation with photograph upload
 *       - Bulk trainer upload from Excel files (up to 2,000 records)
 *       - Trainer profile management (view, update, delete)
 *       - Excel template download for bulk operations
 *       
 *       **Bulk Upload Features:**
 *       - Process up to 2,000 trainers per upload
 *       - Batch processing for optimal performance (50 records per batch)
 *       - Parallel password hashing and duplicate validation
 *       - Partial success support with detailed error reporting
 *       - File size limit: 25MB
 *       - Supported formats: .xls, .xlsx
 *       
 *       **Performance Guidelines:**
 *       - Small batches (50-100): 2-5 minutes
 *       - Medium batches (100-500): 5-15 minutes
 *       - Large batches (500-1,000): 15-30 minutes
 *       - Maximum batches (1,000-2,000): 30-60 minutes
 */

/**
 * @swagger
 * /api/trainers:
 *   post:
 *     summary: Create new trainer with optional photograph
 *     description: |
 *       Create a single trainer with complete profile information and optional photograph upload.
 *       
 *       **For bulk operations:** Use the bulk upload endpoint (/api/trainers/bulk-upload) to create multiple trainers efficiently from an Excel file.
 *       
 *       **Individual vs Bulk API:**
 *       - Individual API: Supports photograph upload, immediate response, single trainer
 *       - Bulk API: No photograph, batch processing, multiple trainers (up to 2,000)
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - gender
 *               - date_of_birth
 *               - mobile_number
 *               - email
 *               - login
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: "Male"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Format YYYY-MM-DD
 *                 example: "1990-01-15"
 *               mobile_number:
 *                 type: string
 *                 pattern: '^[0-9]{10,15}$'
 *                 description: 10-15 digits
 *                 example: "0912345678"
 *               alternate_contact:
 *                 type: string
 *                 example: "0912345679"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Must be unique across the system
 *                 example: "john.doe@example.com"
 *               trainer_type:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Full-time", "Part-time"]
 *               course_auth:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["CHC33021 - Certificate III in Individual Support", "CHC43021 - Certificate IV in Ageing Support"]
 *               acc_numbers:
 *                 type: string
 *                 example: "ACC123456"
 *               yoe:
 *                 type: integer
 *                 minimum: 0
 *                 description: Years of experience
 *                 example: 5
 *               state_covered:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["NSW", "VIC"]
 *               cities_covered:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Sydney", "Melbourne"]
 *               available_days:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Monday", "Tuesday", "Wednesday"]
 *               time_slots:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["09:00-12:00", "14:00-17:00"]
 *               suprise_visit:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: "yes"
 *               wwchildcheck:
 *                 type: integer
 *                 enum: [0, 1, 2]
 *                 description: "0=Pending, 1=Approved, 2=Expired"
 *                 example: 1
 *               wwcExpiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               policeCheckNumber:
 *                 type: string
 *                 example: "POL-2024-12345"
 *               policeCheckExpiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-30"
 *               photograph:
 *                 type: string
 *                 format: binary
 *                 description: Photograph file (JPEG, PNG, GIF, WebP, max 25MB)
 *               wwcDocument:
 *                 type: string
 *                 format: binary
 *                 description: Working With Children Check document (PDF, Images, Word, max 25MB)
 *               policeCheckDocument:
 *                 type: string
 *                 format: binary
 *                 description: Police Check document (PDF, Images, Word, max 25MB)
 *               login:
 *                 type: object
 *                 required:
 *                   - userID
 *                   - password
 *                 properties:
 *                   userID:
 *                     type: string
 *                     description: Must be unique across the system
 *                     example: "john.doe"
 *                   password:
 *                     type: string
 *                     description: Strong password for login
 *                     example: "SecurePass123"
 *     responses:
 *       201:
 *         description: Trainer created successfully
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
 *                   example: "Trainer created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainer_id:
 *                       type: integer
 *                       example: 1
 *                     full_name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     photograph:
 *                       type: string
 *                       nullable: true
 *                       example: "/uploads/trainers/1/PHOTOGRAPH_xxx.jpg"
 *       400:
 *         description: Bad Request - Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       examples:
 *                         missing_field: "first_name is required"
 *                         invalid_email: "Invalid email format"
 *                         duplicate_email: "Email 'john.doe@example.com' already exists"
 *                         duplicate_login: "Login ID 'john.doe' already exists"
 *                         invalid_date: "Invalid date format, use YYYY-MM-DD"
 *       401:
 *         description: Unauthorized
 */
router.post('/', upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'wwcDocument', maxCount: 1 },
  { name: 'policeCheckDocument', maxCount: 1 }
]), TrainerController.create);

/**
 * @swagger
 * /api/trainers/bulk-upload:
 *   post:
 *     summary: Bulk upload trainers from Excel file (Optimized for up to 2,000 records)
 *     description: |
 *       Upload multiple trainers at once using an Excel file. The system processes records in batches of 50 for optimal performance.
 *       
 *       **Performance Guidelines:**
 *       - 50-100 records: 2-5 minutes processing time
 *       - 100-500 records: 5-15 minutes processing time  
 *       - 500-1,000 records: 15-30 minutes processing time
 *       - 1,000-2,000 records: 30-60 minutes processing time
 *       - Maximum: 2,000 records per upload (files with more will be rejected)
 *       
 *       **File Requirements:**
 *       - Format: Excel (.xls or .xlsx)
 *       - Maximum size: 25MB
 *       - Required columns: first_name, last_name, gender, date_of_birth, mobile_number, email, login_user_id, login_password
 *       - Download template from /api/trainers/template endpoint
 *       
 *       **Features:**
 *       - Batch processing for improved performance
 *       - Parallel password hashing
 *       - Batch duplicate validation
 *       - Partial success support (valid records processed even if others fail)
 *       - Detailed error reporting with Excel row numbers
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   Excel file (.xls or .xlsx) containing trainer data.
 *                   Maximum file size: 25MB
 *                   Maximum records: 2,000 per upload
 *                   Use /api/trainers/template to download the correct format.
 *     responses:
 *       200:
 *         description: Bulk upload completed (may include partial failures)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: True if at least one record was processed successfully
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bulk upload completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRows:
 *                       type: integer
 *                       description: Total number of rows in the Excel file
 *                       example: 150
 *                     successCount:
 *                       type: integer
 *                       description: Number of trainers created successfully
 *                       example: 145
 *                     failureCount:
 *                       type: integer
 *                       description: Number of rows that failed processing
 *                       example: 5
 *                     errors:
 *                       type: array
 *                       description: Detailed error information for failed rows
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: integer
 *                             description: Excel row number (including header)
 *                             example: 23
 *                           email:
 *                             type: string
 *                             description: Email from the failed row (if available)
 *                             example: "invalid.email@domain"
 *                           errors:
 *                             type: array
 *                             description: List of validation errors for this row
 *                             items:
 *                               type: string
 *                             example: ["Invalid email format", "mobile_number must be 10-15 digits"]
 *                     createdTrainers:
 *                       type: array
 *                       description: List of successfully created trainers
 *                       items:
 *                         type: object
 *                         properties:
 *                           trainer_id:
 *                             type: integer
 *                             description: Generated trainer ID
 *                             example: 1001
 *                           email:
 *                             type: string
 *                             description: Trainer's email address
 *                             example: "john.doe@example.com"
 *                           full_name:
 *                             type: string
 *                             description: Trainer's full name
 *                             example: "John Doe"
 *       400:
 *         description: Bad Request - File validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       examples:
 *                         no_file: "Excel file is required"
 *                         invalid_type: "Only Excel files (.xls, .xlsx) are allowed"
 *                         too_large: "File size exceeds 25MB limit"
 *                         too_many_records: "File contains 2500 rows. Maximum allowed is 2000 records per upload. Please split into smaller files."
 *                         missing_columns: "Required column 'first_name' is missing from Excel file"
 *                         empty_file: "Excel file contains no data rows"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *       413:
 *         description: Payload Too Large - File exceeds 25MB limit
 *       500:
 *         description: Internal Server Error - Processing failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Bulk upload failed: Database connection timeout"
 */
router.post('/bulk-upload', upload.single('file'), TrainerController.bulkUpload);

/**
 * @swagger
 * /api/trainers/template:
 *   get:
 *     summary: Download Excel template for bulk trainer upload
 *     description: |
 *       Downloads a pre-formatted Excel template with proper column headers, sample data, and detailed instructions.
 *       
 *       **Template Features:**
 *       - All 22 required and optional columns
 *       - Sample data matching the complete payload structure
 *       - Instructions sheet with field descriptions and validation rules
 *       - Optimized column widths for easy data entry
 *       - Proper formatting for dates, arrays, and other data types
 *       
 *       **Column Structure:**
 *       - Required: first_name, last_name, gender, date_of_birth, mobile_number, email, login_user_id, login_password
 *       - Optional: alternate_contact, trainer_type, course_auth, acc_numbers, yoe, state_covered, cities_covered, available_days, time_slots, suprise_visit, wwchildcheck, wwc_expiry_date, police_check_number, police_check_expiry_date
 *       
 *       **Data Format Guidelines:**
 *       - Arrays: Comma-separated values (e.g., "Full-time,Part-time")
 *       - Dates: YYYY-MM-DD format (e.g., "1990-01-15")
 *       - Boolean: "yes"/"no" or "true"/"false"
 *       - Numbers: Plain numbers (e.g., "5" for years of experience)
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel template file download
 *         headers:
 *           Content-Type:
 *             description: MIME type for Excel files
 *             schema:
 *               type: string
 *               example: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
 *           Content-Disposition:
 *             description: Attachment filename
 *             schema:
 *               type: string
 *               example: "attachment; filename=trainer_upload_template.xlsx"
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *               description: |
 *                 Excel file containing:
 *                 - "Trainers" sheet with column headers and sample data
 *                 - "Instructions" sheet with detailed field descriptions
 *                 - Proper formatting and column widths
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Unauthorized access"
 *       500:
 *         description: Internal Server Error - Template generation failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Failed to generate Excel template"
 */
router.get('/template', TrainerController.downloadTemplate);

/**
 * @swagger
 * /api/trainers:
 *   get:
 *     summary: List trainers
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search in name or email
 *       - in: query
 *         name: trainer_type
 *         schema:
 *           type: string
 *         description: Filter by trainer type
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [trainer_id, first_name, email, createdAt]
 *           default: createdAt
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
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
 *         description: Success
 */
router.get('/', TrainerController.list);

/**
 * @swagger
 * /api/trainers/{id}:
 *   get:
 *     summary: Get trainer by ID with photograph information
 *     description: |
 *       Retrieve a specific trainer's details including photograph file information from the files table.
 *       
 *       **Photograph Information:**
 *       - photograph_url: File path to the trainer's photograph (null if no photograph)
 *       - photograph_filename: Original filename of the photograph (null if no photograph)
 *       
 *       The system automatically fetches the latest photograph file where:
 *       - entity_type = 'trainer'
 *       - entity_id = trainer ID
 *       - doc_type = 'PHOTOGRAPH' (case-insensitive: matches 'PHOTOGRAPH', 'photograph', 'Photograph', etc.)
 *       - is_active = true
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trainer ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Trainer details retrieved successfully
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
 *                   example: "Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainer_id:
 *                       type: integer
 *                       example: 1
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     mobile_number:
 *                       type: string
 *                       example: "0912345678"
 *                     photograph_url:
 *                       type: string
 *                       nullable: true
 *                       description: File path to trainer's photograph (null if no photograph uploaded)
 *                       example: "uploads/trainers/1/PHOTOGRAPH_20240315_143022.jpg"
 *                     photograph_filename:
 *                       type: string
 *                       nullable: true
 *                       description: Original filename of the photograph (null if no photograph uploaded)
 *                       example: "trainer_photo.jpg"
 *       404:
 *         description: Trainer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Trainer does not exist"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 */

/**
 * @swagger
 * /api/trainers/{id}/classes/today:
 *   get:
 *     summary: Get today's courses for a specific trainer
 *     description: |
 *       Retrieve all courses scheduled for today assigned to a specific trainer.
 *       Returns courses sorted by reporting time in ascending order.
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trainer ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Today's courses retrieved successfully
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
 *                   example: "Success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       course_id:
 *                         type: integer
 *                         example: 1
 *                       course_name:
 *                         type: string
 *                         example: "Manual Handling Training"
 *                       course_category:
 *                         type: array
 *                         items:
 *                           type: string
 *                           enum: ["Manual Handling", "First Aid"]
 *                         example: ["Manual Handling"]
 *                       course_type:
 *                         type: array
 *                         items:
 *                           type: string
 *                           enum: ["Accredited", "Non-Accredited", "Refresher"]
 *                         example: ["Accredited"]
 *                       course_scope:
 *                         type: array
 *                         items:
 *                           type: string
 *                           enum: ["Aged Care", "Disability", "Healthcare Students"]
 *                         example: ["Aged Care"]
 *                       course_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-05-06"
 *                       reporting_time:
 *                         type: string
 *                         format: time
 *                         example: "09:00:00"
 *                       expected_end_time:
 *                         type: string
 *                         format: time
 *                         example: "13:00:00"
 *                       total_duration:
 *                         type: string
 *                         example: "4 hours"
 *                       mode:
 *                         type: array
 *                         items:
 *                           type: string
 *                           enum: ["Onsite", "Online", "Hybrid"]
 *                         example: ["Onsite"]
 *                       training_location:
 *                         type: string
 *                         example: "ABC Training Center"
 *                       address:
 *                         type: string
 *                         example: "123 Training Street, Sydney NSW 2000"
 *                       city:
 *                         type: string
 *                         example: "Sydney"
 *                       total_seats:
 *                         type: integer
 *                         example: 20
 *                       seats_remaining:
 *                         type: integer
 *                         example: 15
 *                       seat_status:
 *                         type: string
 *                         enum: ["Available", "Filling Fast", "Full"]
 *                         example: "Available"
 *                       trainer:
 *                         type: object
 *                         properties:
 *                           trainer_id:
 *                             type: integer
 *                             example: 1
 *                           first_name:
 *                             type: string
 *                             example: "John"
 *                           last_name:
 *                             type: string
 *                             example: "Doe"
 *                           email:
 *                             type: string
 *                             example: "john.doe@example.com"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *       404:
 *         description: Trainer not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/classes/today', TrainerController.getTodayClasses);

/**
 * @swagger
 * /api/trainers/{id}:
 *   get:
 *     summary: Get trainer by ID with photograph information
 *     description: |
 *       Retrieve a specific trainer's details including photograph file information from the files table.
 *       
 *       **Photograph Information:**
 *       - photograph_url: File path to the trainer's photograph (null if no photograph)
 *       - photograph_filename: Original filename of the photograph (null if no photograph)
 *       
 *       The system automatically fetches the latest photograph file where:
 *       - entity_type = 'trainer'
 *       - entity_id = trainer ID
 *       - doc_type = 'PHOTOGRAPH' (case-insensitive: matches 'PHOTOGRAPH', 'photograph', 'Photograph', etc.)
 *       - is_active = true
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trainer ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Trainer details retrieved successfully
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
 *                   example: "Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainer_id:
 *                       type: integer
 *                       example: 1
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     mobile_number:
 *                       type: string
 *                       example: "0912345678"
 *                     photograph_url:
 *                       type: string
 *                       nullable: true
 *                       description: File path to trainer's photograph (null if no photograph uploaded)
 *                       example: "uploads/trainers/1/PHOTOGRAPH_20240315_143022.jpg"
 *                     photograph_filename:
 *                       type: string
 *                       nullable: true
 *                       description: Original filename of the photograph (null if no photograph uploaded)
 *                       example: "trainer_photo.jpg"
 *       404:
 *         description: Trainer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Trainer does not exist"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 */
router.get('/:id', TrainerController.getById);

/**
 * @swagger
 * /api/trainers/{id}:
 *   put:
 *     summary: Update trainer with optional photograph upload
 *     description: |
 *       Update trainer information with support for photograph file upload.
 *       
 *       **File Upload Behavior:**
 *       - If a new photograph is uploaded, the old photograph file will be deactivated (is_active = false)
 *       - The new photograph is saved to the files table with entity_type = 'trainer', doc_type = 'PHOTOGRAPH'
 *       - All operations are performed within a transaction for data consistency
 *       
 *       **Supported Fields:**
 *       - Personal info: first_name, last_name, gender, date_of_birth, mobile_number, alternate_contact, email
 *       - Professional: trainer_type, course_auth, acc_numbers, yoe
 *       - Availability: state_covered, cities_covered, available_days, time_slots, suprise_visit
 *       - Certifications: wwchildcheck, wwcExpiryDate, policeCheckNumber, policeCheckExpiryDate
 *       - Files: photograph (image file)
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trainer ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: "Male"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Format YYYY-MM-DD
 *                 example: "1990-01-15"
 *               mobile_number:
 *                 type: string
 *                 pattern: '^[0-9]{10,15}$'
 *                 description: 10-15 digits
 *                 example: "0912345678"
 *               alternate_contact:
 *                 type: string
 *                 example: "0912345679"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Must be unique across the system
 *                 example: "john.doe@example.com"
 *               trainer_type:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Can be sent as JSON array or comma-separated string
 *                 example: ["Full-time", "Part-time"]
 *               course_auth:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Can be sent as JSON array or comma-separated string
 *                 example: ["CHC33021 - Certificate III in Individual Support"]
 *               acc_numbers:
 *                 type: string
 *                 example: "ACC123456"
 *               yoe:
 *                 type: integer
 *                 minimum: 0
 *                 description: Years of experience
 *                 example: 5
 *               state_covered:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Can be sent as JSON array or comma-separated string
 *                 example: ["NSW", "VIC"]
 *               cities_covered:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Can be sent as JSON array or comma-separated string
 *                 example: ["Sydney", "Melbourne"]
 *               available_days:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Can be sent as JSON array or comma-separated string
 *                 example: ["Monday", "Tuesday", "Wednesday"]
 *               time_slots:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Can be sent as JSON array or comma-separated string
 *                 example: ["09:00-12:00", "14:00-17:00"]
 *               suprise_visit:
 *                 type: string
 *                 enum: [yes, no, "true", "false", "1", "0"]
 *                 example: "yes"
 *               wwchildcheck:
 *                 type: integer
 *                 enum: [0, 1, 2]
 *                 description: "0=Pending, 1=Approved, 2=Expired"
 *                 example: 1
 *               wwcExpiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               policeCheckNumber:
 *                 type: string
 *                 example: "POL-2024-12345"
 *               policeCheckExpiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-30"
 *               photograph:
 *                 type: string
 *                 format: binary
 *                 description: New photograph file (JPEG, PNG, GIF, WebP, max 25MB). Old photograph will be deactivated.
 *               wwcDocument:
 *                 type: string
 *                 format: binary
 *                 description: New Working With Children Check document (PDF, Images, Word, max 25MB). Old document will be deactivated.
 *               policeCheckDocument:
 *                 type: string
 *                 format: binary
 *                 description: New Police Check document (PDF, Images, Word, max 25MB). Old document will be deactivated.
 *     responses:
 *       200:
 *         description: Trainer updated successfully
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
 *                   example: "Trainer updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainer_id:
 *                       type: integer
 *                       example: 1
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     photograph_url:
 *                       type: string
 *                       nullable: true
 *                       example: "uploads/trainers/1/PHOTOGRAPH_20240315_143022.jpg"
 *                     photograph_filename:
 *                       type: string
 *                       nullable: true
 *                       example: "trainer_photo.jpg"
 *       400:
 *         description: Bad Request - Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       examples:
 *                         duplicate_email: "Email 'john.doe@example.com' already exists"
 *                         invalid_file: "Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed for photographs."
 *       404:
 *         description: Trainer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Trainer does not exist"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 */
router.put('/:id', upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'wwcDocument', maxCount: 1 },
  { name: 'policeCheckDocument', maxCount: 1 }
]), TrainerController.update);

/**
 * @swagger
 * /api/trainers/{id}:
 *   delete:
 *     summary: Soft delete trainer
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', TrainerController.delete);

/**
 * @swagger
 * /api/trainers/{id}/permanent:
 *   delete:
 *     summary: Permanently delete trainer
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permanently Deleted
 */
router.delete('/:id/permanent', TrainerController.permanentlyDelete);

export default router;
