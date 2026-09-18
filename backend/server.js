import app from './src/app.js';
import { ENV } from './src/config/env.js';
import { testDbConnection } from './src/config/db.js';

const startServer = async () => {
  const dbStatus = await testDbConnection();
  if (dbStatus.ok) {
    console.log(`[Database] ${dbStatus.message}`);
  } else {
    console.warn(`[Database Warning] ${dbStatus.message}`);
  }

  app.listen(ENV.PORT, () => {
    console.log(`[Server] Backend đang chạy tại port: ${ENV.PORT}`);
  });
};

startServer();