import express from 'express';
import FacilityController from '../../controllers/facility/facility.controller';
import FacilityAttributeController from '../../controllers/facility/facility-attribute.controller';
import FacilityBranchController from '../../controllers/facility/facility-branch.controller';
import FacilityAgreementController from '../../controllers/facility/facility-agreement.controller';
import FacilityOrganizationController from '../../controllers/facility/facility-organization.controller';
import FacilityDocumentController from '../../controllers/facility/facility-document.controller';
import FacilityRuleController from '../../controllers/facility/facility-rule.controller';
import { uploadMultiple } from '../../configs/multer.config';

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
 *     summary: Create facility with optional agreement document uploads
 *     tags:
 *       - Facilities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               password:
 *                 type: string
 *                 example: "SecurePass123"
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: -33.8688
 *                 description: "Latitude coordinate (optional, can be added later)"
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 151.2093
 *                 description: "Longitude coordinate (optional, can be added later)"
 *               states_covered:
 *                 type: string
 *                 example: '["NSW", "VIC"]'
 *               categories:
 *                 type: string
 *                 example: '["Aged Care"]'
 *               agreements:
 *                 type: string
 *                 example: '[{"has_mou": true, "signed_on": "2024-01-01", "expiry_date": "2025-12-31"}]'
 *                 description: JSON string array of agreements
 *               mou_document_0:
 *                 type: string
 *                 format: binary
 *                 description: MOU document for first agreement (index 0)
 *               insurance_doc_0:
 *                 type: string
 *                 format: binary
 *                 description: Insurance document for first agreement (index 0)
 *               mou_document_1:
 *                 type: string
 *                 format: binary
 *                 description: MOU document for second agreement (index 1)
 *               insurance_doc_1:
 *                 type: string
 *                 format: binary
 *                 description: Insurance document for second agreement (index 1)
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
router.post('/', uploadMultiple.any(), FacilityController.create);

/**
 * @swagger
 * /api/facilities/bulk-upload:
 *   post:
 *     summary: Bulk upload facilities from Excel file with all fields (except file uploads)
 *     description: |
 *       Upload multiple facilities with complete data including nested structures.
 *       
 *       **Excel Columns:**
 *       
 *       **Basic Fields:**
 *       - organization_name (required) - Organization name
 *       - registered_business_name - Registered business name
 *       - website_url - Website URL
 *       - abn_registration_number - ABN registration number
 *       - source_of_data - Source of data
 *       - email - Email for user account (requires password)
 *       - password - Password for user account (requires email)
 *       - latitude - Latitude coordinate (-90 to 90)
 *       - longitude - Longitude coordinate (-180 to 180)
 *       - states_covered - Comma-separated states (e.g., "NSW,VIC,QLD")
 *       - categories - Comma-separated categories (e.g., "Aged Care,Disability")
 *       
 *       **Nested Fields (JSON Format):**
 *       - attributes - JSON array: [{"attribute_type":"Category","attribute_value":"Aged Care"}]
 *         * attribute_type values: Category, State, care_type, capacity, facility_type, accreditation, specialty
 *       - organization_structures - JSON array: [{"deal_with":"Head Office","contact_name":"John","phone":"0412345678","email":"john@facility.com"}]
 *         * deal_with values: Head Office, Branch, Both
 *       - branches - JSON array: [{"site_code":"SC001","city":"Sydney","state":"NSW","postcode":"2000","num_beds":50}]
 *       - agreements - JSON array: [{"has_mou":true,"signed_on":"2024-01-01","expiry_date":"2025-12-31"}] (file uploads excluded)
 *       - documents_required - JSON array: [{"document_name":"Police Check","notice_period_days":7,"orientation_req":true}]
 *       - rules - JSON array: [{"obligations":"Follow safety protocols","shift_rules":"8 hour shifts"}]
 *       
 *       **Important:**
 *       - Maximum 500 records per upload
 *       - All-or-nothing transaction (if one fails, all rollback)
 *       - JSON fields must be valid JSON format (double quotes, single line)
 *       - File uploads (mou_document, insurance_doc) must be added via update API
 *       - Validates all records before creating any
 *       - Automatically creates user accounts when email/password provided
 *     tags:
 *       - Facilities
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
 *                   Excel file (.xlsx) with facility data.
 *                   Download template: facilities_bulk_upload_template.xlsx
 *                   See BULK_FACILITIES_COMPLETE_GUIDE.md for detailed field descriptions.
 *     responses:
 *       201:
 *         description: Bulk upload completed successfully
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
 *                   example: "Bulk upload completed: 3 facilities created"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRows:
 *                       type: number
 *                       example: 3
 *                     successCount:
 *                       type: number
 *                       example: 3
 *                     failureCount:
 *                       type: number
 *                       example: 0
 *                     createdFacilities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           facility_id:
 *                             type: number
 *                             example: 101
 *                           organization_name:
 *                             type: string
 *                             example: "Sunshine Care Home"
 *       400:
 *         description: Validation errors or bulk upload failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Bulk upload failed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRows:
 *                       type: number
 *                       example: 3
 *                     successCount:
 *                       type: number
 *                       example: 0
 *                     failureCount:
 *                       type: number
 *                       example: 2
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: number
 *                             example: 2
 *                           organization_name:
 *                             type: string
 *                             example: "Test Facility"
 *                           errors:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Invalid email format", "attributes must be valid JSON format"]
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large or too many records (max 500)
 */
router.post('/bulk-upload', uploadMultiple.single('file'), FacilityController.bulkUpload);


/**
 * @swagger
 * /api/facilities:
 *   get:
 *     summary: List facilities (full details with advanced filters)
 *     description: Returns facilities with organization name, email, phone, website, MOU dates, states, categories, and more. Supports multiple filter options including array filters for states and categories.
 *     tags:
 *       - Facilities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search across organization name, registered business name, and ABN
 *         example: "CareWell"
 *       - in: query
 *         name: organization_name
 *         schema:
 *           type: string
 *         description: Filter by organization name (partial match)
 *         example: "CareWell Services"
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email address (partial match)
 *         example: "laura.mitchell@carewellservices.com.au"
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Filter by phone number (partial match)
 *         example: "0411222333"
 *       - in: query
 *         name: website_url
 *         schema:
 *           type: string
 *         description: Filter by website URL (partial match)
 *         example: "carewellservices.com.au"
 *       - in: query
 *         name: activation_status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: active
 *         description: Filter by facility activation status (active = not deleted, inactive = deleted, all = both)
 *         example: "active"
 *       - in: query
 *         name: source_of_data
 *         schema:
 *           type: string
 *         description: Filter by source of data (supports comma-separated values for multiple sources)
 *         example: "Manual Entry,Import"
 *       - in: query
 *         name: states_covered
 *         schema:
 *           type: string
 *         description: Filter by states covered (supports comma-separated values, matches ANY)
 *         example: "NSW,VIC,QLD"
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Filter by categories (supports comma-separated values, matches ANY)
 *         example: "Aged Care,Disability Support"
 *       - in: query
 *         name: has_mou
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *         description: Filter by MOU status
 *         example: "true"
 *       - in: query
 *         name: mou_expiring_soon
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter facilities with MOU expiring within 30 days
 *         example: "true"
 *       - in: query
 *         name: mou_start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by MOU start date (exact match)
 *         example: "2024-05-15"
 *       - in: query
 *         name: mou_end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by MOU end date (exact match)
 *         example: "2027-05-15"
 *       - in: query
 *         name: created_at
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by creation date (exact match)
 *         example: "2026-01-27"
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: facility_id
 *         description: Field to sort by
 *         example: "organization_name"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Facilities retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       facility_id:
 *                         type: integer
 *                         example: 1
 *                       organization_name:
 *                         type: string
 *                         example: "CareWell Services"
 *                       email:
 *                         type: string
 *                         example: "laura.mitchell@carewellservices.com.au"
 *                       phone:
 *                         type: string
 *                         example: "0411222333"
 *                       website_url:
 *                         type: string
 *                         example: "https://carewellservices.com.au"
 *                       mou_start_date:
 *                         type: string
 *                         format: date
 *                         example: "2024-05-15"
 *                       mou_end_date:
 *                         type: string
 *                         format: date
 *                         example: "2027-05-15"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-01-27T13:46:36.057Z"
 *                       states_covered:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["NSW", "VIC", "QLD", "TAS", "ACT"]
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Aged Care", "Community Care", "Disability Support"]
 *                       has_mou:
 *                         type: boolean
 *                         example: true
 *                       source_of_data:
 *                         type: string
 *                         example: "Manual Entry"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 3
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
 *         multipart/form-data:
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
 *               states_covered:
 *                 type: string
 *                 example: '["NSW", "VIC"]'
 *               categories:
 *                 type: string
 *                 example: '["Aged Care"]'
 *               attributes:
 *                 type: string
 *                 example: '[{"attribute_type":"Category","attribute_value":"Residential Care"}]'
 *               organization_structures:
 *                 type: string
 *                 example: '[{"deal_with":"Head Office","contact_name":"John"}]'
 *               branches:
 *                 type: string
 *                 example: '[{"site_code":"NSW001","city":"Sydney"}]'
 *               agreements:
 *                 type: string
 *                 example: '[{"has_mou":true,"signed_on":"2025-01-10"}]'
 *               documents_required:
 *                 type: string
 *                 example: '[{"document_name":"Police Check"}]'
 *               rules:
 *                 type: string
 *                 example: '[{"obligations":"Provide supervision"}]'
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
 *               states_covered:
 *                 type: array
 *                 items:
 *                   type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: -33.8688
 *                 description: "Latitude coordinate (optional)"
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 151.2093
 *                 description: "Longitude coordinate (optional)"
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
router.put('/:id/complete', uploadMultiple.any(), FacilityController.updateComplete);

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
 *     summary: Update facility with all related data and optional file uploads
 *     description: Updates facility and all its related entities (attributes, organization_structures, branches, agreements, documents_required, rules) in a single transaction. Supports file uploads for agreement documents. Only provide fields you want to update - omitted fields remain unchanged.
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
 *         multipart/form-data:
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
 *               states_covered:
 *                 type: string
 *                 example: '["NSW", "VIC", "QLD"]'
 *                 description: JSON string array of states
 *               categories:
 *                 type: string
 *                 example: '["Aged Care", "Residential Care"]'
 *                 description: JSON string array of categories
 *               attributes:
 *                 type: string
 *                 example: '[{"attribute_type":"Category","attribute_value":"Residential Care"},{"attribute_type":"State","attribute_value":"NSW"}]'
 *                 description: JSON string array of attributes. Valid attribute_type values - Category, State, care_type, capacity, facility_type, accreditation, specialty
 *               organization_structures:
 *                 type: string
 *                 example: '[{"deal_with":"Head Office","head_office_addr":"123 Main St","contact_name":"John Doe","designation":"Manager","phone":"0412345678","email":"john@example.com"}]'
 *                 description: JSON string array of organization structures
 *               branches:
 *                 type: string
 *                 example: '[{"site_code":"NSW001","full_address":"456 Branch St","suburb":"Sydney","city":"Sydney","state":"NSW","postcode":"2000","site_type":"Residential Aged Care","palliative_care":true,"dementia_care":true,"num_beds":100,"gender_rules":"All genders","contact_name":"Jane Smith","contact_role":"Branch Manager","contact_phone":"0423456789","contact_email":"jane@example.com"}]'
 *                 description: JSON string array of branches/sites
 *               agreements:
 *                 type: string
 *                 example: '[{"sent_students":true,"with_mou":true,"has_mou":true,"signed_on":"2025-01-10","expiry_date":"2027-01-10","company_name":["University of Sydney"],"payment_required":true,"amount_per_spot":"750.00","payment_notes":"Payment due 30 days before"}]'
 *                 description: JSON string array of agreements
 *               documents_required:
 *                 type: string
 *                 example: '[{"document_name":"Police Check","notice_period_days":30,"orientation_req":true,"facilitator_req":true}]'
 *                 description: JSON string array of required documents
 *               rules:
 *                 type: string
 *                 example: '[{"obligations":"Provide supervision","obligations_univ":"Ensure training completed","obligations_student":"Maintain 95% attendance","shift_rules":"7am-3pm, 3pm-11pm","attendance_policy":"Minimum 95% required","dress_code":"Business casual","behaviour_rules":"Professional conduct","special_instr":"Complete infection control training"}]'
 *                 description: JSON string array of facility rules
 *               mou_document_0:
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: -33.8688
 *                 description: "Latitude coordinate (optional)"
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 151.2093
 *                 description: "Longitude coordinate (optional)"
 *               mou_document:
 *                 type: string
 *                 format: binary
 *                 description: MOU document for first agreement (index 0). Uploads new file and updates path.
 *               insurance_doc_0:
 *                 type: string
 *                 format: binary
 *                 description: Insurance document for first agreement (index 0). Uploads new file and updates path.
 *               mou_document_1:
 *                 type: string
 *                 format: binary
 *                 description: MOU document for second agreement (index 1)
 *               insurance_doc_1:
 *                 type: string
 *                 format: binary
 *                 description: Insurance document for second agreement (index 1)
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
 *               states_covered:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["NSW", "VIC", "QLD"]
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Aged Care", "Residential Care"]
 *               attributes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     attribute_type:
 *                       type: string
 *                       enum: [Category, State, care_type, capacity, facility_type, accreditation, specialty]
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
 *         description: Facility updated successfully with all relations
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Facility not found
 */
router.put('/:id', uploadMultiple.any(), FacilityController.update);

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
 *     summary: Create agreement with optional document uploads
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
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sent_students:
 *                 type: boolean
 *                 example: true
 *               with_mou:
 *                 type: boolean
 *                 example: true
 *               no_mou_but_taken:
 *                 type: boolean
 *                 example: false
 *               mou_exists_no_spot:
 *                 type: boolean
 *                 example: false
 *               total_students:
 *                 type: integer
 *                 example: 10
 *               last_placement:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               has_mou:
 *                 type: boolean
 *                 example: true
 *               signed_on:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               expiry_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               company_name:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Company A", "Company B"]
 *               payment_required:
 *                 type: boolean
 *                 example: false
 *               amount_per_spot:
 *                 type: number
 *                 example: 0
 *               payment_notes:
 *                 type: string
 *                 example: "No payment required"
 *               mou_document:
 *                 type: string
 *                 format: binary
 *                 description: MOU document file (PDF, Images, Word, Excel)
 *               insurance_doc:
 *                 type: string
 *                 format: binary
 *                 description: Insurance document file (PDF, Images, Word, Excel)
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Agreement created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     agreement_id:
 *                       type: integer
 *                       example: 1
 *                     facility_id:
 *                       type: integer
 *                       example: 1
 *                     mou_document:
 *                       type: string
 *                       example: "uploads/facility-agreements/1/MOU_DOCUMENT_xxx.pdf"
 *                     insurance_doc:
 *                       type: string
 *                       example: "uploads/facility-agreements/1/INSURANCE_DOCUMENT_xxx.pdf"
 *       401:
 *         description: Unauthorized
 */
router.post('/:facilityId/agreements', uploadMultiple.fields([
  { name: 'mou_document', maxCount: 1 },
  { name: 'insurance_doc', maxCount: 1 }
]), FacilityAgreementController.create);

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
 *     summary: Update agreement with optional document uploads
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
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sent_students:
 *                 type: boolean
 *               with_mou:
 *                 type: boolean
 *               no_mou_but_taken:
 *                 type: boolean
 *               mou_exists_no_spot:
 *                 type: boolean
 *               total_students:
 *                 type: integer
 *               last_placement:
 *                 type: string
 *                 format: date
 *               has_mou:
 *                 type: boolean
 *               signed_on:
 *                 type: string
 *                 format: date
 *               expiry_date:
 *                 type: string
 *                 format: date
 *               company_name:
 *                 type: array
 *                 items:
 *                   type: string
 *               payment_required:
 *                 type: boolean
 *               amount_per_spot:
 *                 type: number
 *               payment_notes:
 *                 type: string
 *               mou_document:
 *                 type: string
 *                 format: binary
 *                 description: MOU document file (PDF, Images, Word, Excel)
 *               insurance_doc:
 *                 type: string
 *                 format: binary
 *                 description: Insurance document file (PDF, Images, Word, Excel)
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 */
router.put('/agreements/:id', uploadMultiple.fields([
  { name: 'mou_document', maxCount: 1 },
  { name: 'insurance_doc', maxCount: 1 }
]), FacilityAgreementController.update);

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

/**
 * @swagger
 * /api/facilities/{id}/slots:
 *   get:
 *     summary: Get placement slots for a facility
 *     description: |
 *       Retrieve all placement slots associated with a specific facility.
 *       
 *       Returns slots with:
 *       - Slot details (type, courses, dates, hours)
 *       - Availability information (total slots, remaining seats)
 *       - Shift and working details
 *       - Requirements and restrictions
 *       
 *       Supports filtering and pagination.
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
 *         description: Facility ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: active
 *         description: Filter by slot status (active = not deleted, inactive = deleted, all = both)
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
 *         name: has_available_seats
 *         schema:
 *           type: boolean
 *         description: Filter to show only slots with available seats
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: placement_start_date
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
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
 *         description: Facility slots retrieved successfully
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
 *                   example: "Facility slots retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       placementslot_id:
 *                         type: integer
 *                         example: 1
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
 *                       example: 2
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
 *                       example: 25
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/slots', FacilityController.getSlots);

export default router;
