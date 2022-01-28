const User = require('../users/users-model');
const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS } = require('./../secrets');
const tokenBuilder = require('./helpers');


//REGISTER
const checkUnusedUsername = async (req, res, next) => {
   let { username, password } = req.body;
   if (!username || !password) {
      return next({ status: 400, message: 'username and password required' });
   }
   const [dbUser] = await User.findBy({ username });
   try {
      if (dbUser) {
         return next({ status: 401, message: 'username taken' });
      }
      req.user = req.body;
      next();
   } catch (err) {
      next(err);
   }
};
const hashPass = async (req, res, next) => {
   let { password } = req.user;
   const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
   try {
      req.user.password = hash;
      next();
   } catch (err) {
      next(err);
   }
};



//LOGIN
const checkUsernameExists = async (req, res, next) => {
   /*
     If the username in req.body does NOT exist in the database
     status 401
     {
       "message": "Invalid credentials"
     }
   */
   const { username, password } = req.body;
   try {
      if (!username || !password) {
         return next({ status: 400, message: 'username and password required' });
      }
      const [dbUsername] = await User.findBy({ username });
      if (!dbUsername) {
         next({ status: 401, message: 'Invalid credentials' });
      } else {
         req.user = dbUsername;
         next();
      }
   } catch (err) {
      next(err);
   }
};

const checkPassword = async (req, res, next) => {
   const { password } = req.body;
   const userPass = await User.getById(req.user.id);
   try {
      if (userPass && bcrypt.compareSync(password, userPass.password)) {
         req.user.token = tokenBuilder(userPass);
         // req.user = userPass;
         next();
      } else {
         next({ status: 412, message: 'password dont match' });
      }
   } catch (err) {
      next(err);
   }
};




module.exports = {
   checkUsernameExists,
   checkUnusedUsername,
   checkPassword,
   hashPass
};