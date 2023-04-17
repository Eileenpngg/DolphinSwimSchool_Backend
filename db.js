const Pool = require('pg').Pool

const pool= new Pool({
    user:'eileenpng',
    password: 'E81271843g!',
    host:'localhost',
    port:'5432',
    database:'swim_app',
});

pool.connect((err) => {
    if (err) {
      console.error("connection error", err.stack);
    } else {
      console.log(
        `PostgreSQL Database swim_app connected on Port 5001`
      );
    }
  });

module.exports = pool;