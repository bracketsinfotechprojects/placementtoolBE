import { getRepository, getConnection } from 'typeorm';
import { CareerJob } from '../entities/career-job/career-job.entity';
import { CareerJobStudentMapping } from '../entities/career-job/career-job-student-mapping.entity';
import { CareerJobInterest } from '../entities/career-job/career-job-interest.entity';

export interface ICareerJobQueryParams {
  is_active?: boolean;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}

const findAll = async (params: ICareerJobQueryParams) => {
  const repo = getRepository(CareerJob);
  const limit = params.limit || 20;
  const page = params.page || 1;
  const offset = (page - 1) * limit;
  const sortBy = params.sort_by || 'job_id';
  const sortOrder = (params.sort_order || 'DESC').toUpperCase() as 'ASC' | 'DESC';

  const qb = repo.createQueryBuilder('job');

  if (params.is_active !== undefined) {
    qb.andWhere('job.is_active = :is_active', { is_active: params.is_active });
  }

  qb.orderBy(`job.${sortBy}`, sortOrder)
    .skip(offset)
    .take(limit);

  const [jobs, total] = await qb.getManyAndCount();
  return { jobs, total };
};

const findById = async (jobId: number) => {
  return getRepository(CareerJob).findOne({ where: { job_id: jobId } });
};

const save = async (job: CareerJob) => {
  return getRepository(CareerJob).save(job);
};

const findAssignedStudentIds = async (jobId: number): Promise<number[]> => {
  const mappings = await getRepository(CareerJobStudentMapping).find({
    where: { job_id: jobId, status: 'active' },
    select: ['student_id']
  });
  return mappings.map(m => m.student_id);
};

const saveMapping = async (mapping: CareerJobStudentMapping) => {
  return getRepository(CareerJobStudentMapping).save(mapping);
};

const findMappingByJobAndStudent = async (jobId: number, studentId: number) => {
  return getRepository(CareerJobStudentMapping).findOne({
    where: { job_id: jobId, student_id: studentId }
  });
};

const findAssignedJobsByStudent = async (studentId: number) => {
  const mappings = await getRepository(CareerJobStudentMapping).find({
    where: { student_id: studentId, status: 'active' }
  });
  if (!mappings.length) return [];
  const jobIds = mappings.map(m => m.job_id);
  return getRepository(CareerJob)
    .createQueryBuilder('job')
    .where('job.job_id IN (:...jobIds)', { jobIds })
    .orderBy('job.job_id', 'DESC')
    .getMany();
};

const findInterest = async (jobId: number, studentId: number) => {
  return getRepository(CareerJobInterest).findOne({
    where: { job_id: jobId, student_id: studentId }
  });
};

const saveInterest = async (interest: CareerJobInterest) => {
  return getRepository(CareerJobInterest).save(interest);
};

const findInterestedStudents = async (jobId: number) => {
  const connection = getConnection();
  return connection.query(`
    SELECT
      s.student_id AS studentId,
      CONCAT(s.first_name, ' ', s.last_name) AS studentName,
      cd.email AS email,
      cd.primary_mobile AS mobile,
      cji.interest_date AS interestDate
    FROM career_job_interest cji
    INNER JOIN students s ON s.student_id = cji.student_id
    LEFT JOIN contact_details cd ON cd.student_id = s.student_id AND cd.is_primary = 1
    WHERE cji.job_id = ?
    ORDER BY cji.interest_date DESC
  `, [jobId]);
};

export default {
  findAll,
  findById,
  save,
  findAssignedStudentIds,
  saveMapping,
  findMappingByJobAndStudent,
  findAssignedJobsByStudent,
  findInterest,
  saveInterest,
  findInterestedStudents
};
