const app = require('../app');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');

const saltRounds = 10;

// Register
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters long' });
  }
  try {
    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, saltRounds);
    const newUser = new userModel({ email: email, password: hash });
    await newUser.save();
    const safeUser = {
      _id: newUser._id,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid Credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const safeUser = { _id: user._id, email: user.email };
      return res
        .status(200)
        .json({ message: 'Logged in Successfully', user: safeUser });
    }
    return res.status(401).json({ message: 'Invalid Credentials' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});
