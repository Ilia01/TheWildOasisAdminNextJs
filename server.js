const express = require('express');
const next = require('next');
require('dotenv').config();
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

  // Middleware-parsing json
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  const jwtMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.user = decoded; // attach user data to the request
      next();
    });
  };

  // API routes
  server.post('/api/login', 
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

        const isPasswordValid = bcrypt.compareSync(password, user.password);
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

  server.get('/api/secure-data', jwtMiddleware, async (req, res) => {
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

  // catch-all handler for next.js pages
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('listening on port 3000');
  });
});