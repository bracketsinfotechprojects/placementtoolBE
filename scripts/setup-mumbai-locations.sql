-- ============================================
-- QUICK SETUP: Mumbai Locations for Students and Facilities
-- ============================================
-- This script updates ALL students and facilities with Mumbai locations
-- Execute this file to quickly set up location data for testing

-- ============================================
-- STEP 1: Update Facilities with Mumbai Locations
-- ============================================

UPDATE facility 
SET location = POINT(
    72.75 + (RAND() * 0.20),  -- Random longitude between 72.75 and 72.95
    18.90 + (RAND() * 0.40)   -- Random latitude between 18.90 and 19.30
)
WHERE isDeleted = 0;

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' facilities with Mumbai locations') as status;

-- ============================================
-- STEP 2: Update Students with Mumbai Locations
-- ============================================

UPDATE students 
SET location = POINT(
    72.75 + (RAND() * 0.20),  -- Random longitude between 72.75 and 72.95
    18.90 + (RAND() * 0.40)   -- Random latitude between 18.90 and 19.30
)
WHERE isDeleted = 0;

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' students with Mumbai locations') as status;

-- ============================================
-- STEP 3: Verification
-- ============================================

-- Count updated entities
SELECT 
    'Facilities' as entity_type,
    COUNT(*) as total,
    SUM(CASE 
        WHEN ST_X(location) BETWEEN 72.75 AND 72.95 
         AND ST_Y(location) BETWEEN 18.90 AND 19.30 
        THEN 1 ELSE 0 
    END) as in_mumbai,
    SUM(CASE 
        WHEN ST_X(location) = 0 AND ST_Y(location) = 0 
        THEN 1 ELSE 0 
    END) as not_set
FROM facility
WHERE isDeleted = 0
UNION ALL
SELECT 
    'Students' as entity_type,
    COUNT(*) as total,
    SUM(CASE 
        WHEN ST_X(location) BETWEEN 72.75 AND 72.95 
         AND ST_Y(location) BETWEEN 18.90 AND 19.30 
        THEN 1 ELSE 0 
    END) as in_mumbai,
    SUM(CASE 
        WHEN ST_X(location) = 0 AND ST_Y(location) = 0 
        THEN 1 ELSE 0 
    END) as not_set
FROM students
WHERE isDeleted = 0;

-- Show sample facilities
SELECT 
    facility_id,
    organization_name,
    ROUND(ST_Y(location), 4) as latitude,
    ROUND(ST_X(location), 4) as longitude
FROM facility
WHERE isDeleted = 0
LIMIT 10;

-- Show sample students
SELECT 
    student_id,
    CONCAT(first_name, ' ', last_name) as name,
    ROUND(ST_Y(location), 4) as latitude,
    ROUND(ST_X(location), 4) as longitude
FROM students
WHERE isDeleted = 0
LIMIT 10;

-- ============================================
-- STEP 4: Test Location Query
-- ============================================

-- Test: Find facilities near Mumbai Central (19.0176, 72.8479)
SELECT 
    '🔍 Testing: Facilities within 5km of Mumbai Central' as test_query;

SELECT 
    facility_id,
    organization_name,
    ROUND(ST_Y(location), 4) as latitude,
    ROUND(ST_X(location), 4) as longitude,
    ROUND(ST_Distance_Sphere(
        location, 
        POINT(72.8479, 19.0176)
    ) / 1000, 2) as distance_km
FROM facility
WHERE isDeleted = 0
  AND ST_Distance_Sphere(location, POINT(72.8479, 19.0176)) <= 5000
ORDER BY distance_km
LIMIT 5;

-- Test: Find students near Bandra (19.0596, 72.8295)
SELECT 
    '🔍 Testing: Students within 5km of Bandra' as test_query;

SELECT 
    student_id,
    CONCAT(first_name, ' ', last_name) as name,
    ROUND(ST_Y(location), 4) as latitude,
    ROUND(ST_X(location), 4) as longitude,
    ROUND(ST_Distance_Sphere(
        location, 
        POINT(72.8295, 19.0596)
    ) / 1000, 2) as distance_km
FROM students
WHERE isDeleted = 0
  AND ST_Distance_Sphere(location, POINT(72.8295, 19.0596)) <= 5000
ORDER BY distance_km
LIMIT 5;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT '✅ Mumbai locations setup complete!' as status;
SELECT '📍 All students and facilities now have Mumbai coordinates' as info;
SELECT '🧪 Test the location APIs with these coordinates:' as next_step;
SELECT '   - Gateway of India: 18.9220, 72.8347' as test_location_1;
SELECT '   - Bandra: 19.0596, 72.8295' as test_location_2;
SELECT '   - Andheri: 19.1136, 72.8697' as test_location_3;
SELECT '   - Powai: 19.1176, 72.9060' as test_location_4;

-- ============================================
-- USAGE
-- ============================================

/*
Execute this script:
mysql -u root -p testcrm < scripts/setup-mumbai-locations.sql

Or in MySQL Workbench/CLI:
source scripts/setup-mumbai-locations.sql;

Then test the APIs:
GET /api/location/facilities/nearby?latitude=19.0596&longitude=72.8295&radius_km=5
GET /api/location/students/nearby?latitude=19.0596&longitude=72.8295&radius_km=5
*/
