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
      // 1. Total students (not deleted)
      manager.query(`SELECT COUNT(*) AS cnt FROM students WHERE isDeleted = 0`),

      // 2. Total facilities (not deleted)
      manager.query(`SELECT COUNT(*) AS cnt FROM facility WHERE isDeleted = 0`),

      // 3. Total trainers (not deleted)
      manager.query(`SELECT COUNT(*) AS cnt FROM Trainer WHERE isDeleted = 0`),

      // 4. Placement slots available — sum of remaining seats across active (non-deleted) slots
      manager.query(`
        SELECT COALESCE(SUM(remaining_seats), 0) AS cnt
        FROM placement_slots
        WHERE is_deleted = 0
          AND remaining_seats > 0
      `),

      // 5. Workshop (course) slots available — sum of remaining seats across non-deleted course slots
      manager.query(`
        SELECT COALESCE(SUM(seats_remaining), 0) AS cnt
        FROM CourseSlots
        WHERE isDeleted = 0
          AND seats_remaining > 0
      `),

      // 6. Total placement slots booked — assignments with facility_confirmation_status = Approved
      manager.query(`
        SELECT COUNT(*) AS cnt
        FROM placement_assignments
        WHERE facility_confirmation_status = 'Approved'
      `),

      // 7. Internship amount paid — sum of placement_fee on slots that have paid confirmed assignments
      manager.query(`
        SELECT COALESCE(SUM(CAST(ps.placement_fee AS DECIMAL(15,2))), 0) AS total
        FROM placement_slots ps
        INNER JOIN placement_assignments pa ON pa.placementslot_id = ps.placementslot_id
        WHERE pa.facility_confirmation_status = 'Approved'
          AND ps.placement_fee_status = 1
          AND ps.is_deleted = 0
          AND (ps.placement_fee IS NOT NULL AND ps.placement_fee != '' AND ps.placement_fee != '0')
      `),

      // 8. Active interns — assignments currently active or started
      manager.query(`
        SELECT COUNT(*) AS cnt
        FROM placement_assignments
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
}
