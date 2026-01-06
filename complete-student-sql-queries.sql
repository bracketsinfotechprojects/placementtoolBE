-- =====================================================
-- COMPLETE STUDENT DATA SQL QUERIES
-- =====================================================

-- 1. GET ALL STUDENTS WITH BASIC INFO
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.full_name,
    s.dob,
    s.gender,
    s.nationality,
    s.student_type,
    s.status,
    s.createdAt,
    s.updatedAt
FROM students s 
WHERE s.isDeleted = 0
ORDER BY s.student_id DESC;

-- 2. GET STUDENTS WITH CONTACT DETAILS
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.dob,
    s.gender,
    s.nationality,
    s.student_type,
    s.status,
    cd.primary_mobile,
    cd.email,
    cd.emergency_contact,
    cd.contact_type,
    cd.is_primary
FROM students s
LEFT JOIN contact_details cd ON s.student_id = cd.student_id
WHERE s.isDeleted = 0
ORDER BY s.student_id DESC;

-- 3. GET STUDENTS WITH VISA DETAILS
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.dob,
    s.gender,
    s.nationality,
    s.student_type,
    s.status,
    vd.visa_type,
    vd.visa_number,
    vd.start_date,
    vd.expiry_date,
    vd.status as visa_status,
    vd.issuing_country
FROM students s
LEFT JOIN visa_details vd ON s.student_id = vd.student_id
WHERE s.isDeleted = 0
ORDER BY s.student_id DESC;

-- 4. GET STUDENTS WITH ADDRESSES
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.dob,
    s.gender,
    s.nationality,
    s.student_type,
    s.status,
    a.line1,
    a.city,
    a.state,
    a.country,
    a.postal_code,
    a.address_type,
    a.is_primary
FROM students s
LEFT JOIN addresses a ON s.student_id = a.student_id
WHERE s.isDeleted = 0
ORDER BY s.student_id DESC;

-- 5. GET STUDENTS WITH ELIGIBILITY STATUS
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.dob,
    s.gender,
    s.nationality,
    s.student_type,
    s.status,
    es.classes_completed,
    es.fees_paid,
    es.assignments_submitted,
    es.documents_submitted,
    es.trainer_consent,
    es.override_requested,
    es.requested_by,
    es.reason,
    es.comments
FROM students s
LEFT JOIN eligibility_status es ON s.student_id = es.student_id
WHERE s.isDeleted = 0
ORDER BY s.student_id DESC;

-- 6. GET STUDENTS WITH LIFESTYLE DATA
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.dob,
    s.gender,
    s.nationality,
    s.student_type,
    s.status,
    sl.currently_working,
    sl.working_hours,
    sl.has_dependents,
    sl.married,
    sl.driving_license,
    sl.own_vehicle,
    sl.public_transport_only,
    sl.can_travel_long_distance,
    sl.drop_support_available,
    sl.fully_flexible,
    sl.rush_placement_required,
    sl.preferred_days,
    sl.preferred_time_slots
FROM students s
LEFT JOIN student_lifestyle sl ON s.student_id = sl.student_id
WHERE s.isDeleted = 0
ORDER BY s.student_id DESC;

-- 7. GET STUDENTS WITH PLACEMENT PREFERENCES
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.dob,
    s.gender,
    s.nationality,
    s.student_type,
    s.status,
    pp.preferred_states,
    pp.preferred_cities,
    pp.max_travel_distance_km,
    pp.morning_only,
    pp.evening_only,
    pp.night_shift,
    pp.weekend_only,
    pp.part_time,
    pp.full_time,
    pp.with_friend,
    pp.friend_name_or_id,
    pp.with_spouse,
    pp.spouse_name_or_id,
    pp.earliest_start_date,
    pp.latest_start_date,
    pp.specific_month_preference
FROM students s
LEFT JOIN placement_preferences pp ON s.student_id = pp.student_id
WHERE s.isDeleted = 0
ORDER BY s.student_id DESC;

-- 8. GET STUDENTS WITH FACILITY RECORDS
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.dob,
    s.gender,
    s.nationality,
    s.student_type,
    s.status,
    fr.facility_name,
    fr.facility_type,
    fr.branch_site,
    fr.facility_address,
    fr.contact_person_name,
    fr.contact_email,
    fr.contact_phone,
    fr.supervisor_name,
    fr.distance_from_student_km,
    fr.slot_id,
    fr.course_type,
    fr.shift_timing,
    fr.start_date,
    fr.duration_hours,
    fr.gender_requirement,
    fr.applied_on,
    fr.student_confirmed,
    fr.student_comments,
    fr.document_type,
    fr.file_path
FROM students s
LEFT JOIN facility_records fr ON s.student_id = fr.student_id
WHERE s.isDeleted = 0
ORDER BY s.student_id DESC;

-- 9. GET STUDENTS WITH ADDRESS CHANGE REQUESTS
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.dob,
    s.gender,
    s.nationality,
    s.student_type,
    s.status,
    acr.current_address,
    acr.new_address,
    acr.effective_date,
    acr.change_reason,
    acr.impact_acknowledged
FROM students s
LEFT JOIN address_change_requests acr ON s.student_id = acr.student_id
WHERE s.isDeleted = 0
ORDER BY s.student_id DESC;

-- 10. GET STUDENTS WITH JOB STATUS UPDATES
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.dob,
    s.gender,
    s.nationality,
    s.student_type,
    s.status,
    jsu.status as job_status,
    jsu.last_updated_on,
    jsu.employer_name,
    jsu.job_role,
    jsu.start_date as job_start_date,
    jsu.employment_type,
    jsu.offer_letter_path,
    jsu.actively_applying,
    jsu.expected_timeline,
    jsu.searching_comments
FROM students s
LEFT JOIN job_status_updates jsu ON s.student_id = jsu.student_id
WHERE s.isDeleted = 0
ORDER BY s.student_id DESC;

-- =====================================================
-- COMPREHENSIVE QUERY - ALL STUDENT DATA AT ONCE
-- =====================================================

-- COMPLETE STUDENT RECORD WITH ALL RELATED DATA
SELECT 
    -- Student Basic Info
    s.student_id,
    s.first_name,
    s.last_name,
    s.dob,
    s.gender,
    s.nationality,
    s.student_type,
    s.status,
    s.createdAt,
    s.updatedAt,
    
    -- Contact Details
    cd.primary_mobile,
    cd.email,
    cd.emergency_contact,
    cd.contact_type,
    cd.is_primary as contact_is_primary,
    
    -- Visa Details
    vd.visa_type,
    vd.visa_number,
    vd.start_date as visa_start_date,
    vd.expiry_date as visa_expiry_date,
    vd.status as visa_status,
    vd.issuing_country,
    
    -- Address (Primary)
    a.line1,
    a.city,
    a.state,
    a.country,
    a.postal_code,
    a.address_type,
    a.is_primary as address_is_primary,
    
    -- Eligibility Status
    es.classes_completed,
    es.fees_paid,
    es.assignments_submitted,
    es.documents_submitted,
    es.trainer_consent,
    es.override_requested,
    es.requested_by,
    es.reason,
    es.comments as eligibility_comments,
    
    -- Student Lifestyle
    sl.currently_working,
    sl.working_hours,
    sl.has_dependents,
    sl.married,
    sl.driving_license,
    sl.own_vehicle,
    sl.public_transport_only,
    sl.can_travel_long_distance,
    sl.drop_support_available,
    sl.fully_flexible,
    sl.rush_placement_required,
    sl.preferred_days,
    sl.preferred_time_slots,
    
    -- Placement Preferences
    pp.preferred_states,
    pp.preferred_cities,
    pp.max_travel_distance_km,
    pp.morning_only,
    pp.evening_only,
    pp.night_shift,
    pp.weekend_only,
    pp.part_time,
    pp.full_time,
    pp.with_friend,
    pp.friend_name_or_id,
    pp.with_spouse,
    pp.spouse_name_or_id,
    pp.earliest_start_date,
    pp.latest_start_date,
    pp.specific_month_preference,
    
    -- Facility Records (Latest)
    fr.facility_name,
    fr.facility_type,
    fr.branch_site,
    fr.facility_address,
    fr.contact_person_name,
    fr.contact_email,
    fr.contact_phone,
    fr.supervisor_name,
    fr.distance_from_student_km,
    fr.slot_id,
    fr.course_type,
    fr.shift_timing,
    fr.start_date as facility_start_date,
    fr.duration_hours,
    fr.gender_requirement,
    fr.applied_on,
    fr.student_confirmed,
    fr.student_comments,
    fr.document_type,
    fr.file_path,
    
    -- Address Change Requests (Latest)
    acr.current_address,
    acr.new_address,
    acr.effective_date,
    acr.change_reason,
    acr.impact_acknowledged,
    
    -- Job Status Updates (Latest)
    jsu.status as job_status,
    jsu.last_updated_on,
    jsu.employer_name,
    jsu.job_role,
    jsu.start_date as job_start_date,
    jsu.employment_type,
    jsu.offer_letter_path,
    jsu.actively_applying,
    jsu.expected_timeline,
    jsu.searching_comments
    
FROM students s
LEFT JOIN contact_details cd ON s.student_id = cd.student_id
LEFT JOIN visa_details vd ON s.student_id = vd.student_id
LEFT JOIN addresses a ON s.student_id = a.student_id AND a.is_primary = 1
LEFT JOIN eligibility_status es ON s.student_id = es.student_id
LEFT JOIN student_lifestyle sl ON s.student_id = sl.student_id
LEFT JOIN placement_preferences pp ON s.student_id = pp.student_id
LEFT JOIN facility_records fr ON s.student_id = fr.student_id
LEFT JOIN address_change_requests acr ON s.student_id = acr.student_id
LEFT JOIN job_status_updates jsu ON s.student_id = jsu.student_id
WHERE s.isDeleted = 0
ORDER BY s.student_id DESC;

-- =====================================================
-- SUMMARY QUERIES
-- =====================================================

-- STUDENT STATISTICS
SELECT 
    COUNT(*) as total_students,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_students,
    SUM(CASE WHEN status = 'graduated' THEN 1 ELSE 0 END) as graduated_students,
    SUM(CASE WHEN student_type = 'international' THEN 1 ELSE 0 END) as international_students,
    SUM(CASE WHEN student_type = 'domestic' THEN 1 ELSE 0 END) as domestic_students
FROM students 
WHERE isDeleted = 0;

-- STUDENTS WITH COMPLETE INFORMATION
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.email,
    CASE 
        WHEN cd.contact_id IS NOT NULL AND vd.visa_id IS NOT NULL AND 
             a.address_id IS NOT NULL AND es.status_id IS NOT NULL AND
             sl.lifestyle_id IS NOT NULL AND pp.preference_id IS NOT NULL
        THEN 'Complete'
        ELSE 'Incomplete'
    END as data_completeness
FROM students s
LEFT JOIN contact_details cd ON s.student_id = cd.student_id
LEFT JOIN visa_details vd ON s.student_id = vd.student_id
LEFT JOIN addresses a ON s.student_id = a.student_id
LEFT JOIN eligibility_status es ON s.student_id = es.student_id
LEFT JOIN student_lifestyle sl ON s.student_id = sl.student_id
LEFT JOIN placement_preferences pp ON s.student_id = pp.student_id
WHERE s.isDeleted = 0;