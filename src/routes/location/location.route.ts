import { Router } from 'express';
import LocationController from '../../controllers/location/location.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Location
 *     description: Location-based queries for facilities and students
 */

/**
 * @swagger
 * /api/location/facilities/nearby:
 *   get:
 *     summary: Find facilities within radius of coordinates
 *     description: Get all facilities within a specified radius of given latitude/longitude coordinates
 *     tags:
 *       - Location
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude coordinate (-90 to 90)
 *         example: -33.8688
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude coordinate (-180 to 180)
 *         example: 151.2093
 *       - in: query
 *         name: radius_km
 *         schema:
 *           type: number
 *           format: float
 *           default: 10
 *         description: Search radius in kilometers (max 500)
 *         example: 15
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of results
 *         example: 20
 *     responses:
 *       200:
 *         description: Facilities found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Found 5 facilities within 15km"
 *                 data:
 *                   type: object
 *                   properties:
 *                     search_center:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           example: -33.8688
 *                         longitude:
 *                           type: number
 *                           example: 151.2093
 *                     radius_km:
 *                       type: number
 *                       example: 15
 *                     total_found:
 *                       type: integer
 *                       example: 5
 *                     facilities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           facility_id:
 *                             type: integer
 *                             example: 1
 *                           organization_name:
 *                             type: string
 *                             example: "Sunshine Care Home"
 *                           registered_business_name:
 *                             type: string
 *                             example: "Sunshine Care Pty Ltd"
 *                           website_url:
 *                             type: string
 *                             example: "https://sunshinecare.com.au"
 *                           states_covered:
 *                             type: string
 *                             example: '["NSW","VIC"]'
 *                           categories:
 *                             type: string
 *                             example: '["Aged Care"]'
 *                           latitude:
 *                             type: number
 *                             example: -33.8700
 *                           longitude:
 *                             type: number
 *                             example: 151.2100
 *                           distance_km:
 *                             type: number
 *                             example: 1.23
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/facilities/nearby', LocationController.getFacilitiesNearby);

/**
 * @swagger
 * /api/location/students/nearby:
 *   get:
 *     summary: Find students within radius of coordinates
 *     description: Get all students within a specified radius of given latitude/longitude coordinates
 *     tags:
 *       - Location
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude coordinate (-90 to 90)
 *         example: -33.8688
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude coordinate (-180 to 180)
 *         example: 151.2093
 *       - in: query
 *         name: radius_km
 *         schema:
 *           type: number
 *           format: float
 *           default: 10
 *         description: Search radius in kilometers (max 500)
 *         example: 15
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of results
 *         example: 20
 *     responses:
 *       200:
 *         description: Students found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Found 12 students within 15km"
 *                 data:
 *                   type: object
 *                   properties:
 *                     search_center:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           example: -33.8688
 *                         longitude:
 *                           type: number
 *                           example: 151.2093
 *                     radius_km:
 *                       type: number
 *                       example: 15
 *                     total_found:
 *                       type: integer
 *                       example: 12
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           student_id:
 *                             type: integer
 *                             example: 1
 *                           first_name:
 *                             type: string
 *                             example: "John"
 *                           last_name:
 *                             type: string
 *                             example: "Doe"
 *                           email:
 *                             type: string
 *                             example: "john.doe@example.com"
 *                           student_type:
 *                             type: string
 *                             example: "international"
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           latitude:
 *                             type: number
 *                             example: -33.8700
 *                           longitude:
 *                             type: number
 *                             example: 151.2100
 *                           distance_km:
 *                             type: number
 *                             example: 1.45
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/students/nearby', LocationController.getStudentsNearby);

/**
 * @swagger
 * /api/location/facilities/{facilityId}/nearby-students:
 *   get:
 *     summary: Find students near a specific facility
 *     description: Get all students within a specified radius of a facility's location
 *     tags:
 *       - Location
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Facility ID
 *         example: 1
 *       - in: query
 *         name: radius_km
 *         schema:
 *           type: number
 *           format: float
 *           default: 10
 *         description: Search radius in kilometers (max 500)
 *         example: 20
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of results
 *         example: 30
 *     responses:
 *       200:
 *         description: Students found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Found 8 students within 20km of facility"
 *                 data:
 *                   type: object
 *                   properties:
 *                     facility_id:
 *                       type: integer
 *                       example: 1
 *                     facility_name:
 *                       type: string
 *                       example: "Sunshine Care Home"
 *                     radius_km:
 *                       type: number
 *                       example: 20
 *                     total_found:
 *                       type: integer
 *                       example: 8
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           student_id:
 *                             type: integer
 *                             example: 1
 *                           first_name:
 *                             type: string
 *                             example: "Jane"
 *                           last_name:
 *                             type: string
 *                             example: "Smith"
 *                           email:
 *                             type: string
 *                             example: "jane.smith@example.com"
 *                           student_type:
 *                             type: string
 *                             example: "domestic"
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           latitude:
 *                             type: number
 *                             example: -33.8750
 *                           longitude:
 *                             type: number
 *                             example: 151.2150
 *                           distance_km:
 *                             type: number
 *                             example: 5.67
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Facility not found
 */
router.get('/facilities/:facilityId/nearby-students', LocationController.getStudentsNearFacility);

/**
 * @swagger
 * /api/location/students/{studentId}/nearby-facilities:
 *   get:
 *     summary: Find facilities near a specific student
 *     description: Get all facilities within a specified radius of a student's location
 *     tags:
 *       - Location
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *         example: 1
 *       - in: query
 *         name: radius_km
 *         schema:
 *           type: number
 *           format: float
 *           default: 10
 *         description: Search radius in kilometers (max 500)
 *         example: 25
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of results
 *         example: 30
 *     responses:
 *       200:
 *         description: Facilities found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Found 6 facilities within 25km of student"
 *                 data:
 *                   type: object
 *                   properties:
 *                     student_id:
 *                       type: integer
 *                       example: 1
 *                     student_name:
 *                       type: string
 *                       example: "John Doe"
 *                     radius_km:
 *                       type: number
 *                       example: 25
 *                     total_found:
 *                       type: integer
 *                       example: 6
 *                     facilities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           facility_id:
 *                             type: integer
 *                             example: 2
 *                           organization_name:
 *                             type: string
 *                             example: "CareWell Services"
 *                           registered_business_name:
 *                             type: string
 *                             example: "CareWell Pty Ltd"
 *                           website_url:
 *                             type: string
 *                             example: "https://carewell.com.au"
 *                           states_covered:
 *                             type: string
 *                             example: '["NSW"]'
 *                           categories:
 *                             type: string
 *                             example: '["Aged Care","Disability Support"]'
 *                           latitude:
 *                             type: number
 *                             example: -33.8800
 *                           longitude:
 *                             type: number
 *                             example: 151.2200
 *                           distance_km:
 *                             type: number
 *                             example: 8.92
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student not found
 */
router.get('/students/:studentId/nearby-facilities', LocationController.getFacilitiesNearStudent);

/**
 * @swagger
 * /api/location/facilities-with-student-count:
 *   get:
 *     summary: Get all facilities with nearby student counts
 *     description: Returns all facilities grouped with count and details of nearby students within specified radius. Useful for admins to see which facilities have the most students nearby.
 *     tags:
 *       - Location
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: radius_km
 *         schema:
 *           type: number
 *           format: float
 *           default: 10
 *         description: Search radius in kilometers (max 500)
 *         example: 15
 *       - in: query
 *         name: min_students
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Minimum number of nearby students (filter)
 *         example: 5
 *     responses:
 *       200:
 *         description: Facilities with student counts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Found 10 facilities with nearby students"
 *                 data:
 *                   type: object
 *                   properties:
 *                     radius_km:
 *                       type: number
 *                       example: 15
 *                     min_students:
 *                       type: integer
 *                       example: 5
 *                     total_facilities:
 *                       type: integer
 *                       example: 10
 *                     facilities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           facility_id:
 *                             type: integer
 *                             example: 1
 *                           organization_name:
 *                             type: string
 *                             example: "Sunshine Care Home"
 *                           registered_business_name:
 *                             type: string
 *                             example: "Sunshine Care Pty Ltd"
 *                           website_url:
 *                             type: string
 *                             example: "https://sunshinecare.com.au"
 *                           states_covered:
 *                             type: string
 *                             example: '["NSW"]'
 *                           categories:
 *                             type: string
 *                             example: '["Aged Care"]'
 *                           latitude:
 *                             type: number
 *                             example: -33.8688
 *                           longitude:
 *                             type: number
 *                             example: 151.2093
 *                           nearby_students_count:
 *                             type: integer
 *                             example: 12
 *                           nearby_students:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 student_id:
 *                                   type: integer
 *                                   example: 1
 *                                 name:
 *                                   type: string
 *                                   example: "John Doe"
 *                                 student_type:
 *                                   type: string
 *                                   example: "international"
 *                                 status:
 *                                   type: string
 *                                   example: "active"
 *                                 latitude:
 *                                   type: number
 *                                   example: -33.8700
 *                                 longitude:
 *                                   type: number
 *                                   example: 151.2100
 *                                 distance_km:
 *                                   type: number
 *                                   example: 1.45
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/facilities-with-student-count', LocationController.getFacilitiesWithStudentCount);

export default router;
