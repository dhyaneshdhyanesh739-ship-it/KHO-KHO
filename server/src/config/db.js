import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kho-kho-arena';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection Failed! URI: ${uri}`);
    console.error(`[MongoDB] Error: ${error.message}`);
    // Do not crash silently; allow callers to inspect or rethrow
    throw error;
  }
};
