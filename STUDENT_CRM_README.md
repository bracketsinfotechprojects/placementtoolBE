# Student Management CRM System

A comprehensive Student Management CRM system built with Node.js, TypeScript, TypeORM, and MySQL. This system manages student information, visa details, placement preferences, facility records, and job status tracking.

## 🏗️ Database Schema

### Core Tables

#### **students** (Anchor Table)
Main student information table with basic details:
- `student_id` (Primary Key)
- `first_name`, `last_name`
- `dob` (Date of Birth)
- `gender`, `nationality`, `student_type`
- `status` (active, inactive, graduated, withdrawn)

#### **contact_details**
Student contact information:
- `contact_id` (Primary Key)
- `student_id` (Foreign Key)
- `primary_mobile`, `email`, `emergency_contact`
- `contact_type` (mobile, landline, whatsapp)
- `is_primary`, `verified_at`

#### **visa_details**
Student visa information:
- `visa_id` (Primary Key)
- `student_id` (Foreign Key)
- `visa_type`, `visa_number`
- `start_date`, `expiry_date`
- `status` (active, expired, revoked, pending)
- `issuing_country`, `document_path`

#### **addresses**
Student addresses:
- `address_id` (Primary Key)
- `student_id` (Foreign Key)
- `line1`, `city`, `state`, `country`, `postal_code`
- `address_type` (current, permanent, temporary, mailing)
- `is_primary`

#### **eligibility_status**
Student eligibility tracking:
- `status_id` (Primary Key)
- `student_id` (Foreign Key)
- `classes_completed`, `fees_paid`, `assignments_submitted`
- `documents_submitted`, `trainer_consent`
- `override_requested`, `requested_by`, `reason`
- `overall_status` (eligible, not_eligible, pending, override)

#### **student_lifestyle**
Student lifestyle and mobility information:
- `lifestyle_id` (Primary Key)
- `student_id` (Foreign Key)
- **Employment & Family**: `currently_working`, `working_hours`, `has_dependents`, `married`
- **Transport & Mobility**: `driving_license`, `own_vehicle`, `public_transport_only`, `can_travel_long_distance`, `drop_support_available`
- **Availability & Flexibility**: `fully_flexible`, `rush_placement_required`, `preferred_days`, `preferred_time_slots`

#### **placement_preferences**
Student placement preferences:
- `preference_id` (Primary Key)
- `student_id` (Foreign Key)
- **Location**: `preferred_states`, `preferred_cities`, `max_travel_distance_km`
- **Shift**: `morning_only`, `evening_only`, `night_shift`, `weekend_only`, `part_time`, `full_time`
- **Companion**: `with_friend`, `friend_name_or_id`, `with_spouse`, `spouse_name_or_id`
- **Timeline**: `earliest_start_date`, `latest_start_date`, `specific_month_preference`, `urgency_level`

#### **facility_records**
Facility applications and records:
- `facility_id` (Primary Key)
- `student_id` (Foreign Key)
- **Facility Info**: `facility_name`, `facility_type`, `branch_site`, `facility_address`
- **Contact**: `contact_person_name`, `contact_email`, `contact_phone`, `supervisor_name`
- **Placement**: `distance_from_student_km`, `slot_id`, `course_type`, `shift_timing`, `start_date`, `duration_hours`, `gender_requirement`
- **Status**: `applied_on`, `student_confirmed`, `student_comments`, `document_type`, `file_path`, `application_status`

#### **address_change_requests**
Address change requests:
- `acr_id` (Primary Key)
- `student_id` (Foreign Key)
- `current_address`, `new_address`, `effective_date`, `change_reason`
- `impact_acknowledged`
- `status` (pending, approved, rejected, implemented)
- `reviewed_at`, `reviewed_by`, `review_comments`

#### **job_status_updates**
Job status tracking:
- `jsu_id` (Primary Key)
- `student_id` (Foreign Key)
- `status`, `last_updated_on`
- `employer_name`, `job_role`, `start_date`, `employment_type`
- `offer_letter_path`, `actively_applying`, `expected_timeline`
- `searching_comments`, `created_at`

## 🚀 Quick Start

### 1. Database Setup

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE testCRM CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Update .env file with your database credentials
cp .env.example .env
# Edit .env and update:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=Atul@2626
# DB_NAME=testCRM
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Migrations

```bash
# Run all migrations to create tables
npm run migration:run

# Or use the enhanced script
npm run db:migrate
```

### 4. Seed Sample Data

```bash
# Seed the database with sample students
npm run db:seed
```

### 5. Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 📊 Database Management

### Available Commands

```bash
# Migration management
npm run migration:run          # Run all pending migrations
npm run migration:revert       # Revert last migration
npm run migration:generate     # Generate new migration

# Enhanced database management
npm run db:migrate     # Run all pending migrations
npm run db:revert      # Revert last migration
npm run db:seed        # Seed database with sample student data
npm run db:tables      # Show all database tables
npm run db:table <name> # Show table information
npm run db:size        # Show database size
npm run db:drop        # Drop entire database (DANGEROUS!)
npm run db:help        # Show all available commands
```

### Check Database Status

```bash
# View all tables
npm run db:tables

# Get specific table info
npm run db:table students
npm run db:table contact_details
npm run db:table facility_records

# Check database size
npm run db:size
```

## 🏗️ Entity Relationships

```
students (1) -----> (M) contact_details
students (1) -----> (M) visa_details
students (1) -----> (M) addresses
students (1) -----> (M) eligibility_status
students (1) -----> (M) student_lifestyle
students (1) -----> (M) placement_preferences
students (1) -----> (M) facility_records
students (1) -----> (M) address_change_requests
students (1) -----> (M) job_status_updates
```

## 🔧 API Endpoints Structure

### Students API
```
GET    /api/students              # List all students
GET    /api/students/:id          # Get student details
POST   /api/students              # Create new student
PUT    /api/students/:id          # Update student
DELETE /api/students/:id          # Delete student (soft delete)
```

### Contact Details API
```
GET    /api/students/:id/contact          # Get student contact details
POST   /api/students/:id/contact          # Add contact details
PUT    /api/students/:id/contact/:cid     # Update contact details
DELETE /api/students/:id/contact/:cid     # Delete contact details
```

### Placement Preferences API
```
GET    /api/students/:id/preferences      # Get placement preferences
POST   /api/students/:id/preferences      # Add placement preferences
PUT    /api/students/:id/preferences/:pid # Update placement preferences
```

### Facility Records API
```
GET    /api/students/:id/facilities       # Get facility records
POST   /api/students/:id/facilities       # Add facility record
PUT    /api/students/:id/facilities/:fid  # Update facility record
```

## 📈 Key Features

### 1. **Student Lifecycle Management**
- Complete student profiles from enrollment to graduation
- Status tracking (active, inactive, graduated, withdrawn)
- Document management and verification

### 2. **Visa Management**
- Track visa types, numbers, and expiry dates
- Automated visa expiry notifications
- Document storage and management

### 3. **Placement Management**
- Comprehensive placement preferences tracking
- Facility application management
- Status tracking throughout placement process

### 4. **Lifestyle & Mobility Assessment**
- Transportation preferences and limitations
- Work schedule compatibility
- Geographic flexibility assessment

### 5. **Job Tracking**
- Employment status updates
- Job application tracking
- Offer letter management

### 6. **Address Management**
- Multiple address types per student
- Address change request workflow
- Impact assessment for address changes

## 🔒 Security Features

- **Soft Deletes**: Students are not permanently deleted
- **Data Validation**: Comprehensive input validation
- **Relationship Integrity**: Foreign key constraints
- **Audit Trail**: Created/updated timestamps
- **Document Security**: Secure file path management

## 📊 Performance Optimizations

### Database Indexes
- Strategic indexes on frequently queried columns
- Composite indexes for multi-column searches
- Foreign key indexes for join performance

### Query Optimization
- Efficient JOIN operations
- Pagination for large datasets
- Selective field retrieval

## 🛠️ Development Workflow

### 1. Adding New Features

1. **Create Entity**: Add new entity file in `src/entities/`
2. **Generate Migration**: `npm run migration:generate -- -n FeatureName`
3. **Implement Service**: Add service layer in `src/services/`
4. **Create Controller**: Add API endpoints in `src/controllers/`
5. **Add Routes**: Update route files
6. **Test**: Run migrations and test functionality

### 2. Database Changes

1. **Modify Entity**: Update entity file
2. **Generate Migration**: `npm run migration:generate -- -n ChangeDescription`
3. **Review Migration**: Check generated SQL
4. **Run Migration**: `npm run db:migrate`
5. **Verify**: Check database structure

### 3. Adding Sample Data

1. **Update Seeder**: Modify `src/database/database.seeder.ts`
2. **Run Seeding**: `npm run db:seed`

## 🚨 Important Notes

### Database Configuration
- **Database Name**: `testCRM` (as specified)
- **Connection**: MySQL with UTF8MB4 charset
- **Charset**: utf8mb4_unicode_ci for full Unicode support

### Migration Strategy
- All tables created via migrations (not synchronize)
- Foreign key constraints for data integrity
- Proper indexing for performance

### Sample Data
- Seeding system includes sample students
- Realistic test data for all tables
- Proper relationships between entities

## 📚 Documentation

- [ORM Setup Guide](docs/ORM_SETUP.md) - Comprehensive TypeORM usage guide
- [Database Setup](README_DATABASE.md) - Database management guide
- [API Documentation](docs/API.md) - Complete API reference (to be created)

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeORM conventions
3. Write migrations for all database changes
4. Add proper error handling
5. Include comprehensive logging

---

**Database Connection Details:**
- Host: `localhost`
- User: `root`
- Password: `Atul@2626`
- Database: `testCRM`
- Port: `3306`

**Next Steps:**
1. Set up your MySQL database
2. Configure environment variables
3. Run migrations to create tables
4. Seed sample data
5. Start building your API endpoints
6. Implement the frontend interface

This system provides a solid foundation for a comprehensive Student Management CRM with all the features needed for educational institution placement management.