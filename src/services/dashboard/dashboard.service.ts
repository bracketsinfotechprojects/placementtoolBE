import { getManager } from 'typeorm';
import PlacementPaymentRepository from '../../repositories/placement-payment.repository';

// Fetches every placement slot's payment summary unpaginated, for dashboard aggregation.
// Sources the same computation used by the Placement Payments module so dashboard totals
// and the dedicated payments screen can never drift apart.
const fetchAllPaymentSummaries = async (facilityId?: number) => {
  const { rows } = await PlacementPaymentRepository.list({
    facility_id: facilityId,
    limit: Number.MAX_SAFE_INTEGER,
    page: 1,
  });
  return rows;
};

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
        FROM placement_slots
        WHERE is_deleted = 0 AND remaining_seats > 0
          AND (placement_end_date IS NULL OR placement_end_date >= CURDATE())
      `),
      manager.query(`
        SELECT COALESCE(SUM(seats_remaining), 0) AS cnt
        FROM CourseSlots
        WHERE isDeleted = 0 AND seats_remaining > 0
          AND course_date >= CURDATE()
      `),
      manager.query(`
        SELECT COUNT(*) AS cnt FROM placement_assignments
        WHERE facility_confirmation_status = 'Approved'
      `),
      // Sum of actually-recorded payments from the placement payment ledger
      // (was previously derived from the placement_fee_status flag, which cannot
      // represent partial payments and used the wrong "active/started" filter).
      manager.query(`
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM placement_payment_transactions
        WHERE status = 'Recorded'
      `),
      manager.query(`
        SELECT COUNT(*) AS cnt FROM placement_assignments
        WHERE facility_confirmation_status = 'Approved'
          AND status NOT IN ('Cancelled', 'Dropped')
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

    const [[slotsRow], [internsRow], paymentSummaries] = await Promise.all([
      // Total remaining placement seats for this facility (facility_id stored as varchar)
      manager.query(
        `SELECT COALESCE(SUM(remaining_seats), 0) AS cnt
         FROM placement_slots
         WHERE facility_id = ? AND is_deleted = 0
           AND (placement_end_date IS NULL OR placement_end_date >= CURDATE())`,
        [String(facilityId)]
      ),
      // Active interns at this facility (facility has approved the placement, and it hasn't been cancelled/dropped)
      manager.query(
        `SELECT COUNT(DISTINCT pa.student_id) AS cnt
         FROM placement_assignments pa
         INNER JOIN placement_slots ps ON pa.placementslot_id = ps.placementslot_id
         WHERE ps.facility_id = ? AND pa.facility_confirmation_status = 'Approved'
           AND pa.status NOT IN ('Cancelled', 'Dropped')`,
        [String(facilityId)]
      ),
      // Payment summary: per-slot (accepted students × that slot's own placement_fee),
      // reduced across this facility's slots, backed by the payment ledger — see
      // PlacementPaymentRepository (shared with the Placement Payments module).
      fetchAllPaymentSummaries(facilityId),
    ]);

    const totalDue = paymentSummaries.reduce((sum, r) => sum + r.total_payable, 0);
    const receivedPayment = paymentSummaries.reduce((sum, r) => sum + r.total_paid, 0);
    const pendingPayment = Math.max(0, totalDue - receivedPayment);
    const acceptedStudents = paymentSummaries.reduce((sum, r) => sum + r.accepted_students, 0);
    const amountPerSpot = acceptedStudents > 0 ? totalDue / acceptedStudents : 0;

    return {
      slotsAvailable: Number(slotsRow.cnt),
      activeInterns: Number(internsRow.cnt),
      amountPerSpot,
      receivedPayment,
      pendingPayment,
      totalDue,
    };
  }

  static async getFacilityPaymentSummary() {
    const paymentSummaries = await fetchAllPaymentSummaries();

    const byFacility = new Map<number, {
      facility_id: number;
      facility_name: string;
      active_students: number;
      total_due: number;
      paid_amount: number;
    }>();

    for (const row of paymentSummaries) {
      // Preserve prior behavior: only surface facilities with at least one accepted student
      if (row.accepted_students <= 0) continue;

      const existing = byFacility.get(row.facility_id) || {
        facility_id: row.facility_id,
        facility_name: row.facility_name,
        active_students: 0,
        total_due: 0,
        paid_amount: 0,
      };
      existing.active_students += row.accepted_students;
      existing.total_due += row.total_payable;
      existing.paid_amount += row.total_paid;
      byFacility.set(row.facility_id, existing);
    }

    return Array.from(byFacility.values())
      .map((f) => ({
        facility_id: f.facility_id,
        facility_name: f.facility_name,
        active_students: f.active_students,
        // Weighted average — a facility can have multiple slots with different fees
        amount_per_spot: f.active_students > 0 ? f.total_due / f.active_students : 0,
        total_due: f.total_due,
        paid_amount: f.paid_amount,
        remaining_amount: Math.max(0, f.total_due - f.paid_amount),
      }))
      .sort((a, b) => b.active_students - a.active_students);
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
