require("dotenv").config();
const { Client, Pool } = require("pg");
const connectionString = process.env.CONNECTION_STRING;

const client = new Client(
  `${connectionString}?sslmode=true`,
);
const pool = new Pool({
  connectionString,
});

client.connect((err) => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log(`PostgreSQL Database swim_app connected on Port 5001`);
  }
});

module.exports = pool;
