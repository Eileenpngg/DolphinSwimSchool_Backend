const express = require("express");
const app = express();
const cors = require("cors");
const swimApp = require("./routers/router");
const session = require("express-session");
require("dotenv").config();

//middleware
app.use(cors({ origin: "https://dolphinswimschoolbackend.onrender.com" }));
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    credentials: true,
    name: "sid",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // maxAge: 1000 * 60 * 60,
      // secure: process.env.ENVIRONMENT === "production" ? "true" : "auto",
      // // httpOnly: false,
      // // domain: "http://localhost:3000",
      // sameSite: "none",
      // // secure: "false",
    },
  })
);

app.use("/api", swimApp);

app.listen(5001, () => {
  console.log("swim app is running!!");
});
