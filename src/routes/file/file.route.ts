import { Router } from 'express';
import FileController from '../../controllers/file/file.controller';
import { upload, uploadMultiple } from '../../configs/multer.config';
import { jwtAuth } from '../../middlewares/jwt-auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload and management
 */

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
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
 *               - entity_type
 *               - entity_id
 *               - doc_type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (max 10MB)
 *               entity_type:
 *                 type: string
 *                 enum: [student, facility, placement, visa, job, agreement, trainer]
 *                 description: Type of entity
 *               entity_id:
 *                 type: integer
 *                 description: ID of the entity
 *               doc_type:
 *                 type: string
 *                 enum: [AADHAAR, PASSPORT, VISA_DOCUMENT, OFFER_LETTER, REGISTRATION_PROOF, SUPPORTING_DOCUMENT, MOU_DOCUMENT, INSURANCE_DOCUMENT, PLACEMENT_DOCUMENT, JOB_OFFER, WORK_CHILD_CHECK, POLICE_CHECK, ACCRED_CERT, FIRSTAID_CERT, INSURANCE_DOCS, RESUME, OTHER]
 *                 description: Type of document
 *               expiry_date:
 *                 type: string
 *                 format: date
 *                 description: Optional expiry date for the document (YYYY-MM-DD)
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/upload', jwtAuth, upload.single('file'), FileController.upload);

/**
 * @swagger
 * /api/files/upload-multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *               - entity_type
 *               - entity_id
 *               - doc_types
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (max 10 files, 10MB each)
 *               entity_type:
 *                 type: string
 *                 enum: [student, facility, placement, visa, job, agreement, trainer]
 *                 description: Type of entity
 *               entity_id:
 *                 type: integer
 *                 description: ID of the entity
 *               doc_types:
 *                 type: string
 *                 description: JSON array or comma-separated document types (must match number of files)
 *                 example: '["VISA_DOCUMENT","PASSPORT","AADHAAR"]'
 *               expiry_date:
 *                 type: string
 *                 format: date
 *                 description: Optional expiry date for the documents (YYYY-MM-DD)
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/upload-multiple', jwtAuth, uploadMultiple.array('files', 10), FileController.uploadMultiple);

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Get file by ID
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: File ID
 *     responses:
 *       200:
 *         description: File details
 *       404:
 *         description: File not found
 */
router.get('/:id', jwtAuth, FileController.getById);

/**
 * @swagger
 * /api/files/download/{id}:
 *   get:
 *     summary: Download file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: File ID
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 */
router.get('/download/:id', jwtAuth, FileController.download);

/**
 * @swagger
 * /api/files/download/entity/{entity_type}/{entity_id}:
 *   get:
 *     summary: Download all files for an entity as ZIP
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entity_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student, facility, placement, visa, job, agreement]
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ZIP file containing all entity files
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No files found
 */
router.get('/download/entity/:entity_type/:entity_id', jwtAuth, FileController.downloadEntityFiles);

/**
 * @swagger
 * /api/files/entity/{entity_type}/{entity_id}:
 *   get:
 *     summary: Get all files for an entity
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entity_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student, facility, placement, visa, job, agreement]
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of files
 */
router.get('/entity/:entity_type/:entity_id', jwtAuth, FileController.getByEntity);

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: List files with filters
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entity_type
 *         schema:
 *           type: string
 *           enum: [student, facility, placement, visa, job, agreement]
 *       - in: query
 *         name: entity_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: doc_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: mime_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: uploaded_from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: uploaded_to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: uploaded_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: List of files with pagination
 */
router.get('/', jwtAuth, FileController.list);

/**
 * @swagger
 * /api/files/statistics:
 *   get:
 *     summary: Get file statistics
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entity_type
 *         schema:
 *           type: string
 *           enum: [student, facility, placement, visa, job, agreement]
 *     responses:
 *       200:
 *         description: File statistics
 */
router.get('/statistics', jwtAuth, FileController.getStatistics);

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Delete file (soft delete)
 *     tags: [Files]
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
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 */
router.delete('/:id', jwtAuth, FileController.delete);

/**
 * @swagger
 * /api/files/{id}/permanent:
 *   delete:
 *     summary: Permanently delete file
 *     tags: [Files]
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
 *         description: File permanently deleted
 *       404:
 *         description: File not found
 */
router.delete('/:id/permanent', jwtAuth, FileController.permanentlyDelete);

export default router;
