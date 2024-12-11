const express = require('express');
const { body } = require('express-validator');
const { getSession, getSecureData, changePassword } = require('../controllers/userController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

const userRouter = express.Router();

userRouter.get('/session', jwtMiddleware, getSession);
userRouter.get('/secure-data', jwtMiddleware, getSecureData);
userRouter.post('/change-password', 
  jwtMiddleware,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  changePassword
);

module.exports = userRouter;
