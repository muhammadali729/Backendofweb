import mongoose from 'mongoose';
import { logger } from './utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI: string | undefined = 
      process.env.NODE_ENV === 'production'
        ? process.env.MONGO_URI_PROD
        : process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('❌ MongoDB URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);
    logger.info(`✅ MongoDB Connected: ${conn.connection?.host || 'Unknown Host'}`);

    mongoose.connection.on('error', (err: Error) => {
      logger.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('🛑 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error: any) {
    logger.error(`❌ Database connection failed: ${error.message}`);
    process.exit(1);
  }
};
