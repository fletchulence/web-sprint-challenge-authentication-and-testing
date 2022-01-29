// test imports for knex
const User = require('./users/users-model');
const db = require('./../data/dbConfig');
// imports for the rest
const server = require('./server');
const bcrypt = require('bcryptjs');
const jwtDecode = require('jwt-decode');
const request = require('supertest');
const { BCRYPT_ROUNDS } = require('./secrets');



/// Write your tests here ///
test('sanity', () => {
  expect(true).toBe(true);
});

// // before all is used to put schema of db in order
beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

// afterALL is used to exit all things cleanly and destroy what it did before
afterAll(async () => {
  await db.destroy();
});

test('NODE_ENV is correct', () => {
  expect(process.env.NODE_ENV).toBe('testing');
});

describe('server.js', () => {
  describe('REGISTER -- [POST] /api/auth/register', () => {
    it('[1] responds with the user that is being connected on register', async () => {
      await request(server).post('/api/auth/register').send({ username: 'bob', password: '1234' });
      const [users] = await db('users');
      expect(users.username).toEqual('bob');
    });
    
  });
});