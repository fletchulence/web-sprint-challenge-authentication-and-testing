const User = require('../users/users-model')


// const checkUsernameExists = async (req, res, next) => {
//    /*
//      If the username in req.body does NOT exist in the database
//      status 401
//      {
//        "message": "Invalid credentials"
//      }
//    */
//   const { username, password } = req.body
//   try{
//    if( !username || !password ){
//       return next({ status: 400, message: 'username and password required'})
//    }
//     const dbUsername = await User.findBy({ username })
//    if( !dbUsername ){
//      return next({ status: 401, message: 'Invalid credentials'})
//    } else{
//      req.user = dbUsername
//      next()
//    }
//   } catch(err){
//    next(err)
//   }
// };

const checkUnusedUsername = async (req, res, next)=>{
   const { username, password } = req.body
    if( !username || !password ){
       return next({ status: 400, message: 'username and password required'})
    }
    const dbUser = await User.findBy({ username })
   try{
      if ( dbUser ){
         return next({ status: 401, message: 'username taken'})
      }
      // req.user = req.body
      next()
   } catch(err){
      next(err)
   }
}

 


 module.exports = {
   // checkUsernameExists,
   checkUnusedUsername
 }