const express = require('express');
const next = require('next');
require('dotenv').config();
const cors = require('cors');
const { body, validationResult } = require('express-validator'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();


app.prepare().then(() => {
  const server = express();

  // Add CORS middleware
  server.use(cors({
    origin: 'http://localhost:5000', // Adjust this to your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  const jwtMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.user = decoded; // attach user data to the request
      next();
    });
  };

  // Create API router
  const apiRouter = express.Router();

  // Move all API routes to the router
  apiRouter.post('/login', 
    // Validation middleware
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
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
    // Validation middleware
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
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
});