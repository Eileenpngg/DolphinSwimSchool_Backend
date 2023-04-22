const express = require("express");
const app = express();
const cors = require("cors");
const swimApp = require("./routers/router");
const session = require("express-session");
require("dotenv").config();

//middleware
app.use(cors({ origin: "dolphin-swim-school-frontend.vercel.app" }));
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    credentials: true,
    name: "sid",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/api", swimApp);

app.listen(5001, () => {
  console.log("swim app is running!!");
});
