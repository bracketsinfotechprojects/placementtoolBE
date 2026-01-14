import { getRepository } from 'typeorm';
import { FacilityRule } from '../../entities/facility/facility-rule.entity';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreateFacilityRule) => {
  const rule = new FacilityRule();
  Object.assign(rule, params);
  return await getRepository(FacilityRule).save(rule);
};

const getByFacilityId = async (facilityId: number) => {
  return await getRepository(FacilityRule).find({
    where: { facility_id: facilityId, isDeleted: false }
  });
};

const getById = async (id: number) => {
  return await getRepository(FacilityRule).findOne({
    where: { rule_id: id, isDeleted: false }
  });
};

const update = async (params: IUpdateFacilityRule) => {
  const rule = await getById(params.id);
  if (!rule) {
    throw new StringError('Rule does not exist');
  }

  const { id, ...updateData } = params;
  await getRepository(FacilityRule).update(
    { rule_id: id },
    { ...updateData, updatedAt: new Date() }
  );

  return await getById(id);
};

const remove = async (id: number) => {
  await getRepository(FacilityRule).update(
    { rule_id: id },
    { isDeleted: true, updatedAt: new Date() }
  );
};

export interface ICreateFacilityRule {
  facility_id: number;
  obligations?: string;
  obligations_univ?: string;
  obligations_student?: string;
  process_notes?: string;
  shift_rules?: string;
  attendance_policy?: string;
  dress_code?: string;
  behaviour_rules?: string;
  special_instr?: string;
}

export interface IUpdateFacilityRule extends Partial<ICreateFacilityRule> {
  id: number;
}

export default {
  create,
  getByFacilityId,
  getById,
  update,
  remove
};
