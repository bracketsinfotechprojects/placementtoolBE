require('dotenv/config');

module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Atul@2626',
  database: process.env.DB_NAME || 'testcrm',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  driver: require('mysql2'),
  synchronize: false,
  entities: process.env.NODE_ENV !== 'production' ? [
    'src/entities/student/*.entity.ts',
    'src/entities/user/*.entity.ts',
    'src/entities/facility/*.entity.ts',
    'src/entities/facility-supervisor/*.entity.ts',
    'src/entities/placement-executive/*.entity.ts',
    'src/entities/file/*.entity.ts',
    'src/entities/trainer/*.entity.ts',
    'src/entities/base/*.entity.ts'
  ] : [
    'dist/entities/student/*.entity.js',
    'dist/entities/user/*.entity.js',
    'dist/entities/facility/*.entity.js',
    'dist/entities/facility-supervisor/*.entity.js',
    'dist/entities/placement-executive/*.entity.js',
    'dist/entities/file/*.entity.js',
    'dist/entities/trainer/*.entity.js',
    'dist/entities/base/*.entity.js'
  ],
  logging: process.env.NODE_ENV !== 'production' ? 'all' : 'error',
  migrations: ['src/migrations/*.ts'],
  cli: {
    migrationsDir: 'src/migrations'
  },
  connectTimeout: 30000
};
