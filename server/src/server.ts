import dotenv from 'dotenv';
import app from './app';
import { mongoConnection } from './config';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await mongoConnection.connect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server', error);
    process.exit(1);
  }
};

startServer();
