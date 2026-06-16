import { getRepository } from 'typeorm';
import { CareerJob } from '../../entities/career-job/career-job.entity';
import { CareerJobStudentMapping } from '../../entities/career-job/career-job-student-mapping.entity';
import { CareerJobInterest } from '../../entities/career-job/career-job-interest.entity';
import { Student } from '../../entities/student/student.entity';
import { StringError } from '../../errors/string.error';
import CareerJobRepository, { ICareerJobQueryParams } from '../../repositories/career-job.repository';

const create = async (params: any, createdByUserId: number) => {
  const job = new CareerJob();
  job.designation = params.designation;
  job.company = params.company;
  job.location = params.location;
  job.salary = params.salary || null;
  job.job_type = params.job_type || null;
  job.experience_required = params.experience_required || null;
  job.description = params.description || null;
  job.requirements = params.requirements || null;
  job.application_deadline = params.application_deadline ? new Date(params.application_deadline) : null;
  job.is_active = true;
  job.created_by = createdByUserId;
  return CareerJobRepository.save(job);
};

const update = async (jobId: number, params: any) => {
  const job = await CareerJobRepository.findById(jobId);
  if (!job) throw new StringError('Career job not found');

  if (params.designation !== undefined) job.designation = params.designation;
  if (params.company !== undefined) job.company = params.company;
  if (params.location !== undefined) job.location = params.location;
  if (params.salary !== undefined) job.salary = params.salary;
  if (params.job_type !== undefined) job.job_type = params.job_type;
  if (params.experience_required !== undefined) job.experience_required = params.experience_required;
  if (params.description !== undefined) job.description = params.description;
  if (params.requirements !== undefined) job.requirements = params.requirements;
  if (params.application_deadline !== undefined) {
    job.application_deadline = params.application_deadline ? new Date(params.application_deadline) : null;
  }
  if (params.is_active !== undefined) job.is_active = params.is_active;

  return CareerJobRepository.save(job);
};

const list = async (params: ICareerJobQueryParams) => {
  return CareerJobRepository.findAll(params);
};

const getById = async (jobId: number) => {
  const job = await CareerJobRepository.findById(jobId);
  if (!job) throw new StringError('Career job not found');
  return job;
};

const assignStudents = async (jobId: number, studentIds: number[], assignedByUserId: number) => {
  const job = await CareerJobRepository.findById(jobId);
  if (!job) throw new StringError('Career job not found');
  if (!job.is_active) throw new StringError('Cannot assign students to an inactive job');

  const studentRepo = getRepository(Student);
  const results: { studentId: number; status: 'assigned' | 'already_assigned' }[] = [];

  for (const studentId of studentIds) {
    const student = await studentRepo.findOne({ where: { student_id: studentId } });
    if (!student) continue;

    const existing = await CareerJobRepository.findMappingByJobAndStudent(jobId, studentId);
    if (existing) {
      results.push({ studentId, status: 'already_assigned' });
      continue;
    }

    const mapping = new CareerJobStudentMapping();
    mapping.job_id = jobId;
    mapping.student_id = studentId;
    mapping.assigned_by = assignedByUserId;
    mapping.assigned_date = new Date();
    mapping.status = 'active';
    await CareerJobRepository.saveMapping(mapping);
    results.push({ studentId, status: 'assigned' });
  }

  return results;
};

const submitInterest = async (jobId: number, studentId: number) => {
  const job = await CareerJobRepository.findById(jobId);
  if (!job) throw new StringError('Career job not found');
  if (!job.is_active) throw new StringError('This job is no longer active');

  const mapping = await CareerJobRepository.findMappingByJobAndStudent(jobId, studentId);
  if (!mapping) throw new StringError('You are not assigned to this job');

  const existing = await CareerJobRepository.findInterest(jobId, studentId);
  if (existing) throw new StringError('You have already submitted interest for this job');

  const interest = new CareerJobInterest();
  interest.job_id = jobId;
  interest.student_id = studentId;
  interest.interest_date = new Date();
  await CareerJobRepository.saveInterest(interest);

  return { success: true, message: 'Interest submitted successfully.' };
};

const getInterestedStudents = async (jobId: number) => {
  const job = await CareerJobRepository.findById(jobId);
  if (!job) throw new StringError('Career job not found');
  return CareerJobRepository.findInterestedStudents(jobId);
};

const getStudentAssignedJobs = async (studentId: number) => {
  const jobs = await CareerJobRepository.findAssignedJobsByStudent(studentId);

  const interests = await Promise.all(
    jobs.map(job => CareerJobRepository.findInterest(job.job_id, studentId))
  );

  return jobs.map((job, i) => ({
    ...job,
    isInterested: !!interests[i]
  }));
};

const toggleActive = async (jobId: number, isActive: boolean) => {
  const job = await CareerJobRepository.findById(jobId);
  if (!job) throw new StringError('Career job not found');
  job.is_active = isActive;
  return CareerJobRepository.save(job);
};

export default {
  create,
  update,
  list,
  getById,
  assignStudents,
  submitInterest,
  getInterestedStudents,
  getStudentAssignedJobs,
  toggleActive
};
