const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const userModel = require('./models/user.model');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('./config/passport');

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Exit the process - the app should not run without a working DB connection
    process.exit(1);
  }
};

app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await connectDB();
});

app.set('trust proxy', 1); // trust first proxy
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      collectionName: 'sessions',
    }),
    // cookie: { secure: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Base route
app.get('/', (req, res) => {
  res.render('index');
});

// Render register/login/profile pages (POST handlers live in routes/auth.js)
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
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

    res.redirect('/login');
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const checkLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

app.get('/login', (req, res) => {
  res.render('login');
});

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required' });
//   }
//   try {
//     const user = await userModel.findOne({ email });
//     if (!user) return res.status(401).json({ message: 'Invalid Credentials' });
//     const match = await bcrypt.compare(password, user.password);
//     if (match) {
//       const safeUser = { _id: user._id, email: user.email };
//       return res
//         .status(200)
//         .json({ message: 'Logged in Successfully', user: safeUser });
//     } else {
//       return res.status(401).json({ message: 'Invalid Credentials' });
//     }
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/',
  }),
  function (req, res) {
    res.redirect('/');
  }
);

//Profile route
app.get('/profile', checkLoggedIn, (req, res) => {
  res.render('profile', { user: req.user });
});

app.get('/logout', (req, res) => {
  try {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = app;
