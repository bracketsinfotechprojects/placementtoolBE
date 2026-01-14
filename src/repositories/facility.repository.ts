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

    if (params.keyword) {
      query = query.andWhere(
        '(LOWER(facility.organization_name) LIKE LOWER(:keyword) OR LOWER(facility.registered_business_name) LIKE LOWER(:keyword) OR facility.abn_registration_number LIKE :keyword)',
        { keyword: `%${params.keyword}%` }
      );
    }

    if (params.source_of_data) {
      query = query.andWhere('facility.source_of_data = :source', { 
        source: params.source_of_data 
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
    
    const total = await query.getCount();

    query = this.applySorting(query, params.sort_by, params.sort_order);
    query = this.applyPagination(query, params.limit, params.page);

    // Load relations for simplified view
    query = query.leftJoinAndSelect('facility.branches', 'branches')
                 .leftJoinAndSelect('facility.agreements', 'agreements');

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
}

export interface IFacilityQueryParams extends IFacilityFilters {
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}
