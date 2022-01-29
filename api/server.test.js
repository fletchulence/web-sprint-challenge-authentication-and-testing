// test imports for knex
const User = require('./users/users-model');
const db = require('./../data/dbConfig');
// imports for the rest
const server = require('./server');
const bcrypt = require('bcryptjs');
// const jwtDecode = require('jwt-decode');
const request = require('supertest');



/// Write your tests here ///
test('sanity', () => {
  expect(true).toBe(true);
});

// // before all is used to put schema of db in order
beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

// // afterALL is used to exit all things cleanly and destroy what it did before
afterAll(async () => {
  await db.destroy();
});

test('NODE_ENV is correct', () => {
  expect(process.env.NODE_ENV).toBe('testing');
});

describe('server.js', () => {
  describe('[POST] /api/auth/register', () => {
    let user = { username: 'billy', password: 1234 };
    let result;
    beforeEach(async () => {
      [result] = await User.getAll();
    });
    test('should add a user to the db with a hashed password', async () => {
      await User.insert({...user, password: bcrypt.hashSync(user.password, BCRYPT_ROUNDS)});
      expect(result).toMatchObject({ id: 1, username: "billy" });
      expect(result.password).not.toMatchObject({ id: 1, password: 1234 });
    });
    test('added user should have password hashed', () => {
      // expect(result.password).toBeDefined();
      // expect(user.password).not.toBe(1234);
      expect(result).toMatchObject({ password: '1234' });
    });

  });
});