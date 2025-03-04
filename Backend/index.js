const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ml_default', // Use your cloud name
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Setup for File Uploads (Memory Storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png) are allowed'));
    }
  },
});

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Linktree', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

// User Schema
const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// Link Schema
const linkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['link', 'shop'], required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  clicks: { type: Number, default: 0 },
  clickHistory: [{
    visitorId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    platform: { type: String },
    app: { type: String },
  }],
});

const Link = mongoose.model('Link', linkSchema);

// Username Schema
const usernameSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Username = mongoose.model('Username', usernameSchema);

// Profile Schema
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, default: '' }, // Stores Cloudinary URL
  bio: { type: String, default: 'Bio' },
  backgroundColor: { type: String, default: '#000000' },
  theme: { type: String, default: 'air-snow' },
  buttonStyle: { type: String, default: 'fill' },
  buttonColor: { type: String, default: '#000000' },
  buttonFontColor: { type: String, default: '#FFFFFF' },
  layout: { type: String, default: 'list' },
  font: { type: String, default: 'DM Sans' },
});

const Profile = mongoose.model('Profile', profileSchema);

// Middleware to Authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.userId = decoded.userId;
    next();
  });
};

// Routes
app.get('/',(req,res)=>{
  res.send("hello world");
});
// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { firstname, lastname, email, password, confirmPassword } = req.body;
    if (!firstname || !lastname || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({ firstname, lastname, email, password });
    await user.save();

    const profile = new Profile({ userId: user._id });
    await profile.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

// Verify Token
app.get('/verify-token', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user, message: 'Token is valid' });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout (Client-side only)
app.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Get User Basic Info
app.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('firstname lastname email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update User Profile
app.put('/update-profile', authenticateToken, async (req, res) => {
  try {
    const { firstname, lastname, email, password, confirmPassword } = req.body;
    const userId = req.userId;
    if (!firstname || !lastname || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }
    if (password && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const updateData = { firstname, lastname, email };
    if (password) updateData.password = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(userId, updateData);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Links
app.get('/links', authenticateToken, async (req, res) => {
  try {
    const links = await Link.find({ userId: req.userId });
    res.json(links);
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a New Link
app.post('/links', authenticateToken, async (req, res) => {
  try {
    const { type, title, url, isActive } = req.body;
    if (!type || !title || !url) {
      return res.status(400).json({ message: 'Type, title, and URL are required' });
    }
    const link = new Link({ userId: req.userId, type, title, url, isActive: isActive || false, clicks: 0 });
    await link.save();
    res.status(201).json(link);
  } catch (error) {
    console.error('Add link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a Link
app.put('/links/:id', authenticateToken, async (req, res) => {
  try {
    const { title, url } = req.body;
    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }
    const link = await Link.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, url },
      { new: true }
    );
    if (!link) return res.status(404).json({ message: 'Link not found or not authorized' });
    res.json(link);
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a Link
app.delete('/links/:id', authenticateToken, async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!link) return res.status(404).json({ message: 'Link not found or not authorized' });
    res.json({ message: 'Link deleted' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Increment Link Click
app.post('/links/:id/click', async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });
    const visitorId = req.headers['x-visitor-id'] || req.cookies?.visitorId || 'anonymous';
    const userAgent = req.headers['user-agent'] || '';
    let platform = 'Others';
    if (userAgent.includes('Win')) platform = 'Windows';
    else if (userAgent.includes('Mac')) platform = 'Mac';
    else if (userAgent.includes('Linux')) platform = 'Linux';
    else if (userAgent.includes('Android')) platform = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'iOS';
    const app = req.body.app || 'Other';
    const hasClicked = link.clickHistory.some(click => click.visitorId === visitorId && click.platform === platform);
    if (!hasClicked) {
      link.clicks += 1;
      link.clickHistory.push({ visitorId, date: new Date(), platform, app });
      await link.save();
    }
    res.json(link);
  } catch (error) {
    console.error('Link click error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Analytics Data
app.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const links = await Link.find({ userId: req.userId });
    const ctaClicks = await CTAClick.find({ userId: req.userId });
    const linkClicks = links.filter(link => link.type === 'link').reduce((acc, link) => acc + link.clicks, 0);
    const shopClicks = links.filter(link => link.type === 'shop').reduce((acc, link) => acc + link.clicks, 0);
    const ctaClicksCount = ctaClicks.length;
    const trafficByDevice = links.reduce((acc, link) => {
      link.clickHistory.forEach(click => {
        acc[click.platform] = (acc[click.platform] || 0) + 1;
      });
      return acc;
    }, { Linux: 0, Mac: 0, iOS: 0, Windows: 0, Android: 0, Others: 0 });
    const sites = links.reduce((acc, link) => {
      link.clickHistory.forEach(() => {
        const siteName = link.title;
        acc[siteName] = (acc[siteName] || 0) + 1;
      });
      return acc;
    }, {});
    const clicksByLink = links.map(link => ({ title: link.title, clicks: link.clicks }));
    const linkClicksOverTime = links.filter(link => link.type === 'link').reduce((acc, link) => {
      link.clickHistory.forEach(click => {
        const month = click.date.toLocaleString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
      });
      return acc;
    }, {});
    const shopClicksOverTime = links.filter(link => link.type === 'shop').reduce((acc, link) => {
      link.clickHistory.forEach(click => {
        const month = click.date.toLocaleString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
      });
      return acc;
    }, {});
    const ctaClicksOverTime = ctaClicks.reduce((acc, click) => {
      const month = click.date.toLocaleString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    const { startDate, endDate } = req.query;
    let filteredSites = { ...sites };
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredSites = links.reduce((acc, link) => {
        link.clickHistory.forEach(click => {
          if (click.date >= start && click.date <= end) {
            const siteName = link.title;
            acc[siteName] = (acc[siteName] || 0) + 1;
          }
        });
        return acc;
      }, {});
    }
    const analyticsData = {
      linkClicks,
      shopClicks,
      ctaClicks: ctaClicksCount,
      trafficByDevice,
      sites,
      clicksByLink,
      clicksOverTime: linkClicksOverTime,
      filteredSites,
      linkClicksOverTime,
      shopClicksOverTime,
      ctaClicksOverTime,
    };
    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save Username and Category
app.post('/api/save-user', authenticateToken, async (req, res) => {
  const { username, category } = req.body;
  if (!username || !category) {
    return res.status(400).json({ message: 'Username and category are required' });
  }
  try {
    const existingUsername = await Username.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already exists' });
    const newUser = new Username({ username, category, userId: req.userId });
    await newUser.save();
    res.json({ message: 'User saved successfully' });
  } catch (error) {
    console.error('Save user error:', error);
    res.status(500).json({ message: 'Error saving user', error: error.message });
  }
});

// Get Profile
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.userId });
    const usernameDoc = await Username.findOne({ userId: req.userId });
    if (!profile) {
      profile = new Profile({ userId: req.userId });
      await profile.save();
    }
    res.json({
      username: usernameDoc ? usernameDoc.username : '',
      profile: {
        image: profile.image || '', // Cloudinary URL
        bio: profile.bio || 'Bio',
        backgroundColor: profile.backgroundColor,
        theme: profile.theme,
        buttonStyle: profile.buttonStyle,
        buttonColor: profile.buttonColor,
        buttonFontColor: profile.buttonFontColor,
        layout: profile.layout,
        font: profile.font,
      },
      userId: req.userId,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile
app.put('/profile', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { username, bio, backgroundColor, theme, buttonStyle, buttonColor, buttonFontColor, layout, font } = req.body;
    let imageUrl = '';

    // Handle image upload to Cloudinary
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'profile_images',
        public_id: req.userId.toString(),
        overwrite: true,
      });
      imageUrl = result.secure_url; // Full Cloudinary URL (e.g., https://res.cloudinary.com/ml_default/image/upload/...)
      console.log('Cloudinary upload result - Secure URL:', result.secure_url); // Debug log
    } else if (req.body.image === '') {
      imageUrl = ''; // Explicitly remove the image
    } else {
      const existingProfile = await Profile.findOne({ userId: req.userId });
      imageUrl = existingProfile?.image || '';
    }

    if (username) {
      const existingUsername = await Username.findOne({ username, userId: { $ne: req.userId } });
      if (existingUsername) return res.status(400).json({ message: 'Username already exists' });
      await Username.findOneAndUpdate(
        { userId: req.userId },
        { username, category: (await Username.findOne({ userId: req.userId }))?.category || 'Other' },
        { upsert: true }
      );
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { image: imageUrl, bio, backgroundColor, theme, buttonStyle, buttonColor, buttonFontColor, layout, font },
      { new: true, upsert: true }
    );

    const updatedUsername = await Username.findOne({ userId: req.userId });

    res.json({
      message: 'Profile updated',
      username: updatedUsername?.username || '',
      profile: {
        ...profile.toObject(),
        image: profile.image || '', // Ensure this returns the full Cloudinary URL
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Public Profile by userId
app.get('/profile/public/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const usernameDoc = await Username.findOne({ userId: user._id });
    const profile = await Profile.findOne({ userId: user._id });
    const links = await Link.find({ userId: user._id });

    console.log('Profile image URL:', profile?.image); // Debug log

    res.json({
      username: usernameDoc ? usernameDoc.username : '',
      image: profile?.image || '', // Should return the full Cloudinary URL (e.g., https://res.cloudinary.com/ml_default/image/upload/...)
      bio: profile?.bio || 'Bio',
      links: links || [],
      settings: {
        backgroundColor: profile?.backgroundColor || '#000000', // Added backgroundColor to settings
        theme: profile?.theme || 'air-snow',
        buttonStyle: profile?.buttonStyle || 'fill',
        buttonColor: profile?.buttonColor || '#000000',
        buttonFontColor: profile?.buttonFontColor || '#FFFFFF',
        layout: profile?.layout || 'list',
        font: profile?.font || 'DM Sans',
      },
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const ctaClickSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitorId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  platform: { type: String },
});

const CTAClick = mongoose.model('CTAClick', ctaClickSchema);

app.post('/cta/click/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const visitorId = req.headers['x-visitor-id'] || req.cookies?.visitorId || 'anonymous';
    const userAgent = req.headers['user-agent'] || '';
    let platform = 'Others';
    if (userAgent.includes('Win')) platform = 'Windows';
    else if (userAgent.includes('Mac')) platform = 'Mac';
    else if (userAgent.includes('Linux')) platform = 'Linux';
    else if (userAgent.includes('Android')) platform = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'iOS';
    const existingClick = await CTAClick.findOne({ userId, visitorId, platform });
    if (!existingClick) {
      const ctaClick = new CTAClick({ userId, visitorId, platform });
      await ctaClick.save();
    }
    res.json({ message: 'CTA click recorded' });
  } catch (error) {
    console.error('CTA click error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
