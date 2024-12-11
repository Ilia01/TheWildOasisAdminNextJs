const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { server } = require('../server');

const prisma = new PrismaClient();

describe('Authentication Tests', () => {
  let testUser;

  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash('Test123@pass', 10);
    testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      },
    });
  });

  afterAll(async () => {
    // Cleanup test user
    await prisma.user.delete({
      where: { email: 'test@example.com' },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(server)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'Test123@pass',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.message).toBe('Login successful');

      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET_KEY);
      expect(decoded.email).toBe('test@example.com');
    });

    it('should fail with invalid password', async () => {
      const response = await request(server)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid password');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(server)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123@pass',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid username or password');
    });

    it('should validate email format', async () => {
      const response = await request(server)
        .post('/api/login')
        .send({
          email: 'invalid-email',
          password: 'Test123@pass',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('Enter a valid email address');
    });

    it('should validate password requirements', async () => {
      const response = await request(server)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('Password must be at least 8 characters long');
    });
  });

  describe('Protected Routes', () => {
    let validToken;

    beforeAll(() => {
      validToken = jwt.sign(
        { email: testUser.email, id: testUser.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );
    });

    it('should access protected route with valid token', async () => {
      const response = await request(server)
        .get('/api/secure-data')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
    });

    it('should reject request without token', async () => {
      const response = await request(server)
        .get('/api/secure-data');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Authorization token required');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(server)
        .get('/api/secure-data')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Invalid or expired token');
    });
  });

  describe('Password Change', () => {
    let validToken;

    beforeAll(() => {
      validToken = jwt.sign(
        { email: testUser.email, id: testUser.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );
    });

    it('should change password with valid credentials', async () => {
      const response = await request(server)
        .post('/api/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          currentPassword: 'Test123@pass',
          newPassword: 'NewTest123@pass',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password updated successfully');
    });

    it('should reject weak new password', async () => {
      const response = await request(server)
        .post('/api/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          currentPassword: 'Test123@pass',
          newPassword: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe('Password must be at least 8 characters long');
    });
  });
});
