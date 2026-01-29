import { getRepository, SelectQueryBuilder, In } from 'typeorm';
import { Facility } from '../entities/facility/facility.entity';
import { FacilityAttribute } from '../entities/facility/facility-attribute.entity';
import { FacilityOrganizationStructure } from '../entities/facility/facility-organization-structure.entity';
import { FacilityBranchSite } from '../entities/facility/facility-branch-site.entity';
import { FacilityAgreement } from '../entities/facility/facility-agreement.entity';
import { FacilityDocumentRequired } from '../entities/facility/facility-document-required.entity';
import { FacilityRule } from '../entities/facility/facility-rule.entity';
import ApiUtility from '../utilities/api.utility';

export default class FacilityRepository {
  private static getBaseQuery(): SelectQueryBuilder<Facility> {
    return getRepository(Facility)
      .createQueryBuilder('facility')
      .where('facility.isDeleted = :isDeleted', { isDeleted: false });
  }

  static async findById(id: number): Promise<Facility | undefined> {
    return await getRepository(Facility).findOne({
      where: { facility_id: id, isDeleted: false }
    });
  }

  static async findByIdWithRelations(id: number): Promise<Facility | undefined> {
    return await getRepository(Facility).findOne({
      where: { facility_id: id, isDeleted: false },
      relations: [
        'attributes',
        'organizationStructures',
        'branches',
        'agreements',
        'documentsRequired',
        'rules'
      ]
    });
  }

  static buildFilteredQuery(params: IFacilityFilters): SelectQueryBuilder<Facility> {
    let query = this.getBaseQuery();

    // Keyword search
    if (params.keyword) {
      query = query.andWhere(
        '(LOWER(facility.organization_name) LIKE LOWER(:keyword) OR LOWER(facility.registered_business_name) LIKE LOWER(:keyword) OR facility.abn_registration_number LIKE :keyword)',
        { keyword: `%${params.keyword}%` }
      );
    }

    // Source of data filter
    if (params.source_of_data) {
      query = query.andWhere('facility.source_of_data = :source', { 
        source: params.source_of_data 
      });
    }

    // State filter (supports multiple states)
    if (params.state) {
      const states = Array.isArray(params.state) ? params.state : [params.state];
      const stateConditions = states.map((_, index) => 
        `JSON_CONTAINS(facility.states_covered, JSON_QUOTE(:state${index}))`
      ).join(' OR ');
      
      const stateParams: any = {};
      states.forEach((state, index) => {
        stateParams[`state${index}`] = state;
      });
      
      query = query.andWhere(`(${stateConditions})`, stateParams);
    }

    // Category filter (supports multiple categories)
    if (params.category) {
      const categories = Array.isArray(params.category) ? params.category : [params.category];
      const categoryConditions = categories.map((_, index) => 
        `JSON_CONTAINS(facility.categories, JSON_QUOTE(:category${index}))`
      ).join(' OR ');
      
      const categoryParams: any = {};
      categories.forEach((category, index) => {
        categoryParams[`category${index}`] = category;
      });
      
      query = query.andWhere(`(${categoryConditions})`, categoryParams);
    }

    // Created date range filter
    if (params.created_from) {
      query = query.andWhere('facility.createdAt >= :created_from', { 
        created_from: params.created_from 
      });
    }

    if (params.created_to) {
      query = query.andWhere('facility.createdAt <= :created_to', { 
        created_to: params.created_to 
      });
    }

    return query;
  }

  static applySorting(
    query: SelectQueryBuilder<Facility>,
    sortBy: string = 'facility_id',
    sortOrder: string = 'DESC'
  ): SelectQueryBuilder<Facility> {
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    return query.orderBy(`facility.${sortBy}`, order);
  }

  static applyPagination(
    query: SelectQueryBuilder<Facility>,
    limit: number = 20,
    page: number = 1
  ): SelectQueryBuilder<Facility> {
    const offset = ApiUtility.getOffset(limit, page);
    return query.limit(limit).offset(offset);
  }

  static async findWithFilters(params: IFacilityQueryParams): Promise<{
    facilities: Facility[];
    total: number;
  }> {
    let query = this.buildFilteredQuery(params);
    
    // Load relations needed for filtering and display
    query = query.leftJoinAndSelect('facility.organizationStructures', 'organizationStructures')
                 .leftJoinAndSelect('facility.agreements', 'agreements');

    // Apply MOU filters after joining agreements
    if (params.has_mou && params.has_mou !== 'all') {
      const hasMou = params.has_mou === 'true';
      query = query.andWhere('agreements.has_mou = :has_mou', { has_mou: hasMou });
    }

    // MOU expiring soon filter (within 30 days)
    if (params.mou_expiring_soon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      query = query.andWhere('agreements.expiry_date IS NOT NULL')
                   .andWhere('agreements.expiry_date <= :expiry_threshold', { 
                     expiry_threshold: thirtyDaysFromNow.toISOString().split('T')[0]
                   })
                   .andWhere('agreements.expiry_date >= :today', {
                     today: new Date().toISOString().split('T')[0]
                   });
    }
    
    const total = await query.getCount();

    query = this.applySorting(query, params.sort_by, params.sort_order);
    query = this.applyPagination(query, params.limit, params.page);

    const facilities = await query.getMany();

    return { facilities, total };
  }

  static async softDelete(id: number): Promise<void> {
    await getRepository(Facility).update(
      { facility_id: id, isDeleted: false },
      { isDeleted: true, updatedAt: new Date() }
    );
  }

  static async permanentlyDelete(id: number): Promise<void> {
    await getRepository(Facility).delete({ facility_id: id });
  }
}

export interface IFacilityFilters {
  keyword?: string;
  source_of_data?: string;
  state?: string | string[];
  category?: string | string[];
  has_mou?: 'true' | 'false' | 'all';
  mou_expiring_soon?: 'true' | 'false';
  created_from?: string;
  created_to?: string;
}

export interface IFacilityQueryParams extends IFacilityFilters {
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}
