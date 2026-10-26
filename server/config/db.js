const mongoose = require('mongoose');

// Connects to MongoDB using the URI from environment variables.
// Exits the process on failure since the API is useless without a DB.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('Server continuing to serve requests while MongoDB reconnects...');
  }
};

module.exports = connectDB;
