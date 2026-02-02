import { getRepository } from 'typeorm';
import { FacilityAgreement } from '../../entities/facility/facility-agreement.entity';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreateFacilityAgreement) => {
  const agreement = new FacilityAgreement();
  Object.assign(agreement, params);
  return await getRepository(FacilityAgreement).save(agreement);
};

const getByFacilityId = async (facilityId: number) => {
  return await getRepository(FacilityAgreement).find({
    where: { facility_id: facilityId, isDeleted: false }
  });
};

const getById = async (id: number) => {
  return await getRepository(FacilityAgreement).findOne({
    where: { agreement_id: id, isDeleted: false }
  });
};

const update = async (params: IUpdateFacilityAgreement) => {
  const agreement = await getById(params.id);
  if (!agreement) {
    throw new StringError('Agreement does not exist');
  }

  const { id, ...updateData } = params;
  await getRepository(FacilityAgreement).update(
    { agreement_id: id },
    { ...updateData, updatedAt: new Date() }
  );

  return await getById(id);
};

const remove = async (id: number) => {
  await getRepository(FacilityAgreement).update(
    { agreement_id: id },
    { isDeleted: true, updatedAt: new Date() }
  );
};

export interface ICreateFacilityAgreement {
  facility_id: number;
  sent_students?: boolean;
  with_mou?: boolean;
  no_mou_but_taken?: boolean;
  mou_exists_no_spot?: boolean;
  total_students?: number;
  last_placement?: Date;
  has_mou?: boolean;
  signed_on?: Date;
  expiry_date?: Date;
  company_name?: string[];
  payment_required?: boolean;
  amount_per_spot?: number;
  payment_notes?: string;
  mou_document?: string;
  insurance_doc?: string;
}

export interface IUpdateFacilityAgreement extends Partial<ICreateFacilityAgreement> {
  id: number;
}

export default {
  create,
  getByFacilityId,
  getById,
  update,
  remove
};
