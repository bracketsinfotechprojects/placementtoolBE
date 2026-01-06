# Database Setup and ORM Guide

This project uses TypeORM with MySQL for database management. This guide provides comprehensive instructions for setting up and managing your database.

## 🚀 Quick Start

### Prerequisites
- MySQL 5.7+ or 8.0+
- Node.js 14+
- npm or yarn

### 1. Environment Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Update your database credentials in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=nodejs-sample
   DB_PORT=3306
   ```

### 2. Database Creation

Create your database in MySQL:
```sql
CREATE DATABASE nodejs-sample CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Run Migrations

```bash
# Run all pending migrations
npm run migration:run

# Or use the new script
npm run db:migrate
```

### 4. Seed Sample Data

```bash
npm run db:seed
```

## 📊 Database Management Commands

### Available Scripts

```bash
# Migration management
npm run migration:run          # Run all pending migrations
npm run migration:revert       # Revert last migration
npm run migration:generate     # Generate new migration

# Enhanced database management
npm run db:migrate     # Run all pending migrations
npm run db:revert      # Revert last migration
npm run db:seed        # Seed database with sample data
npm run db:tables      # Show all database tables
npm run db:table <name> # Show detailed table information
npm run db:size        # Show database size
npm run db:drop        # Drop entire database (DANGEROUS!)
npm run db:help        # Show all available commands
```

### Database Operations

#### Check Database Status
```bash
# View all tables
npm run db:tables

# Get table information
npm run db:table user

# Check database size
npm run db:size
```

#### Migration Management
```bash
# Generate a new migration after making entity changes
npm run migration:generate -- -n AddUserProfiles

# Run migrations
npm run db:migrate

# Revert if needed
npm run db:revert
```

## 🏗️ Database Structure

### Current Tables

- **user**: Main user table with optimized indexing
  - Enhanced with status, phone, avatar, last login tracking
  - Proper indexes for performance
  - Soft delete support

### Entity Structure

```typescript
// Base entity for common fields
export class BaseEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// User entity with optimization
@Entity('user', { orderBy: { id: 'DESC' } })
@Unique(['email'])
@Index(['email'])
@Index(['createdAt'])
export class User extends BaseEntity {
  // Enhanced fields with proper typing and validation
  // Performance optimized with strategic indexing
}
```

## 🔧 Advanced Features

### 1. Database Health Monitoring

The project includes health check utilities:

```typescript
import { checkDatabaseHealth } from './database/database.config';

const isHealthy = await checkDatabaseHealth();
```

### 2. Database Seeding System

Pre-built seeding system for test data:

```typescript
// Seed users with sample data
await seedDatabase();

// Or use the seeder class directly
const seeder = new DatabaseSeeder(queryRunner);
await seeder.runAllSeeds();
```

### 3. Database Management Utilities

Comprehensive database management tools:

```typescript
import { DatabaseManager } from './database/database.manager';

const manager = new DatabaseManager(connection);

// Check if table exists
await manager.tableExists('user');

// Get table statistics
await manager.getTableStats('user');

// Optimize table
await manager.optimizeTable('user');
```

## 📈 Performance Optimization

### 1. Database Indexes

The optimized user entity includes strategic indexes:

- **Email**: Unique index for login queries
- **CreatedAt**: For chronological queries
- **FirstName + LastName**: For search functionality
- **Status**: For user filtering

### 2. Query Optimization

- Use `select` to limit returned fields
- Implement proper pagination
- Use QueryBuilder for complex queries
- Cache frequently accessed data

### 3. Connection Management

- Connection pooling configured
- Health monitoring implemented
- Proper error handling and recovery

## 🔒 Security Features

### 1. Password Security
- Passwords are hashed before storage
- Salt rounds: 10 for secure hashing
- Password fields hidden from SELECT queries

### 2. Data Protection
- SQL injection prevention via ORM
- Input validation with Joi schemas
- Soft delete for data safety

### 3. Access Control
- Authentication middleware
- Permission-based route access
- JWT token management

## 🛠️ Troubleshooting

### Common Issues

#### Connection Failed
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p
```

#### Migration Errors
```bash
# Check migration status
npm run db:tables

# Revert if needed
npm run db:revert
```

#### Performance Issues
```bash
# Check database size
npm run db:size

# Get table statistics
npm run db:table user
```

### Debug Mode

Enable detailed logging in development:
```javascript
// In ormconfig.js
logging: 'all'  // Development
logging: 'error' // Production
```

## 📚 Best Practices

### 1. Entity Design
- Use BaseEntity for common fields
- Add proper indexes for frequently queried columns
- Implement soft deletes for data safety
- Use enums for status fields

### 2. Migration Strategy
- Always use migrations in production
- Test migrations in development first
- Keep migrations small and focused
- Include rollback logic

### 3. Query Optimization
- Use QueryBuilder for complex queries
- Implement pagination for large datasets
- Limit selected fields for performance
- Use proper joins for relationships

### 4. Database Maintenance
- Regular backup procedures
- Monitor database size and growth
- Optimize tables periodically
- Monitor connection pool usage

## 🔄 Development Workflow

### 1. Making Entity Changes
1. Modify entity files
2. Generate migration: `npm run migration:generate -- -n ChangeDescription`
3. Review generated migration
4. Run migration: `npm run db:migrate`
5. Test changes

### 2. Adding New Tables
1. Create new entity
2. Generate migration
3. Update database configuration
4. Run migration
5. Create service layer

### 3. Production Deployment
1. Run migrations: `npm run migration:run`
2. Verify database structure
3. Check performance metrics
4. Monitor application logs

## 📖 Additional Resources

- [TypeORM Documentation](https://typeorm.io/)
- [MySQL Performance Guide](https://dev.mysql.com/doc/)
- [Database Design Patterns](https://www.postgresql.org/docs/)

---

For more detailed information, see the complete [ORM Setup Guide](docs/ORM_SETUP.md).