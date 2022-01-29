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
    it('[2] responds with "username taken" if someone tries to register a username which already exists', async () => {
      await request(server).post('/api/auth/register').send({ username: 'bob', password: '1234' });
      const res = await request(server).post('/api/auth/register').send({ username: 'bob', password: 'aaa' });
      expect(res.body).toMatchObject({ message: /username taken/i });
    });
    it('[3] encrypts the passwords instead of plain text', async () => {
      const user = await db('users').where('username', 'bob').first();
      expect(bcrypt.compareSync('1234', user.password)).not.toEqual('1234');
    }, 750);
  });
  describe('LOGIN -- [POST] /api/auth/login', () => {
    it('[4] responds with the correct message on valid credentials', async () => {
      let res = await request(server).post('/api/auth/register').send({ username: 'gary', password: '1234' });
      res = await request(server).post('/api/auth/login').send({ username: 'gary', password: '1234' });
      expect(res.body.message).toMatch(/welcome gary/i);
    }, 750);
    it('[5] responds with "invalid credentials" if the user is not registered in the db', async () => {
      let res = await request(server).post('/api/auth/login').send({ username: 'gary', password: '1234' });
      expect(res.body).toMatchObject({ message: /invalid credentials/i });
    });
    it('[6] responds with a token with the correct properties', async () => {
      let res = await request(server).post('/api/auth/login').send({ username: 'bob', password: '1234' });
      let decode = jwtDecode(res.body.token);
      expect(decode).toHaveProperty('exp' && 'iat');
      expect(decode).toMatchObject({
        subject: 1,
        username: 'bob'
      });
    });
  });
  describe('[GET] api/jokes', () => {
    it('[7] jokes appear after login if valid token', async () => {
      let res = await request(server).post('/api/auth/login').send({ username: 'bob', password: '1234' });
      res = await request(server).get('/api/jokes').set('Authorization', res.body.token);
      expect(res.body).toHaveLength(3);
    });
    it('[8] "token required" appears if there is no token on login', async () => {
      let res = await request(server).get('/api/jokes');
      expect(res.body).toMatchObject({ message: /token required/i });
    });
  });
});