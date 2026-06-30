const mongoose = require('mongoose');

// MongoDB Connection String (Standard non-SRV format to avoid DNS issues)
const MONGO_URI = 'mongodb://sanjayvarmaa2604_db_user:7yxPxSCL2Icdamtl@ac-yuf30yr-shard-00-00.nd0idr1.mongodb.net:27017,ac-yuf30yr-shard-00-01.nd0idr1.mongodb.net:27017,ac-yuf30yr-shard-00-02.nd0idr1.mongodb.net:27017/nestrox?ssl=true&replicaSet=atlas-astoad-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas Cloud Database!'))
.catch(err => console.error('❌ Error connecting to MongoDB:', err));

// Ensure Rooms collection exists
mongoose.connection.on('connected', async () => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'rooms' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('rooms');
      console.log('✅ Created "rooms" collection in MongoDB.');
    }
  } catch (err) {
    console.error('Error creating rooms collection:', err);
  }
});

// Define User Schema
const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  full_name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  created_date: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

// Define Room Schema
const roomSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  max_roommates: {
    type: Number,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  created_at: {
    type: String,
    required: true
  },
  creator_id: {
    type: String,
    required: true
  },
  roommates: {
    type: [String],
    default: []
  }
}, { collection: 'rooms' });

const Room = mongoose.model('Room', roomSchema);

module.exports = { User, Room };
