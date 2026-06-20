const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

// Start connection to the database
connectDB().then(() => {
  const server = app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Handle unhandled promise rejections outside Express boundaries
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}).catch((error) => {
  console.error(`Database seeding / initialization failed: ${error.message}`);
  process.exit(1);
});
