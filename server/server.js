const express = require('express');
const cookieParser = require('cookie-parser')
const next = require('next');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./routes/authRoute');
const userRouter = require('./routes/userRoute');

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(cors({ origin: 'http://localhost:3000', credentials: true }));
  server.use(express.json());
  server.use(cookieParser());
  // Routes
  server.use('/api/auth', authRouter);
  server.use('/api/user', userRouter);

  // Fallback for Next.js pages
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(5000, (err) => {
    if (err) throw err;
    console.log('Server running on http://localhost:5000');
  });
});
