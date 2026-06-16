require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'testcrm',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  legacySpatialSupport: false,
  synchronize: false,
  // Connection pool limits to prevent resource exhaustion
  extra: {
    connectionLimit: parseInt(process.env.DB_POOL_LIMIT) || 10,
    waitForConnections: true,
    queueLimit: 0
  },
  // TypeORM connection pool settings
  maxConnections: parseInt(process.env.DB_POOL_LIMIT) || 10,
  entities: process.env.NODE_ENV !== 'production' ? [
    'src/entities/student/*.entity.ts',
    'src/entities/user/*.entity.ts',
    'src/entities/facility/*.entity.ts',
    'src/entities/facility-supervisor/*.entity.ts',
    'src/entities/placement-executive/*.entity.ts',
    'src/entities/placement-slot/*.entity.ts',
    'src/entities/placement-assignment/*.entity.ts',
    'src/entities/file/*.entity.ts',
    'src/entities/trainer/*.entity.ts',
    'src/entities/course-slots/*.entity.ts',
    'src/entities/course-assignment/*.entity.ts',
    'src/entities/attendance/*.entity.ts',
    'src/entities/complaint/*.entity.ts',
    'src/entities/certificate/*.entity.ts',
    'src/entities/career-job/*.entity.ts',
    'src/entities/base/*.entity.ts'
  ] : [
    'dist/entities/student/*.entity.js',
    'dist/entities/user/*.entity.js',
    'dist/entities/facility/*.entity.js',
    'dist/entities/facility-supervisor/*.entity.js',
    'dist/entities/placement-executive/*.entity.js',
    'dist/entities/placement-slot/*.entity.js',
    'dist/entities/placement-assignment/*.entity.js',
    'dist/entities/file/*.entity.js',
    'dist/entities/trainer/*.entity.js',
    'dist/entities/course-slots/*.entity.js',
    'dist/entities/course-assignment/*.entity.js',
    'dist/entities/attendance/*.entity.js',
    'dist/entities/complaint/*.entity.js',
    'dist/entities/certificate/*.entity.js',
    'dist/entities/career-job/*.entity.js',
    'dist/entities/base/*.entity.js'
  ],
  logging: process.env.NODE_ENV !== 'production' ? 'all' : ['error'],
  migrations:
    process.env.NODE_ENV !== 'production'
      ? ['src/migrations/*.ts']
      : ['dist/migrations/*.js'],
  cli: {
    migrationsDir:
      process.env.NODE_ENV !== 'production'
        ? 'src/migrations'
        : 'dist/migrations'
  },
  connectTimeout: 30000
};
