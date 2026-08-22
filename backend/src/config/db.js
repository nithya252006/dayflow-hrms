const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dayflow_hrms';

  try {
    // Attempt standard connection with 3 second timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (primaryError) {
    console.warn(`⚠️ Could not connect to primary MongoDB at ${uri} (${primaryError.message}).`);
    console.log('🔄 Initializing embedded in-memory MongoDB for seamless execution...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'dayflow_hrms',
        },
        spawn: {
          timeout: 60000, // allow sufficient time on first download
        },
      });
      const memoryUri = mongoServer.getUri();

      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Embedded In-Memory MongoDB connected at ${memoryUri}`);

      // Auto-run seeder if running in memory fallback so database is rich with sample data
      const { seedDatabase } = require('../seeder/seedData');
      await seedDatabase(true);

      return conn;
    } catch (fallbackError) {
      console.error(`❌ Failed to connect to MongoDB: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
