import { getManager } from 'typeorm';

export default class DashboardService {
  static async getAdminStats() {
    const manager = getManager();

    const [
      [studentsRow],
      [facilitiesRow],
      [trainersRow],
      [placementSlotsRow],
      [workshopSlotsRow],
      [bookedRow],
      [amountRow],
      [activeInternsRow],
    ] = await Promise.all([
      manager.query(`SELECT COUNT(*) AS cnt FROM students WHERE isDeleted = 0`),
      manager.query(`SELECT COUNT(*) AS cnt FROM facility WHERE isDeleted = 0`),
      manager.query(`SELECT COUNT(*) AS cnt FROM Trainer WHERE isDeleted = 0`),
      manager.query(`
        SELECT COALESCE(SUM(remaining_seats), 0) AS cnt
        FROM placement_slots WHERE is_deleted = 0 AND remaining_seats > 0
      `),
      manager.query(`
        SELECT COALESCE(SUM(seats_remaining), 0) AS cnt
        FROM CourseSlots WHERE isDeleted = 0 AND seats_remaining > 0
      `),
      manager.query(`
        SELECT COUNT(*) AS cnt FROM placement_assignments
        WHERE facility_confirmation_status = 'Approved'
      `),
      manager.query(`
        SELECT COALESCE(SUM(CAST(ps.placement_fee AS DECIMAL(15,2))), 0) AS total
        FROM placement_slots ps
        INNER JOIN placement_assignments pa ON pa.placementslot_id = ps.placementslot_id
        WHERE pa.facility_confirmation_status = 'Approved'
          AND ps.placement_fee_status = 1
          AND ps.is_deleted = 0
          AND (ps.placement_fee IS NOT NULL AND ps.placement_fee != '' AND ps.placement_fee != '0')
      `),
      manager.query(`
        SELECT COUNT(*) AS cnt FROM placement_assignments
        WHERE status IN ('Active', 'Started')
      `),
    ]);

    return {
      totalStudents: Number(studentsRow.cnt),
      facilityCount: Number(facilitiesRow.cnt),
      trainerCount: Number(trainersRow.cnt),
      slotsAvailable: Number(placementSlotsRow.cnt),
      trainingSlots: Number(workshopSlotsRow.cnt),
      slotsBooked: Number(bookedRow.cnt),
      internshipAmountPaid: Number(amountRow.total),
      activeInterns: Number(activeInternsRow.cnt),
    };
  }

  static async getStudentStats(studentId: number) {
    const manager = getManager();

    const [
      [assignedRow],
      [bookedRow],
      workshopCerts,
      placementCerts,
    ] = await Promise.all([
      // Facilities assigned to this student
      manager.query(
        `SELECT COUNT(*) AS cnt FROM student_facility_assignments WHERE student_id = ?`,
        [studentId]
      ),
      // Placement bookings confirmed (Approved) for this student
      manager.query(
        `SELECT COUNT(*) AS cnt FROM placement_assignments
         WHERE student_id = ? AND facility_confirmation_status = 'Approved'`,
        [studentId]
      ),
      // Workshop certificates (course type)
      manager.query(
        `SELECT certificate_id, certificate_file_path, created_at
         FROM certificates
         WHERE student_id = ? AND assignment_type = 'course' AND is_deleted = 0
         ORDER BY created_at DESC`,
        [studentId]
      ),
      // Placement / internship certificates
      manager.query(
        `SELECT certificate_id, certificate_file_path, created_at
         FROM certificates
         WHERE student_id = ? AND assignment_type = 'placement' AND is_deleted = 0
         ORDER BY created_at DESC`,
        [studentId]
      ),
    ]);

    return {
      totalFacilitiesAssigned: Number(assignedRow.cnt),
      placementBooked: Number(bookedRow.cnt),
      downloads: {
        workshopCertificates: workshopCerts,
        placementCertificates: placementCerts,
      },
    };
  }

  static async getFacilityStats(facilityId: number) {
    const manager = getManager();

    const [[slotsRow], [internsRow]] = await Promise.all([
      // Total remaining placement seats for this facility (facility_id stored as varchar)
      manager.query(
        `SELECT COALESCE(SUM(remaining_seats), 0) AS cnt
         FROM placement_slots
         WHERE facility_id = ? AND is_deleted = 0`,
        [String(facilityId)]
      ),
      // Active interns at this facility
      manager.query(
        `SELECT COUNT(*) AS cnt
         FROM placement_assignments pa
         INNER JOIN placement_slots ps ON pa.placementslot_id = ps.placementslot_id
         WHERE ps.facility_id = ? AND pa.status IN ('Active', 'Started')`,
        [String(facilityId)]
      ),
    ]);

    return {
      slotsAvailable: Number(slotsRow.cnt),
      activeInterns: Number(internsRow.cnt),
    };
  }

  static async getTrainerStats(trainerId: number) {
    const manager = getManager();

    const [[slotsRow], [completedRow]] = await Promise.all([
      // Course slots available for this trainer (future/today only)
      manager.query(
        `SELECT COALESCE(SUM(seats_remaining), 0) AS cnt
         FROM CourseSlots
         WHERE trainer_id = ? AND isDeleted = 0 AND seats_remaining > 0
           AND course_date >= CURDATE()`,
        [trainerId]
      ),
      // Students who completed any course under this trainer
      manager.query(
        `SELECT COUNT(DISTINCT student_id) AS cnt
         FROM CourseAssignments
         WHERE trainer_id = ? AND status = 'Completed' AND isDeleted = 0`,
        [trainerId]
      ),
    ]);

    return {
      courseSlotsAvailable: Number(slotsRow.cnt),
      studentsCompleted: Number(completedRow.cnt),
    };
  }

  // Supervisors share the same stats as their facility
  static async getSupervisorStats(facilityId: number) {
    return this.getFacilityStats(facilityId);
  }
}
