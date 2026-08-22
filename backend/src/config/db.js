const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI ||
    'mongodb+srv://nithyashreeganesan2007_db_user:Z8kmOWQGMZriGuTR@cluster0.giun5zx.mongodb.net/dayflow_hrms?retryWrites=true&w=majority';

  try {
    // Attempt standard / cloud connection
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed if empty
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty, seeding initial workforce...');
      const { seedDatabase } = require('../seeder/seedData');
      await seedDatabase(true);
    }

    return conn;
  } catch (primaryError) {
    console.warn(`⚠️ Could not connect to primary MongoDB at ${uri} (${primaryError.message}).`);
    console.log('🔄 Initializing embedded in-memory MongoDB for seamless execution...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'dayflow_hrms',
          port: 27017,
        },
        spawn: {
          timeout: 120000,
        },
      });
      const memoryUri = mongoServer.getUri();

      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Embedded In-Memory MongoDB connected at ${memoryUri}`);

      // Auto-run seeder
      const { seedDatabase } = require('../seeder/seedData');
      await seedDatabase(true);

      return conn;
    } catch (fallbackError) {
      console.error(`❌ Failed to connect to MongoDB: ${fallbackError.message}`);
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
