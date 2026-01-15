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
 *     tags:
 *       - Facilities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organization_name
 *             properties:
 *               organization_name:
 *                 type: string
 *                 example: "Sunshine Care Home"
 *               registered_business_name:
 *                 type: string
 *                 example: "Sunshine Care Pty Ltd"
 *               website_url:
 *                 type: string
 *                 example: "https://sunshinecare.com.au"
 *               abn_registration_number:
 *                 type: string
 *                 example: "12345678901"
 *               source_of_data:
 *                 type: string
 *                 example: "Manual Entry"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@sunshinecare.com.au"
 *                 description: "Email address for facility login (optional)"
 *               password:
 *                 type: string
 *                 example: "SecurePass123"
 *                 description: "Password for facility login (optional)"
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
router.post('/', FacilityController.create);

/**
 * @swagger
 * /api/facilities:
 *   get:
 *     summary: List facilities (full details)
 *     tags:
 *       - Facilities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
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
 *       401:
 *         description: Unauthorized
 */
router.get('/', FacilityController.list);

/**
 * @swagger
 * /api/facilities/simplified:
 *   get:
 *     summary: List facilities (simplified - Name, Location, Slots)
 *     description: Returns only essential fields - facility_id, name, location, available_slots, num_branches, has_mou
 *     tags:
 *       - Facilities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search in facility name
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
 *       401:
 *         description: Unauthorized
 */
router.get('/simplified', FacilityController.listSimplified);

/**
 * @swagger
 * /api/facilities/{id}:
 *   get:
 *     summary: Get facility by ID
 *     tags:
 *       - Facilities
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
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', FacilityController.getById);

/**
 * @swagger
 * /api/facilities/{id}:
 *   put:
 *     summary: Update facility
 *     tags:
 *       - Facilities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *       200:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', FacilityController.update);

/**
 * @swagger
 * /api/facilities/{id}/complete:
 *   put:
 *     summary: Update facility with all related data (attributes, branches, agreements, etc.)
 *     description: Updates facility and all its related entities in a single transaction. Any provided arrays will completely replace existing data.
 *     tags:
 *       - Facilities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               organization_name:
 *                 type: string
 *               registered_business_name:
 *                 type: string
 *               website_url:
 *                 type: string
 *               abn_registration_number:
 *                 type: string
 *               source_of_data:
 *                 type: string
 *               attributes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     attribute_type:
 *                       type: string
 *                     attribute_value:
 *                       type: string
 *               organization_structures:
 *                 type: array
 *                 items:
 *                   type: object
 *               branches:
 *                 type: array
 *                 items:
 *                   type: object
 *               agreements:
 *                 type: array
 *                 items:
 *                   type: object
 *               documents_required:
 *                 type: array
 *                 items:
 *                   type: object
 *               rules:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/complete', FacilityController.updateComplete);

/**
 * @swagger
 * /api/facilities/{id}:
 *   delete:
 *     summary: Delete facility
 *     tags:
 *       - Facilities
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
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', FacilityController.delete);

/**
 * @swagger
 * /api/facilities/{id}/permanent:
 *   delete:
 *     summary: Permanently delete facility
 *     tags:
 *       - Facilities
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
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id/permanent', FacilityController.permanentlyDelete);

// Facility Attributes
/**
 * @swagger
 * /api/facilities/{facilityId}/attributes:
 *   post:
 *     summary: Create attribute
 *     tags:
 *       - Facility Attributes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
router.post('/:facilityId/attributes', FacilityAttributeController.create);

/**
 * @swagger
 * /api/facilities/{facilityId}/attributes:
 *   get:
 *     summary: Get attributes
 *     tags:
 *       - Facility Attributes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/:facilityId/attributes', FacilityAttributeController.getByFacilityId);

/**
 * @swagger
 * /api/facilities/attributes/{id}:
 *   put:
 *     summary: Update attribute
 *     tags:
 *       - Facility Attributes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               attribute_type:
 *                 type: string
 *                 enum:
 *                   - Category
 *                   - State
 *                 example: "State"
 *               attribute_value:
 *                 type: string
 *                 example: "VIC"
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 */
router.put('/attributes/:id', FacilityAttributeController.update);

/**
 * @swagger
 * /api/facilities/attributes/{id}:
 *   delete:
 *     summary: Delete attribute
 *     tags:
 *       - Facility Attributes
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
 *       401:
 *         description: Unauthorized
 */
router.delete('/attributes/:id', FacilityAttributeController.delete);

// Facility Organization
/**
 * @swagger
 * /api/facilities/{facilityId}/organization:
 *   post:
 *     summary: Create organization structure
 *     tags:
 *       - Facility Organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/:facilityId/organization', FacilityOrganizationController.create);

/**
 * @swagger
 * /api/facilities/{facilityId}/organization:
 *   get:
 *     summary: Get organization structures
 *     tags:
 *       - Facility Organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:facilityId/organization', FacilityOrganizationController.getByFacilityId);

/**
 * @swagger
 * /api/facilities/organization/{id}:
 *   get:
 *     summary: Get organization structure by ID
 *     tags:
 *       - Facility Organization
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
 *         description: Success
 */
router.get('/organization/:id', FacilityOrganizationController.getById);

/**
 * @swagger
 * /api/facilities/organization/{id}:
 *   put:
 *     summary: Update organization structure
 *     tags:
 *       - Facility Organization
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
 *         description: Updated
 */
router.put('/organization/:id', FacilityOrganizationController.update);

/**
 * @swagger
 * /api/facilities/organization/{id}:
 *   delete:
 *     summary: Delete organization structure
 *     tags:
 *       - Facility Organization
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
router.delete('/organization/:id', FacilityOrganizationController.delete);

// Facility Branches
/**
 * @swagger
 * /api/facilities/{facilityId}/branches:
 *   post:
 *     summary: Create branch/site
 *     tags:
 *       - Facility Branches
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/:facilityId/branches', FacilityBranchController.create);

/**
 * @swagger
 * /api/facilities/{facilityId}/branches:
 *   get:
 *     summary: Get branches/sites
 *     tags:
 *       - Facility Branches
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:facilityId/branches', FacilityBranchController.getByFacilityId);

/**
 * @swagger
 * /api/facilities/branches/{id}:
 *   get:
 *     summary: Get branch/site by ID
 *     tags:
 *       - Facility Branches
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
 *         description: Success
 */
router.get('/branches/:id', FacilityBranchController.getById);

/**
 * @swagger
 * /api/facilities/branches/{id}:
 *   put:
 *     summary: Update branch/site
 *     tags:
 *       - Facility Branches
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
 *         description: Updated
 */
router.put('/branches/:id', FacilityBranchController.update);

/**
 * @swagger
 * /api/facilities/branches/{id}:
 *   delete:
 *     summary: Delete branch/site
 *     tags:
 *       - Facility Branches
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
router.delete('/branches/:id', FacilityBranchController.delete);

// Facility Agreements
/**
 * @swagger
 * /api/facilities/{facilityId}/agreements:
 *   post:
 *     summary: Create agreement
 *     tags:
 *       - Facility Agreements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/:facilityId/agreements', FacilityAgreementController.create);

/**
 * @swagger
 * /api/facilities/{facilityId}/agreements:
 *   get:
 *     summary: Get agreements
 *     tags:
 *       - Facility Agreements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:facilityId/agreements', FacilityAgreementController.getByFacilityId);

/**
 * @swagger
 * /api/facilities/agreements/{id}:
 *   get:
 *     summary: Get agreement by ID
 *     tags:
 *       - Facility Agreements
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
 *         description: Success
 */
router.get('/agreements/:id', FacilityAgreementController.getById);

/**
 * @swagger
 * /api/facilities/agreements/{id}:
 *   put:
 *     summary: Update agreement
 *     tags:
 *       - Facility Agreements
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
 *         description: Updated
 */
router.put('/agreements/:id', FacilityAgreementController.update);

/**
 * @swagger
 * /api/facilities/agreements/{id}:
 *   delete:
 *     summary: Delete agreement
 *     tags:
 *       - Facility Agreements
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
router.delete('/agreements/:id', FacilityAgreementController.delete);

// Facility Documents
/**
 * @swagger
 * /api/facilities/{facilityId}/documents:
 *   post:
 *     summary: Create document requirement
 *     tags:
 *       - Facility Documents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/:facilityId/documents', FacilityDocumentController.create);

/**
 * @swagger
 * /api/facilities/{facilityId}/documents:
 *   get:
 *     summary: Get document requirements
 *     tags:
 *       - Facility Documents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:facilityId/documents', FacilityDocumentController.getByFacilityId);

/**
 * @swagger
 * /api/facilities/documents/{id}:
 *   get:
 *     summary: Get document requirement by ID
 *     tags:
 *       - Facility Documents
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
 *         description: Success
 */
router.get('/documents/:id', FacilityDocumentController.getById);

/**
 * @swagger
 * /api/facilities/documents/{id}:
 *   put:
 *     summary: Update document requirement
 *     tags:
 *       - Facility Documents
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
 *         description: Updated
 */
router.put('/documents/:id', FacilityDocumentController.update);

/**
 * @swagger
 * /api/facilities/documents/{id}:
 *   delete:
 *     summary: Delete document requirement
 *     tags:
 *       - Facility Documents
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
router.delete('/documents/:id', FacilityDocumentController.delete);

// Facility Rules
/**
 * @swagger
 * /api/facilities/{facilityId}/rules:
 *   post:
 *     summary: Create facility rules
 *     tags:
 *       - Facility Rules
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/:facilityId/rules', FacilityRuleController.create);

/**
 * @swagger
 * /api/facilities/{facilityId}/rules:
 *   get:
 *     summary: Get facility rules
 *     tags:
 *       - Facility Rules
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:facilityId/rules', FacilityRuleController.getByFacilityId);

/**
 * @swagger
 * /api/facilities/rules/{id}:
 *   get:
 *     summary: Get facility rules by ID
 *     tags:
 *       - Facility Rules
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
 *         description: Success
 */
router.get('/rules/:id', FacilityRuleController.getById);

/**
 * @swagger
 * /api/facilities/rules/{id}:
 *   put:
 *     summary: Update facility rules
 *     tags:
 *       - Facility Rules
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
 *         description: Updated
 */
router.put('/rules/:id', FacilityRuleController.update);

/**
 * @swagger
 * /api/facilities/rules/{id}:
 *   delete:
 *     summary: Delete facility rules
 *     tags:
 *       - Facility Rules
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
router.delete('/rules/:id', FacilityRuleController.delete);

export default router;
