import { getConnection, getRepository } from 'typeorm';
import { Facility } from '../../entities/facility/facility.entity';
import { FacilityAttribute } from '../../entities/facility/facility-attribute.entity';
import { FacilityOrganizationStructure } from '../../entities/facility/facility-organization-structure.entity';
import { FacilityBranchSite } from '../../entities/facility/facility-branch-site.entity';
import { FacilityAgreement } from '../../entities/facility/facility-agreement.entity';
import { FacilityDocumentRequired } from '../../entities/facility/facility-document-required.entity';
import { FacilityRule } from '../../entities/facility/facility-rule.entity';
import FacilityRepository from '../../repositories/facility.repository';
import { StringError } from '../../errors/string.error';
import { IUpdateFacility, IUpdateCompleteFacility, IAgreementFiles } from './facility.interfaces';
import FacilityCreationService from './facility-creation.service';

/**
 * Facility Update Service
 * Handles all update and delete operations for facilities
 */
class FacilityUpdateService {
  /**
   * Update facility (partial update)
   */
  async update(params: IUpdateFacility, agreementFiles?: Map<number, IAgreementFiles>) {
    const facility = await FacilityRepository.findById(params.id);
    if (!facility) {
      throw new StringError('Facility does not exist');
    }

    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const facilityId = params.id;

      // Update main facility fields
      const updateData: Partial<Facility> = { updatedAt: new Date() };
      
      if (params.organization_name !== undefined) updateData.organization_name = params.organization_name;
      if (params.registered_business_name !== undefined) updateData.registered_business_name = params.registered_business_name;
      if (params.website_url !== undefined) updateData.website_url = params.website_url;
      if (params.abn_registration_number !== undefined) updateData.abn_registration_number = params.abn_registration_number;
      if (params.source_of_data !== undefined) updateData.source_of_data = params.source_of_data;
      if (params.states_covered !== undefined) updateData.states_covered = params.states_covered;
      if (params.categories !== undefined) updateData.categories = params.categories;

      if (Object.keys(updateData).length > 1) {
        await queryRunner.manager.update(Facility, { facility_id: facilityId }, updateData);
      }

      // Update location if provided
      if (params.latitude !== undefined && params.longitude !== undefined) {
        await queryRunner.manager.query(
          `UPDATE facility SET location = POINT(?, ?) WHERE facility_id = ?`,
          [params.longitude, params.latitude, facilityId]
        );
      }

      // Update related entities if provided
      if (params.attributes) {
        await queryRunner.manager.delete(FacilityAttribute, { facility_id: facilityId });
        await this.createAttributes(queryRunner, facilityId, params.attributes);
      }

      if (params.organization_structures) {
        await queryRunner.manager.delete(FacilityOrganizationStructure, { facility_id: facilityId });
        await this.createOrganizationStructures(queryRunner, facilityId, params.organization_structures);
      }

      if (params.branches) {
        await queryRunner.manager.delete(FacilityBranchSite, { facility_id: facilityId });
        await this.createBranches(queryRunner, facilityId, params.branches);
      }

      if (params.documents_required) {
        await queryRunner.manager.delete(FacilityDocumentRequired, { facility_id: facilityId });
        await this.createDocumentsRequired(queryRunner, facilityId, params.documents_required);
      }

      if (params.rules) {
        await queryRunner.manager.delete(FacilityRule, { facility_id: facilityId });
        await this.createRules(queryRunner, facilityId, params.rules);
      }

      await queryRunner.commitTransaction();

      return await FacilityRepository.findByIdWithRelations(facilityId);
    } catch (error) {
      try {
        await queryRunner.rollbackTransaction();
      } catch (rollbackError) {
        console.error('⚠️ Rollback error:', rollbackError);
      }
      throw error;
    } finally {
      try {
        await queryRunner.release();
      } catch (releaseError) {
        console.error('⚠️ Release error:', releaseError);
      }
    }
  }

  /**
   * Complete update (replaces all related entities)
   */
  async updateComplete(params: IUpdateCompleteFacility) {
    return await this.update(params);
  }

  /**
   * Soft delete facility
   */
  async remove(id: number) {
    const facility = await FacilityRepository.findById(id);
    if (!facility) {
      throw new StringError('Facility does not exist');
    }

    return await getRepository(Facility).update(
      { facility_id: id },
      { isDeleted: true, updatedAt: new Date() }
    );
  }

  /**
   * Permanently delete facility
   */
  async permanentlyDelete(id: number) {
    const facility = await FacilityRepository.findById(id);
    if (!facility) {
      throw new StringError('Facility does not exist');
    }

    await getRepository(Facility).delete({ facility_id: id });
    return { success: true };
  }

  // Helper methods (reuse from creation service logic)
  private async createAttributes(queryRunner: any, facilityId: number, attributes: any[]) {
    const facilityAttrs = attributes.map(attr => {
      const facilityAttr = new FacilityAttribute();
      facilityAttr.facility_id = facilityId;
      facilityAttr.attribute_type = attr.attribute_type;
      facilityAttr.attribute_value = attr.attribute_value;
      return facilityAttr;
    });
    await queryRunner.manager.save(facilityAttrs);
  }

  private async createOrganizationStructures(queryRunner: any, facilityId: number, structures: any[]) {
    const orgStructures = structures.map(org => {
      const orgStruct = new FacilityOrganizationStructure();
      orgStruct.facility_id = facilityId;
      Object.assign(orgStruct, org);
      return orgStruct;
    });
    await queryRunner.manager.save(orgStructures);
  }

  private async createBranches(queryRunner: any, facilityId: number, branches: any[]) {
    const branchSites = branches.map(branch => {
      const branchSite = new FacilityBranchSite();
      branchSite.facility_id = facilityId;
      Object.assign(branchSite, {
        ...branch,
        palliative_care: branch.palliative_care || false,
        dementia_care: branch.dementia_care || false
      });
      return branchSite;
    });
    await queryRunner.manager.save(branchSites);
  }

  private async createDocumentsRequired(queryRunner: any, facilityId: number, documents: any[]) {
    const docs = documents.map(doc => {
      const document = new FacilityDocumentRequired();
      document.facility_id = facilityId;
      Object.assign(document, doc);
      return document;
    });
    await queryRunner.manager.save(docs);
  }

  private async createRules(queryRunner: any, facilityId: number, rules: any[]) {
    const facilityRules = rules.map(r => {
      const rule = new FacilityRule();
      rule.facility_id = facilityId;
      Object.assign(rule, r);
      return rule;
    });
    await queryRunner.manager.save(facilityRules);
  }
}

export default new FacilityUpdateService();
