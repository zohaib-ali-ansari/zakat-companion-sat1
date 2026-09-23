const mongoose = require('mongoose');
const dns = require('dns');

// Fallback to Google / Cloudflare public DNS to fix Windows DNS SRV lookup (querySrv ECONNREFUSED) for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // ignore error if custom DNS is not permitted
}

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zakat-companion';

  try {
    await mongoose.connect(mongoURI);
    console.log(`MongoDB connected successfully (${mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'})`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('\nTroubleshooting Checklist:');
    console.error('1. If using MongoDB Atlas: Ensure your current IP address is whitelisted in MongoDB Atlas Dashboard -> Network Access.');
    console.error('2. Ensure your internet connection is active and firewall permits outbound port 27017 / DNS.');
  }
};

module.exports = connectDB;
