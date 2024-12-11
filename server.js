const express = require('express');
const next = require('next');
require('dotenv').config();
const cors = require('cors');
const { body, validationResult } = require('express-validator'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: 'Too many login attempts, please try again later' }
});

// Rate limiter for signup
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 accounts per hour
  message: { message: 'Too many accounts created, please try again later' }
});

app.prepare().then(() => {
  const server = express();

  // Add CORS middleware
  server.use(cors({
    origin: 'http://localhost:3000', // or the actual frontend origin
    credentials: true, // Include credentials if needed
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  prisma.$connect().then(() => {
    console.log('Connected to the database');
  }).catch((err) => {
    console.error('Failed to connect to the database:', err.message);
    process.exit(1);
  });

  const jwtMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log('Token received:', token); // Debugging
  
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    if (!process.env.JWT_SECRET_KEY) {
      console.error('JWT_SECRET_KEY is not set in the environment variables');
      process.exit(1);
    }
    
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err.message); // Debugging
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      console.log('Decoded token:', decoded); // Debugging
      req.user = decoded; // attach user data to the request
      next();
    });
  };
  

  // Create API router
  const apiRouter = express.Router();

  // Move all API routes to the router
  apiRouter.post('/login', 
    loginLimiter,
    // Validation middleware
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      try {
        const user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        if (!user) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  apiRouter.post('/signup',
    signupLimiter,
    // Validation middleware
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { fullName, email, password } = req.body;

      try {
        const existingUser = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        if (existingUser) {
          console.log('Email already in use:', email);
          return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = await prisma.user.create({
          data: {
            name: fullName,
            email: email,
            password: hashedPassword,
          },
        });

        const token = jwt.sign({ email: newUser.email, id: newUser.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        res.json({ message: 'Signup successful', token });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  apiRouter.get('/session', jwtMiddleware, (req, res) => {
    res.json({ user: req.user });
  });

  apiRouter.get('/secure-data', jwtMiddleware, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email: req.user.email },
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      res.json({ message: 'Secure data', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Add logout endpoint
  apiRouter.post('/logout', jwtMiddleware, (req, res) => {
    // In a real application, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({ message: 'Logged out successfully' });
  });

  // Add password change endpoint
  apiRouter.post('/change-password', 
    jwtMiddleware,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      try {
        const user = await prisma.user.findUnique({
          where: { email: req.user.email },
        });

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
          where: { email: req.user.email },
          data: { password: hashedPassword },
        });

        res.json({ message: 'Password updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // Use API routes before Next.js handler
  server.use('/api', apiRouter);

  // Next.js handler should come last
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('listening on port 3000');
  });

  // Export the server instance for testing
  if (process.env.NODE_ENV === 'test') {
    module.exports = server;
  }
});

// Export the app for testing
module.exports = app;