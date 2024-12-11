const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('Token received:', token); // Debugging

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  if (!process.env.JWT_SECRET_KEY) {
    console.error('JWT_SECRET_KEY is not set');
    return res.status(500).json({ message: 'Internal Server Error' });
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

module.exports = jwtMiddleware;