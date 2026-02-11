import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/marketplace_service',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  nodeEnv: process.env.NODE_ENV || 'development',
};
