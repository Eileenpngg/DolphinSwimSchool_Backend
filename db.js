require("dotenv").config();
const Pool = require("pg").Pool;

const pool = new Pool({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.PORT,
  database: process.env.DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err) => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log(`PostgreSQL Database swim_app connected on Port 5001`);
  }
});

module.exports = pool;
