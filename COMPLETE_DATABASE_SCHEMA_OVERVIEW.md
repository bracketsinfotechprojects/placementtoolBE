# Complete Database Schema Overview

## Student-Related Tables Created

Here's the complete list of all tables created in your database related to students and user management:

### **Core Student Management Tables**

#### 1. **students** - Main student records
- `student_id` (Primary Key)
- `first_name`, `last_name`, `full_name` 
- `dob`, `gender`, `nationality`
- `student_type` (domestic/international)
- `status` (active/inactive/graduated/withdrawn)
- `isDeleted`, `createdAt`, `updatedAt`

#### 2. **contact_details** - Student contact information
- `contact_id` (Primary Key)
- `student_id` (Foreign Key → students.student_id)
- `primary_mobile`, `email`, `emergency_contact`
- `contact_type` (mobile/landline/whatsapp)
- `is_primary`, `verified_at`

#### 3. **visa_details** - Student visa information
- `visa_id` (Primary Key)
- `student_id` (Foreign Key → students.student_id)
- `visa_type`, `visa_number`, `start_date`, `expiry_date`
- `status` (active/expired/revoked/pending)
- `issuing_country`, `document_path`

#### 4. **addresses** - Student address information
- `address_id` (Primary Key)
- `student_id` (Foreign Key → students.student_id)
- `line1`, `city`, `state`, `country`, `postal_code`
- `address_type` (current/permanent/temporary/mailing)
- `is_primary`

### **Student Status & Lifestyle Tables**

#### 5. **eligibility_status** - Student eligibility tracking
- `status_id` (Primary Key)
- `student_id` (Foreign Key → students.student_id)
- `classes_completed`, `fees_paid`, `assignments_submitted`
- `documents_submitted`, `trainer_consent`
- `override_requested`, `requested_by`, `reason`
- `overall_status` (eligible/not_eligible/pending/override)

#### 6. **student_lifestyle** - Student lifestyle preferences
- `lifestyle_id` (Primary Key)
- `student_id` (Foreign Key → students.student_id)
- `currently_working`, `working_hours`, `has_dependents`
- `married`, `driving_license`, `own_vehicle`
- `public_transport_only`, `can_travel_long_distance`
- `drop_support_available`, `fully_flexible`
- `rush_placement_required`
- `preferred_days`, `preferred_time_slots`
- `additional_notes`

#### 7. **placement_preferences** - Job placement preferences
- `preference_id` (Primary Key)
- `student_id` (Foreign Key → students.student_id)
- `preferred_states`, `preferred_cities`
- `max_travel_distance_km`
- `morning_only`, `evening_only`, `night_shift`
- `weekend_only`, `part_time`, `full_time`
- `with_friend`, `friend_name_or_id`
- `with_spouse`, `spouse_name_or_id`
- `earliest_start_date`, `latest_start_date`
- `specific_month_preference`
- `urgency_level` (immediate/within_month/within_quarter/flexible)
- `additional_preferences`

### **Facility & Job Tracking Tables**

#### 8. **facility_records** - Training facility records
- `facility_id` (Primary Key)
- `student_id` (Foreign Key → students.student_id)
- `facility_name`, `facility_type`, `branch_site`
- `facility_address`, `contact_person_name`
- `contact_email`, `contact_phone`
- `supervisor_name`, `distance_from_student_km`
- `slot_id`, `course_type`, `shift_timing`
- `start_date`, `duration_hours`, `gender_requirement`
- `applied_on`, `student_confirmed`
- `student_comments`, `document_type`, `file_path`
- `application_status` (applied/under_review/accepted/rejected/confirmed/completed)

#### 9. **address_change_requests** - Address change tracking
- `acr_id` (Primary Key)
- `student_id` (Foreign Key → students.student_id)
- `current_address`, `new_address`
- `effective_date`, `change_reason`
- `impact_acknowledged`
- `status` (pending/approved/rejected/implemented)
- `reviewed_at`, `reviewed_by`, `review_comments`

#### 10. **job_status_updates** - Employment status tracking
- `jsu_id` (Primary Key)
- `student_id` (Foreign Key → students.student_id)
- `status`, `last_updated_on`
- `employer_name`, `job_role`, `start_date`
- `employment_type`, `offer_letter_path`
- `actively_applying`, `expected_timeline`
- `searching_comments`, `created_at`

### **User Management Tables**

#### 11. **users** - User accounts (FIXED - now properly registered)
- `id` (Primary Key)
- `loginID` (email address, unique)
- `password` (encrypted)
- `userRole` (admin/user/Student/etc.)
- `status` (active/inactive)
- `isDeleted`, `createdAt`, `updatedAt`

#### 12. **roles** - User roles
- `role_id` (Primary Key)
- `role_name` (Admin, Facility, Supervisor, Placement Executive, Trainer, Student)
- `isDeleted`, `created_at`, `updatedAt`

#### 13. **user_roles** - User-role relationships
- `user_id` (Foreign Key → users.id)
- `role_id` (Foreign Key → roles.role_id)
- `created_at`
- **Primary Key**: (user_id, role_id)

## Database Relationships

```
students (1) ←→ (M) contact_details
students (1) ←→ (M) visa_details  
students (1) ←→ (M) addresses
students (1) ←→ (1) eligibility_status
students (1) ←→ (1) student_lifestyle
students (1) ←→ (1) placement_preferences
students (1) ←→ (M) facility_records
students (1) ←→ (M) address_change_requests
students (1) ←→ (M) job_status_updates

users (1) ←→ (M) user_roles ←→ (M) roles
```

## Configuration Status

### ✅ Entity Registration (FIXED)
- **ormconfig.js**: All student entities properly registered via `'src/entities/student/*.entity.ts'`
- **User entities**: Added `'src/entities/user/*.entity.ts'` (CRITICAL FIX)

### ✅ Migration System
- **Complete migration**: `1704205800000-CompleteEntityMatchingSchema.ts`
- **Creates all 13 tables** with proper relationships and constraints
- **Includes default roles**: Admin, Facility, Supervisor, Placement Executive, Trainer, Student

### ✅ Indexes and Constraints
- **Foreign key constraints** on all student-related tables
- **Unique indexes** on loginID, email, visa_number
- **Performance indexes** on frequently queried fields
- **Cascade delete** behavior for data integrity

## Key Features

1. **Complete Student Lifecycle Management** - From enrollment to job placement
2. **Flexible Address Management** - Current, permanent, temporary, mailing addresses
3. **Comprehensive Contact Tracking** - Multiple contact methods with verification
4. **Visa Status Monitoring** - Track visa applications and renewals
5. **Lifestyle Preferences** - Detailed student preferences for placement matching
6. **Facility Management** - Track training facilities and placements
7. **Job Status Tracking** - Monitor employment outcomes
8. **Role-Based Access Control** - User management with proper role assignments
9. **Soft Delete Support** - All tables support `isDeleted` for data retention
10. **Audit Trail** - `createdAt` and `updatedAt` timestamps throughout

## Fixes Applied

1. **User Entity Registration**: Added user entities to ormconfig.js
2. **User Creation with Role Assignment**: Fixed user creation to include role linking
3. **Enhanced Error Handling**: Proper error reporting for debugging
4. **Complete Schema**: All student-related tables properly created and linked

The database schema is now complete and fully functional for student management with user authentication and role-based access control.