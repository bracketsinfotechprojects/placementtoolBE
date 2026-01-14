import { getRepository } from 'typeorm';
import { FacilityAttribute, AttributeType } from '../../entities/facility/facility-attribute.entity';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreateFacilityAttribute) => {
  const attribute = new FacilityAttribute();
  attribute.facility_id = params.facility_id;
  attribute.attribute_type = params.attribute_type;
  attribute.attribute_value = params.attribute_value;

  return await getRepository(FacilityAttribute).save(attribute);
};

const getByFacilityId = async (facilityId: number) => {
  return await getRepository(FacilityAttribute).find({
    where: { facility_id: facilityId, isDeleted: false }
  });
};

const update = async (params: IUpdateFacilityAttribute) => {
  const attribute = await getRepository(FacilityAttribute).findOne({
    where: { attribute_id: params.id, isDeleted: false }
  });

  if (!attribute) {
    throw new StringError('Facility attribute does not exist');
  }

  await getRepository(FacilityAttribute).update(
    { attribute_id: params.id },
    {
      attribute_type: params.attribute_type,
      attribute_value: params.attribute_value,
      updatedAt: new Date()
    }
  );

  return await getRepository(FacilityAttribute).findOne({ where: { attribute_id: params.id } });
};

const remove = async (id: number) => {
  await getRepository(FacilityAttribute).update(
    { attribute_id: id },
    { isDeleted: true, updatedAt: new Date() }
  );
};

export interface ICreateFacilityAttribute {
  facility_id: number;
  attribute_type: AttributeType;
  attribute_value: string;
}

export interface IUpdateFacilityAttribute {
  id: number;
  attribute_type?: AttributeType;
  attribute_value?: string;
}

export default {
  create,
  getByFacilityId,
  update,
  remove
};
