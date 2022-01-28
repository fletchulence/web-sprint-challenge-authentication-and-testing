const db = require('../../data/dbConfig');

// not exactly necessary for this project, but it's good to have a look at for my own purposes
function getAll() {
   return db('users');
}

// this will get the user for appropriate login ?
function getById(id) {
   return db('users')
      .where({ id })
      .first();
}
// honestly i think a filter would be more useful so lets build it
function findBy(filter) {
   return db('users')
      .select('id', 'username')
      .where(filter)
      .first();
}

async function insert(user) {
   const [id] = await db('users').insert(user);

   return getById(id);
}

module.exports = {
   getAll,
   getById,
   insert,
   findBy
};