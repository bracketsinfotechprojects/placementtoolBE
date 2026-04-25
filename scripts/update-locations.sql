-- ============================================
-- Location Update SQL Script
-- Update latitude/longitude for facilities and students
-- ============================================

-- NOTE: MySQL POINT format is POINT(longitude, latitude)
-- Common mistake: Don't swap longitude and latitude!

-- ============================================
-- SAMPLE DATA - Sydney Area Coordinates
-- ============================================

-- Update Facility Locations (Sydney area)
UPDATE facility 
SET location = POINT(151.2093, -33.8688) 
WHERE facility_id = 1;  -- Sydney CBD

UPDATE facility 
SET location = POINT(151.2743, -33.8908) 
WHERE facility_id = 2;  -- Bondi Beach

UPDATE facility 
SET location = POINT(151.2094, -33.8650) 
WHERE facility_id = 3;  -- Circular Quay

UPDATE facility 
SET location = POINT(151.1852, -33.8715) 
WHERE facility_id = 4;  -- Pyrmont

UPDATE facility 
SET location = POINT(151.2774, -33.8915) 
WHERE facility_id = 5;  -- Bondi Junction

-- Update Student Locations (Sydney area)
UPDATE students 
SET location = POINT(151.2100, -33.8700) 
WHERE student_id = 1;  -- Near Sydney CBD

UPDATE students 
SET location = POINT(151.2150, -33.8750) 
WHERE student_id = 2;  -- Near Sydney CBD

UPDATE students 
SET location = POINT(151.2750, -33.8920) 
WHERE student_id = 3;  -- Near Bondi

UPDATE students 
SET location = POINT(151.1900, -33.8720) 
WHERE student_id = 4;  -- Near Pyrmont

UPDATE students 
SET location = POINT(151.2800, -33.8950) 
WHERE student_id = 5;  -- Near Bondi Junction


-- ============================================
-- MELBOURNE AREA COORDINATES (if needed)
-- ============================================

-- UPDATE facility 
-- SET location = POINT(144.9631, -37.8136) 
-- WHERE facility_id = 6;  -- Melbourne CBD

-- UPDATE students 
-- SET location = POINT(144.9774, -37.8679) 
-- WHERE student_id = 6;  -- St Kilda


-- ============================================
-- BULK UPDATE TEMPLATE
-- ============================================

-- Update multiple facilities at once
-- UPDATE facility 
-- SET location = CASE facility_id
--     WHEN 1 THEN POINT(151.2093, -33.8688)
--     WHEN 2 THEN POINT(151.2743, -33.8908)
--     WHEN 3 THEN POINT(151.2094, -33.8650)
--     ELSE location
-- END
-- WHERE facility_id IN (1, 2, 3);

-- Update multiple students at once
-- UPDATE students 
-- SET location = CASE student_id
--     WHEN 1 THEN POINT(151.2100, -33.8700)
--     WHEN 2 THEN POINT(151.2150, -33.8750)
--     WHEN 3 THEN POINT(151.2750, -33.8920)
--     ELSE location
-- END
-- WHERE student_id IN (1, 2, 3);


-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check facilities with location set
SELECT 
    facility_id,
    organization_name,
    ST_X(location) as longitude,
    ST_Y(location) as latitude,
    CASE 
        WHEN ST_X(location) = 0 AND ST_Y(location) = 0 THEN 'Not Set'
        ELSE 'Set'
    END as location_status
FROM facility
WHERE isDeleted = 0
ORDER BY facility_id
LIMIT 20;

-- Check students with location set
SELECT 
    student_id,
    CONCAT(first_name, ' ', last_name) as name,
    ST_X(location) as longitude,
    ST_Y(location) as latitude,
    CASE 
        WHEN ST_X(location) = 0 AND ST_Y(location) = 0 THEN 'Not Set'
        ELSE 'Set'
    END as location_status
FROM students
WHERE isDeleted = 0
ORDER BY student_id
LIMIT 20;

-- Count entities without location
SELECT 
    'Facilities' as entity_type,
    COUNT(*) as without_location
FROM facility
WHERE isDeleted = 0 
  AND (location IS NULL OR (ST_X(location) = 0 AND ST_Y(location) = 0))
UNION ALL
SELECT 
    'Students' as entity_type,
    COUNT(*) as without_location
FROM students
WHERE isDeleted = 0 
  AND (location IS NULL OR (ST_X(location) = 0 AND ST_Y(location) = 0));


-- ============================================
-- RESET LOCATIONS (if needed)
-- ============================================

-- Reset all facility locations to default
-- UPDATE facility SET location = POINT(0, 0);

-- Reset all student locations to default
-- UPDATE students SET location = POINT(0, 0);

-- Reset specific facility
-- UPDATE facility SET location = POINT(0, 0) WHERE facility_id = 1;

-- Reset specific student
-- UPDATE students SET location = POINT(0, 0) WHERE student_id = 1;


-- ============================================
-- COMMON AUSTRALIAN CITY COORDINATES
-- ============================================

/*
Sydney CBD:        -33.8688, 151.2093
Melbourne CBD:     -37.8136, 144.9631
Brisbane CBD:      -27.4698, 153.0251
Perth CBD:         -31.9505, 115.8605
Adelaide CBD:      -34.9285, 138.6007
Canberra:          -35.2809, 149.1300
Gold Coast:        -28.0167, 153.4000
Newcastle:         -32.9283, 151.7817
Wollongong:        -34.4278, 150.8931
Hobart:            -42.8821, 147.3272

Remember: MySQL POINT format is POINT(longitude, latitude)
*/

-- ============================================
-- MUMBAI AREA COORDINATES
-- ============================================

/*
Mumbai Boundaries: Latitude 18.90 to 19.30, Longitude 72.75 to 72.95

Popular Mumbai Locations:
- Gateway of India:    18.9220, 72.8347
- Bandra:              19.0596, 72.8295
- Andheri:             19.1136, 72.8697
- Powai:               19.1176, 72.9060
- Colaba:              18.9067, 72.8147
- Dadar:               19.0176, 72.8479
- Juhu Beach:          19.0990, 72.8265
- Worli:               19.0176, 72.8133
- Lower Parel:         18.9989, 72.8302
- Goregaon:            19.1663, 72.8526
- Malad:               19.1864, 72.8493
- Borivali:            19.2403, 72.8565
- Kurla:               19.0728, 72.8826
- Ghatkopar:           19.0860, 72.9081
- Thane:               19.2183, 72.9781
- Navi Mumbai:         19.0330, 73.0297

Quick Mumbai Setup:
See scripts/setup-mumbai-locations.sql for random Mumbai location updates
*/
