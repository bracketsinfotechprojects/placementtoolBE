import { Router } from 'express';
import FacilityAttributeController from '../../controllers/facility/facility-attribute.controller';
import FacilityOrganizationController from '../../controllers/facility/facility-organization.controller';
import FacilityBranchController from '../../controllers/facility/facility-branch.controller';
import FacilityAgreementController from '../../controllers/facility/facility-agreement.controller';
import FacilityDocumentController from '../../controllers/facility/facility-document.controller';
import FacilityRuleController from '../../controllers/facility/facility-rule.controller';
import { uploadMultiple } from '../../configs/multer.config';

const router = Router();

/**
 * Facility Related Entities Routes
 * Attributes, Organization, Branches, Agreements, Documents, Rules
 */

// ==================== ATTRIBUTES ====================
router.post('/:facilityId/attributes', FacilityAttributeController.create);
router.get('/:facilityId/attributes', FacilityAttributeController.getByFacilityId);
router.put('/attributes/:id', FacilityAttributeController.update);
router.delete('/attributes/:id', FacilityAttributeController.delete);

// ==================== ORGANIZATION ====================
router.post('/:facilityId/organization', FacilityOrganizationController.create);
router.get('/:facilityId/organization', FacilityOrganizationController.getByFacilityId);
router.get('/organization/:id', FacilityOrganizationController.getById);
router.put('/organization/:id', FacilityOrganizationController.update);
router.delete('/organization/:id', FacilityOrganizationController.delete);

// ==================== BRANCHES ====================
router.post('/:facilityId/branches', FacilityBranchController.create);
router.get('/:facilityId/branches', FacilityBranchController.getByFacilityId);
router.get('/branches/:id', FacilityBranchController.getById);
router.put('/branches/:id', FacilityBranchController.update);
router.delete('/branches/:id', FacilityBranchController.delete);

// ==================== AGREEMENTS ====================
router.post('/:facilityId/agreements', uploadMultiple.fields([
  { name: 'mou_document', maxCount: 1 },
  { name: 'insurance_doc', maxCount: 1 }
]), FacilityAgreementController.create);
router.get('/:facilityId/agreements', FacilityAgreementController.getByFacilityId);
router.get('/agreements/:id', FacilityAgreementController.getById);
router.put('/agreements/:id', uploadMultiple.fields([
  { name: 'mou_document', maxCount: 1 },
  { name: 'insurance_doc', maxCount: 1 }
]), FacilityAgreementController.update);
router.delete('/agreements/:id', FacilityAgreementController.delete);

// ==================== DOCUMENTS ====================
router.post('/:facilityId/documents', FacilityDocumentController.create);
router.get('/:facilityId/documents', FacilityDocumentController.getByFacilityId);
router.get('/documents/:id', FacilityDocumentController.getById);
router.put('/documents/:id', FacilityDocumentController.update);
router.delete('/documents/:id', FacilityDocumentController.delete);

// ==================== RULES ====================
router.post('/:facilityId/rules', FacilityRuleController.create);
router.get('/:facilityId/rules', FacilityRuleController.getByFacilityId);
router.get('/rules/:id', FacilityRuleController.getById);
router.put('/rules/:id', FacilityRuleController.update);
router.delete('/rules/:id', FacilityRuleController.delete);

export default router;
