const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'agroculturesecretkey12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { role, username, email, password, mobile, name, address } = req.body;

    // Validation
    if (!role || !username || !email || !password || !mobile || !name || !address) {
      return res.status(400).json({ message: 'Please include all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Create user
    const activationHash = crypto.randomBytes(16).toString('hex');
    const user = await User.create({
      role,
      username,
      email,
      password,
      mobile,
      status: {
        active: true, // Auto-activate for ease of testing in redesigned app
        hash: activationHash
      },
      profile: {
        name,
        address,
        rating: 0,
        picExt: 'png',
        picStatus: 0
      }
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        role: user.role,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        profile: user.profile,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Please enter username, password, and role' });
    }

    const user = await User.findOne({ username });

    // Validate password and role
    if (user && (await user.matchPassword(password)) && user.role === role) {
      res.json({
        _id: user._id,
        role: user.role,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        profile: user.profile,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid username, password, or role classification' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        role: user.role,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        profile: user.profile
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.email = req.body.email || user.email;
      user.mobile = req.body.mobile || user.mobile;
      
      if (user.profile) {
        user.profile.name = req.body.name || user.profile.name;
        user.profile.address = req.body.address || user.profile.address;
        
        if (req.body.picExt) user.profile.picExt = req.body.picExt;
        if (req.body.picStatus !== undefined) user.profile.picStatus = req.body.picStatus;
        if (req.body.rating !== undefined && user.role === 'farmer') {
          user.profile.rating = req.body.rating;
        }
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        role: updatedUser.role,
        username: updatedUser.username,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        profile: updatedUser.profile,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile
};
