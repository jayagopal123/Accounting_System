require('dotenv').config();

const cleanEnv = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/erp_accounting',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key_change_in_production_123',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h'
};

// Validate critical variables in production
if (cleanEnv.NODE_ENV === 'production' && (!process.env.JWT_SECRET || cleanEnv.JWT_SECRET === 'fallback_secret_key_change_in_production_123')) {
  console.warn('WARNING: Running in production mode with a fallback or missing JWT_SECRET!');
}

module.exports = cleanEnv;
