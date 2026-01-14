import { getRepository } from 'typeorm';
import { FacilityBranchSite } from '../../entities/facility/facility-branch-site.entity';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreateFacilityBranch) => {
  const branch = new FacilityBranchSite();
  Object.assign(branch, params);
  return await getRepository(FacilityBranchSite).save(branch);
};

const getByFacilityId = async (facilityId: number) => {
  return await getRepository(FacilityBranchSite).find({
    where: { facility_id: facilityId, isDeleted: false }
  });
};

const getById = async (id: number) => {
  return await getRepository(FacilityBranchSite).findOne({
    where: { branch_id: id, isDeleted: false }
  });
};

const update = async (params: IUpdateFacilityBranch) => {
  const branch = await getById(params.id);
  if (!branch) {
    throw new StringError('Branch does not exist');
  }

  const { id, ...updateData } = params;
  await getRepository(FacilityBranchSite).update(
    { branch_id: id },
    { ...updateData, updatedAt: new Date() }
  );

  return await getById(id);
};

const remove = async (id: number) => {
  await getRepository(FacilityBranchSite).update(
    { branch_id: id },
    { isDeleted: true, updatedAt: new Date() }
  );
};

export interface ICreateFacilityBranch {
  facility_id: number;
  site_code?: string;
  full_address?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  site_type?: string;
  palliative_care?: boolean;
  dementia_care?: boolean;
  num_beds?: number;
  gender_rules?: string;
  contact_name?: string;
  contact_role?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_comments?: string;
}

export interface IUpdateFacilityBranch extends Partial<ICreateFacilityBranch> {
  id: number;
}

export default {
  create,
  getByFacilityId,
  getById,
  update,
  remove
};
