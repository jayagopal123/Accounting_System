import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";

connectDB()
  .then(() => {
    const server = app.listen(env.PORT, () => {
      console.log(
        `Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`
      );
    });

    process.on("unhandledRejection", (err) => {
      console.error(`Unhandled Rejection Error: ${err.message}`);

      server.close(() => process.exit(1));
    });
  })
  .catch((error) => {
    console.error(
      `Database seeding / initialization failed: ${error.message}`
    );

    process.exit(1);
  });
