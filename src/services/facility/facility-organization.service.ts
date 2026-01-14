import { getRepository } from 'typeorm';
import { FacilityOrganizationStructure, DealWithType } from '../../entities/facility/facility-organization-structure.entity';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreateFacilityOrganization) => {
  const orgStructure = new FacilityOrganizationStructure();
  Object.assign(orgStructure, params);
  return await getRepository(FacilityOrganizationStructure).save(orgStructure);
};

const getByFacilityId = async (facilityId: number) => {
  return await getRepository(FacilityOrganizationStructure).find({
    where: { facility_id: facilityId, isDeleted: false }
  });
};

const getById = async (id: number) => {
  return await getRepository(FacilityOrganizationStructure).findOne({
    where: { org_struct_id: id, isDeleted: false }
  });
};

const update = async (params: IUpdateFacilityOrganization) => {
  const orgStructure = await getById(params.id);
  if (!orgStructure) {
    throw new StringError('Organization structure does not exist');
  }

  const { id, ...updateData } = params;
  await getRepository(FacilityOrganizationStructure).update(
    { org_struct_id: id },
    { ...updateData, updatedAt: new Date() }
  );

  return await getById(id);
};

const remove = async (id: number) => {
  await getRepository(FacilityOrganizationStructure).update(
    { org_struct_id: id },
    { isDeleted: true, updatedAt: new Date() }
  );
};

export interface ICreateFacilityOrganization {
  facility_id: number;
  deal_with: DealWithType;
  head_office_addr?: string;
  contact_name?: string;
  designation?: string;
  phone?: string;
  email?: string;
  alternate_contact?: string;
  notes?: string;
}

export interface IUpdateFacilityOrganization extends Partial<ICreateFacilityOrganization> {
  id: number;
}

export default {
  create,
  getByFacilityId,
  getById,
  update,
  remove
};
