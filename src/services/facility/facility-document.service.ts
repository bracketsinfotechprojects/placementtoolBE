import { getRepository } from 'typeorm';
import { FacilityDocumentRequired } from '../../entities/facility/facility-document-required.entity';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreateFacilityDocument) => {
  const document = new FacilityDocumentRequired();
  Object.assign(document, params);
  return await getRepository(FacilityDocumentRequired).save(document);
};

const getByFacilityId = async (facilityId: number) => {
  return await getRepository(FacilityDocumentRequired).find({
    where: { facility_id: facilityId, isDeleted: false }
  });
};

const getById = async (id: number) => {
  return await getRepository(FacilityDocumentRequired).findOne({
    where: { doc_req_id: id, isDeleted: false }
  });
};

const update = async (params: IUpdateFacilityDocument) => {
  const document = await getById(params.id);
  if (!document) {
    throw new StringError('Document requirement does not exist');
  }

  const { id, ...updateData } = params;
  await getRepository(FacilityDocumentRequired).update(
    { doc_req_id: id },
    { ...updateData, updatedAt: new Date() }
  );

  return await getById(id);
};

const remove = async (id: number) => {
  await getRepository(FacilityDocumentRequired).update(
    { doc_req_id: id },
    { isDeleted: true, updatedAt: new Date() }
  );
};

export interface ICreateFacilityDocument {
  facility_id: number;
  document_name?: string;
  notice_period_days?: number;
  orientation_req?: boolean;
  facilitator_req?: boolean;
}

export interface IUpdateFacilityDocument extends Partial<ICreateFacilityDocument> {
  id: number;
}

export default {
  create,
  getByFacilityId,
  getById,
  update,
  remove
};
