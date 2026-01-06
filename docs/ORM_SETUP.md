# ORM Setup and Database Management Guide

This guide explains how to use TypeORM effectively in your Node.js application for database creation, table management, and API development.

## 🚀 Quick Start

### 1. Database Configuration

Your project is already configured with TypeORM. The configuration is in `ormconfig.js`:

```javascript
module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nodejs-sample',
  port: process.env.DB_PORT || 3306,
  synchronize: false,  // Always use migrations in production
  entities: ['**/**.entity.ts'],
  migrations: ['src/migrations/*.ts'],
};
```

### 2. Environment Setup

Copy `.env.example` to `.env` and update the database credentials:

```bash
cp .env.example .env
```

Update the following variables:
- `DB_HOST`: Your MySQL host
- `DB_USER`: Your MySQL username
- `DB_PASSWORD`: Your MySQL password
- `DB_NAME`: Your database name

## 📊 Database Management

### Available Scripts

The project includes comprehensive database management scripts:

```bash
# Run migrations
npm run migration:run

# Generate new migration
npm run migration:generate -- -n MigrationName

# Revert last migration
npm run migration:revert

# Database setup operations
npm run db:migrate     # Run all pending migrations
npm run db:revert      # Revert last migration
npm run db:seed        # Seed database with sample data
npm run db:tables      # Show all tables
npm run db:table <name> # Show table information
npm run db:size        # Show database size
npm run db:drop        # Drop entire database (DANGEROUS!)
```

### Database Initialization

1. **Start with migrations**: Always use migrations for production
2. **Seed data**: Use the seeding system for test data
3. **Monitor health**: Use the health check utilities

## 🏗️ Entity Design Best Practices

### 1. Base Entity Pattern

Use the base entity for common fields:

```typescript
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 2. Optimized User Entity

The enhanced user entity includes:

- **Indexes**: For better query performance
- **Soft deletes**: For data safety
- **Status management**: For account control
- **Security features**: Password hiding in queries
- **Virtual properties**: For computed values

### 3. Entity Relationships

Plan your entity relationships:

```typescript
// Example relationship setup
@OneToMany(() => UserProfile, profile => profile.user)
profiles: UserProfile[];

@OneToMany(() => UserSession, session => session.user)
sessions: UserSession[];
```

## 🔧 Service Layer Pattern

### Repository Pattern

Use the repository pattern for database operations:

```typescript
import { getRepository } from 'typeorm';
import { User } from '../entities/user/user.entity';

const createUser = async (userData: CreateUserDto) => {
  const user = new User();
  user.email = userData.email;
  user.password = await Encryption.generateHash(userData.password, 10);
  user.firstName = userData.firstName;
  user.lastName = userData.lastName;
  
  return await getRepository(User).save(user);
};
```

### QueryBuilder for Complex Queries

Use QueryBuilder for complex operations:

```typescript
const listUsers = async (params: UserQueryParams) => {
  let query = getRepository(User).createQueryBuilder('user');
  
  if (params.keyword) {
    query = query.andWhere(
      '(LOWER(user.firstName) LIKE LOWER(:keyword) OR LOWER(user.lastName) LIKE LOWER(:keyword))',
      { keyword: `%${params.keyword}%` }
    );
  }
  
  return await query
    .limit(params.limit)
    .offset(getOffset(params.limit, params.page))
    .getMany();
};
```

## 🚦 Migration Management

### Creating Migrations

1. **Generate from changes**:
   ```bash
   npm run migration:generate -- -n CreateUserProfiles
   ```

2. **Manual migration**:
   ```bash
   npm run migration:generate -- -n MigrationName
   ```

### Migration Best Practices

- Always test migrations in development first
- Include rollback logic in `down()` method
- Use transactions for complex migrations
- Keep migrations small and focused

## 📈 Performance Optimization

### 1. Database Indexes

Add indexes for frequently queried columns:

```typescript
@Index(['email'])
@Index(['createdAt'])
@Index(['firstName', 'lastName'])
```

### 2. Query Optimization

- Use `select` to limit returned fields
- Implement pagination for large datasets
- Use proper joins for relationships
- Cache frequently accessed data

### 3. Connection Pooling

Configure connection pooling in production:

```javascript
{
  // ... other config
  max: 10,           // Maximum number of connections
  min: 2,            // Minimum number of connections
  acquire: 30000,    // Acquisition timeout
  idle: 30000,       // Idle timeout
}
```

## 🔒 Security Considerations

### 1. Password Security

- Always hash passwords before storage
- Use salt for password hashing
- Never log passwords

### 2. SQL Injection Prevention

- Use parameterized queries
- Validate input data
- Use ORM features instead of raw SQL when possible

### 3. Sensitive Data

- Mark sensitive fields with `select: false`
- Use encryption for critical data
- Implement proper access controls

## 📊 Monitoring and Health Checks

### Database Health Monitoring

Use the health check utilities:

```typescript
import { checkDatabaseHealth } from './database/database.config';

const isHealthy = await checkDatabaseHealth();
```

### Performance Monitoring

- Monitor query execution times
- Track connection pool usage
- Monitor database size and growth

## 🛠️ Troubleshooting

### Common Issues

1. **Connection failures**:
   - Check database credentials
   - Verify database server is running
   - Check firewall settings

2. **Migration issues**:
   - Ensure database is accessible
   - Check for syntax errors in migrations
   - Verify entity definitions

3. **Performance issues**:
   - Add appropriate indexes
   - Optimize queries
   - Monitor connection pool

### Debug Mode

Enable debug logging in development:

```javascript
logging: 'all'  // In development
logging: 'error' // In production
```

## 📚 Additional Resources

- [TypeORM Documentation](https://typeorm.io/)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/tutorial.html)

## 🎯 Next Steps

1. **Implement additional entities** following the patterns shown
2. **Set up database monitoring** for production
3. **Implement caching strategies** for improved performance
4. **Create backup and recovery procedures**
5. **Set up database replication** for high availability

---

For questions or issues, refer to the project documentation or create an issue in the repository.