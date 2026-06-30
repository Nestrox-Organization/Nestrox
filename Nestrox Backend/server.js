const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const { User, Room } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

const FRONTEND_DIR = path.join(__dirname, 'Nestrox Frontend');
const BRAND_DIR    = path.join(__dirname, 'Nestrox Logo & Brand');

/* ============================================================
   Middleware
   ============================================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: 'nestrox-secret-key-129-purple-blue-navy',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: false
  }
}));

// Serve static frontend files (index.html, dashboard.html, CSS, JS)
app.use(express.static(FRONTEND_DIR));

// Bulletproof middleware for Logo & Brand assets
// (Avoids URL encoding issues with spaces and '&' in the folder name)
app.use((req, res, next) => {
  if (req.path.includes('Background.png')) {
    return res.sendFile(path.join(BRAND_DIR, 'Background.png'));
  }
  if (req.path.includes('Nestrox_Logo_No_Bg.png')) {
    return res.sendFile(path.join(BRAND_DIR, 'Nestrox_Logo_No_Bg.png'));
  }
  if (req.path.includes('Nestrox_BrandName.png')) {
    return res.sendFile(path.join(BRAND_DIR, 'Nestrox_BrandName.png'));
  }
  if (req.path.includes('Nestrox_Logo.png')) {
    return res.sendFile(path.join(BRAND_DIR, 'Nestrox_Logo.png'));
  }
  next();
});

/* ============================================================
   Auth Guard Middleware
   ============================================================ */
const checkAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Please log in first.' });
  }
};

/* ============================================================
   API ENDPOINTS
   ============================================================ */

/**
 * POST /api/register
 * Register a new user. Validates required fields, checks for
 * duplicate username/email/phone, hashes password with bcrypt,
 * and inserts into the MongoDB database.
 */
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, username, email, phone, password } = req.body;

    // --- Required field check ---
    if (!fullName || !fullName.trim()) return res.status(400).json({ error: 'Full name is required.' });
    if (!username || !username.trim()) return res.status(400).json({ error: 'Username is required.' });
    if (!email    || !email.trim())    return res.status(400).json({ error: 'Email is required.' });
    if (!phone    || !phone.trim())    return res.status(400).json({ error: 'Phone number is required.' });
    if (!password)                     return res.status(400).json({ error: 'Password is required.' });

    // --- Duplicate checks using Mongoose ---
    const existingUsername = await User.findOne({ username: username.trim().toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      return res.status(400).json({ error: 'Phone number already registered.' });
    }

    // --- Hash password with bcrypt ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Insert new user ---
    const userId      = crypto.randomUUID();
    const createdDate = new Date().toISOString();

    const newUser = new User({
      id: userId,
      full_name: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
      created_date: createdDate
    });

    await newUser.save();

    return res.status(201).json({ success: true, message: 'Registration successful!' });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

/**
 * POST /api/login
 * Authenticate using username OR email + password.
 * Creates a server-side session on success.
 */
app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ error: 'Username or email is required.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const idenLower = identifier.trim().toLowerCase();

    // Find user by username OR email
    const user = await User.findOne({
      $or: [
        { username: idenLower },
        { email: idenLower }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Compare password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    // Create session
    req.session.userId   = user.id;
    req.session.username = user.username;

    return res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id:       user.id,
        fullName: user.full_name,
        username: user.username,
        email:    user.email,
        phone:    user.phone
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

/**
 * GET /api/user
 * Returns the currently logged-in user's profile.
 * Requires an active session (auth guarded).
 */
app.get('/api/user', checkAuth, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.session.userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({
      success: true,
      user: {
        id:          user.id,
        fullName:    user.full_name,
        username:    user.username,
        email:       user.email,
        phone:       user.phone,
        createdDate: user.created_date
      }
    });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user details.' });
  }
});

/**
 * PUT /api/user
 * Update the logged-in user's profile (fullName, email, phone).
 * Stubbed for future use — auth guarded.
 */
app.put('/api/user', checkAuth, async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;

    if (!fullName && !email && !phone) {
      return res.status(400).json({ error: 'Nothing to update.' });
    }

    // Duplicate email check (excluding current user)
    if (email) {
      const existing = await User.findOne({ email: email.trim().toLowerCase(), id: { $ne: req.session.userId } });
      if (existing) return res.status(400).json({ error: 'Email already registered.' });
    }

    // Duplicate phone check (excluding current user)
    if (phone) {
      const existing = await User.findOne({ phone: phone.trim(), id: { $ne: req.session.userId } });
      if (existing) return res.status(400).json({ error: 'Phone number already registered.' });
    }

    // Build update object
    const updateData = {};
    if (fullName) updateData.full_name = fullName.trim();
    if (email)    updateData.email     = email.trim().toLowerCase();
    if (phone)    updateData.phone     = phone.trim();

    await User.updateOne({ id: req.session.userId }, { $set: updateData });

    return res.json({ success: true, message: 'Profile updated successfully.' });

  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ error: 'Profile update failed.' });
  }
});

/**
 * POST /api/logout
 * Destroys the server-side session and clears the cookie.
 */
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed.' });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: 'Logged out successfully.' });
  });
});

/* ============================================================
   Room APIs
   ============================================================ */

/**
 * POST /api/rooms
 * Create a new room. Requires session authentication (checkAuth).
 * Body: { name, description, maxRoommates }
 */
app.post('/api/rooms', checkAuth, async (req, res) => {
  try {
    const { name, description, maxRoommates } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Room name is required.' });
    }

    const parsedMax = parseInt(maxRoommates, 10);
    if (isNaN(parsedMax) || parsedMax < 1 || parsedMax > 10) {
      return res.status(400).json({ error: 'Maximum roommates must be between 1 and 10.' });
    }

    // Generate unique 6-character room code (alphanumeric uppercase)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 100) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const existing = await Room.findOne({ code });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Could not generate a unique room code. Please try again.' });
    }

    // Check if the user is already in a room. If they are, they shouldn't create a new one.
    const userInRoom = await Room.findOne({ roommates: req.session.userId });
    if (userInRoom) {
      return res.status(400).json({ error: 'You are already in a room. Please leave your current room first.' });
    }

    const roomId = crypto.randomUUID();
    const newRoom = new Room({
      id: roomId,
      name: name.trim(),
      description: (description || '').trim(),
      max_roommates: parsedMax,
      code: code,
      creator_id: req.session.userId,
      created_at: new Date().toISOString(), // server timestamp
      roommates: [req.session.userId]
    });

    await newRoom.save();

    return res.status(201).json({
      success: true,
      message: 'Room created successfully!',
      room: newRoom
    });

  } catch (err) {
    console.error('Create room error:', err);
    return res.status(500).json({ error: 'Failed to create room. Please try again.' });
  }
});

/**
 * POST /api/rooms/join
 * Join an existing room using Room Code. Requires session authentication (checkAuth).
 * Body: { code }
 */
app.post('/api/rooms/join', checkAuth, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.trim().length !== 6) {
      return res.status(400).json({ error: 'Please enter a valid 6-character room code.' });
    }

    const roomCode = code.trim().toUpperCase();

    // Find the room
    const room = await Room.findOne({ code: roomCode });
    if (!room) {
      return res.status(404).json({ error: 'Invalid Room Code' });
    }

    // Check if user is already a member
    if (room.roommates.includes(req.session.userId)) {
      return res.json({
        success: true,
        message: 'You are already a member of this room.',
        room
      });
    }

    // Check if user is already in some other room
    const otherRoom = await Room.findOne({ roommates: req.session.userId });
    if (otherRoom) {
      return res.status(400).json({ error: 'You are already a member of another room. Leave it first.' });
    }

    // Check if the room is full
    if (room.roommates.length >= room.max_roommates) {
      return res.status(400).json({ error: 'Room is full' });
    }

    // Add user to the roommates list
    room.roommates.push(req.session.userId);
    await room.save();

    return res.json({
      success: true,
      message: 'Joined room successfully!',
      room
    });

  } catch (err) {
    console.error('Join room error:', err);
    return res.status(500).json({ error: 'Failed to join room. Please try again.' });
  }
});

/**
 * GET /api/rooms/current
 * Retrieve the current room details for the logged-in user. Requires session authentication.
 */
app.get('/api/rooms/current', checkAuth, async (req, res) => {
  try {
    const room = await Room.findOne({ roommates: req.session.userId });
    if (!room) {
      return res.json({ success: true, room: null });
    }
    return res.json({ success: true, room });
  } catch (err) {
    console.error('Get current room error:', err);
    return res.status(500).json({ error: 'Failed to retrieve current room details.' });
  }
});

/**
 * POST /api/rooms/leave
 * Leave the current room. Requires session authentication.
 */
app.post('/api/rooms/leave', checkAuth, async (req, res) => {
  try {
    const room = await Room.findOne({ roommates: req.session.userId });
    if (!room) {
      return res.status(400).json({ error: 'You are not currently in any room.' });
    }

    // Remove user from roommates list
    room.roommates.pull(req.session.userId);
    await room.save();

    return res.json({ success: true, message: 'Left the room successfully.' });

  } catch (err) {
    console.error('Leave room error:', err);
    return res.status(500).json({ error: 'Failed to leave the room.' });
  }
});

/* ============================================================
   Static File Fallback
   Serve the correct HTML file for known pages,
   and index.html for everything else.
   ============================================================ */
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'dashboard.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

/* ============================================================
   Start Server
   ============================================================ */
app.listen(PORT, () => {
  console.log(`\n✅  Nestrox server running at http://localhost:${PORT}`);
  console.log(`    Open this URL in your browser to use the app.\n`);
});
