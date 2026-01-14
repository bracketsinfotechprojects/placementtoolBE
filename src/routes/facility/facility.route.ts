import express from 'express';
import FacilityController from '../../controllers/facility/facility.controller';
import FacilityAttributeController from '../../controllers/facility/facility-attribute.controller';
import FacilityBranchController from '../../controllers/facility/facility-branch.controller';
import FacilityAgreementController from '../../controllers/facility/facility-agreement.controller';
import FacilityOrganizationController from '../../controllers/facility/facility-organization.controller';
import FacilityDocumentController from '../../controllers/facility/facility-document.controller';
import FacilityRuleController from '../../controllers/facility/facility-rule.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Facilities
 *     description: Facility management endpoints
 *   - name: Facility Attributes
 *     description: Facility attributes management
 *   - name: Facility Organization
 *     description: Organization structure management
 *   - name: Facility Branches
 *     description: Branch/site management
 *   - name: Facility Agreements
 *     description: Agreement management
 *   - name: Facility Documents
 *     description: Document requirements management
 *   - name: Facility Rules
 *     description: Rules and policies management
 */

/**
 * @swagger
 * /api/facilities:
 *   post:
 *     summary: Create facility
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organization_name]
 *             properties:
 *               organization_name: {type: string, example: "Sunshine Care Home"}
 *               registered_business_name: {type: string, example: "Sunshine Care Pty Ltd"}
 *               website_url: {type: string, example: "https://sunshinecare.com.au"}
 *               abn_registration_number: {type: string, example: "12345678901"}
 *               source_of_data: {type: string, example: "Manual Entry"}
 *               email: {type: string, format: email, example: "admin@sunshinecare.com.au", description: "Email address for facility login (optional)"}
 *               password: {type: string, example: "SecurePass123", description: "Password for facility login (optional)"}
 *     responses:
 *       201: {description: Created}
 *       401: {description: Unauthorized}
 */
router.post('/', FacilityController.create);

/**
 * @swagger
 * /api/facilities:
 *   get:
 *     summary: List facilities (full details)
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema: {type: string}
 *       - in: query
 *         name: limit
 *         schema: {type: integer, default: 20}
 *       - in: query
 *         name: page
 *         schema: {type: integer, default: 1}
 *     responses:
 *       200: {description: Success}
 *       401: {description: Unauthorized}
 */
router.get('/', FacilityController.list);

/**
 * @swagger
 * /api/facilities/simplified:
 *   get:
 *     summary: List facilities (simplified - Name, Location, Slots)
 *     description: Returns only essential fields - facility_id, name, location, available_slots, num_branches, has_mou
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema: {type: string}
 *         description: Search in facility name
 *       - in: query
 *         name: limit
 *         schema: {type: integer, default: 20}
 *       - in: query
 *         name: page
 *         schema: {type: integer, default: 1}
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
 *                     type: object
 *                     properties:
 *                       facility_id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Sunshine Care Home"
 *                       location:
 *                         type: string
 *                         example: "Sydney, NSW"
 *                       available_slots:
 *                         type: integer
 *                         example: 15
 *                       num_branches:
 *                         type: integer
 *                         example: 3
 *                       has_mou:
 *                         type: boolean
 *                         example: true
 *       401: {description: Unauthorized}
 */
router.get('/simplified', FacilityController.listSimplified);

/**
 * @swagger
 * /api/facilities/{id}:
 *   get:
 *     summary: Get facility by ID
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: integer}
 *     responses:
 *       200: {description: Success}
 *       401: {description: Unauthorized}
 */
router.get('/:id', FacilityController.getById);

/**
 * @swagger
 * /api/facilities/{id}:
 *   put:
 *     summary: Update facility
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: integer}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organization_name:
 *                 type: string
 *                 example: "Updated Sunshine Care Home"
 *               registered_business_name:
 *                 type: string
 *                 example: "Updated Sunshine Care Pty Ltd"
 *               website_url:
 *                 type: string
 *                 example: "https://newsunshinecare.com.au"
 *               abn_registration_number:
 *                 type: string
 *                 example: "98765432109"
 *               source_of_data:
 *                 type: string
 *                 example: "Updated Source"
 *     responses:
 *       200: {description: Updated}
 *       401: {description: Unauthorized}
 */
router.put('/:id', FacilityController.update);

/**
 * @swagger
 * /api/facilities/{id}:
 *   delete:
 *     summary: Delete facility
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: integer}
 *     responses:
 *       200: {description: Deleted}
 *       401: {description: Unauthorized}
 */
router.delete('/:id', FacilityController.delete);

/**
 * @swagger
 * /api/facilities/{id}/permanent:
 *   delete:
 *     summary: Permanently delete facility
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: integer}
 *     responses:
 *       200: {description: Deleted}
 *       401: {description: Unauthorized}
 */
router.delete('/:id/permanent', FacilityController.permanentlyDelete);

// Facility Attributes
/**
 * @swagger
 * /api/facilities/{facilityId}/attributes:
 *   post:
 *     summary: Create attribute
 *     tags: [Facility Attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema: {type: integer}
 *     responses:
 *       201: {description: Created}
 *       401: {description: Unauthorized}
 */
router.post('/:facilityId/attributes', FacilityAttributeController.create);

/**
 * @swagger
 * /api/facilities/{facilityId}/attributes:
 *   get:
 *     summary: Get attributes
 *     tags: [Facility Attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema: {type: integer}
 *     responses:
 *       200: {description: Success}
 *       401: {description: Unauthorized}
 */
router.get('/:facilityId/attributes', FacilityAttributeController.getByFacilityId);

/**
 * @swagger
 * /api/facilities/attributes/{id}:
 *   put:
 *     summary: Update attribute
 *     tags: [Facility Attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: integer}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attribute_type:
 *                 type: string
 *                 enum: [Category, State]
 *                 example: "State"
 *               attribute_value:
 *                 type: string
 *                 example: "VIC"
 *     responses:
 *       200: {description: Updated}
 *       401: {description: Unauthorized}
 */
router.put('/attributes/:id', FacilityAttributeController.update);

/**
 * @swagger
 * /api/facilities/attributes/{id}:
 *   delete:
 *     summary: Delete attribute
 *     tags: [Facility Attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: integer}
 *     responses:
 *       200: {description: Deleted}
 *       401: {description: Unauthorized}
 */
router.delete('/attributes/:id', FacilityAttributeController.delete);

// Facility Organization
router.post('/:facilityId/organization', FacilityOrganizationController.create);
router.get('/:facilityId/organization', FacilityOrganizationController.getByFacilityId);
router.get('/organization/:id', FacilityOrganizationController.getById);
router.put('/organization/:id', FacilityOrganizationController.update);
router.delete('/organization/:id', FacilityOrganizationController.delete);

// Facility Branches
router.post('/:facilityId/branches', FacilityBranchController.create);
router.get('/:facilityId/branches', FacilityBranchController.getByFacilityId);
router.get('/branches/:id', FacilityBranchController.getById);
router.put('/branches/:id', FacilityBranchController.update);
router.delete('/branches/:id', FacilityBranchController.delete);

// Facility Agreements
router.post('/:facilityId/agreements', FacilityAgreementController.create);
router.get('/:facilityId/agreements', FacilityAgreementController.getByFacilityId);
router.get('/agreements/:id', FacilityAgreementController.getById);
router.put('/agreements/:id', FacilityAgreementController.update);
router.delete('/agreements/:id', FacilityAgreementController.delete);

// Facility Documents
router.post('/:facilityId/documents', FacilityDocumentController.create);
router.get('/:facilityId/documents', FacilityDocumentController.getByFacilityId);
router.get('/documents/:id', FacilityDocumentController.getById);
router.put('/documents/:id', FacilityDocumentController.update);
router.delete('/documents/:id', FacilityDocumentController.delete);

// Facility Rules
router.post('/:facilityId/rules', FacilityRuleController.create);
router.get('/:facilityId/rules', FacilityRuleController.getByFacilityId);
router.get('/rules/:id', FacilityRuleController.getById);
router.put('/rules/:id', FacilityRuleController.update);
router.delete('/rules/:id', FacilityRuleController.delete);

export default router;
