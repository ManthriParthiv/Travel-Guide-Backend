const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables early

const mongoURL = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connection successful');

    // Optional: Try fetching data from "sample" collection
    const sampleCollection = mongoose.connection.db.collection('sample');
    const data = await sampleCollection.find().toArray();

    if (data.length === 0) {
      console.warn('⚠️ No data found in the "sample" collection');
    } else {
      console.log('📦 Sample data loaded from db.js');
    }

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
};

module.exports = connectDB;
