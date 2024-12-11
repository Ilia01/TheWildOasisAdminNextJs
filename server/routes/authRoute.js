const express = require('express');
const { body } = require('express-validator');
const { login, signup, logout, refreshToken } = require('../controllers/authController');
const { loginLimiter, signupLimiter } = require('../utils/rateLimiter');

const authRouter = express.Router();

authRouter.post('/login', loginLimiter, 
  body('email').isEmail().withMessage('Enter a valid email address'),
  // body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  // login
  login
);

authRouter.post('/signup', signupLimiter, 
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  signup
);

authRouter.post('/refresh-token', refreshToken);

authRouter.post('/logout', logout);

module.exports = authRouter;
