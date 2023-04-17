const express = require("express");
const router = express.Router();

const {
  register,
  login,
  createClass,
  getSessions,
  getSchedule,
  getStudentEvent,
  getClasses,
  getInstructors,
  bookClass,
  signUpEvent,
  createEvent,
  getEvents,
  updateEvent,
  getEventInfo,
  deleteEvent,
  updatePackage,
  getPackage,
  deletePackage,
  createChat,
  userChats,
  findChat
} = require("../controllers/controllers");

router.post("/user/create", register);

router.post("/user/login", login);

router.post("/classes/create", createClass);

router.get("/sessions/get", getSessions);

router.put("/schedule/get", getSchedule);

router.get("/event/student/:id", getStudentEvent);

router.put("/classes/get", getClasses);

router.put("/instructors/get", getInstructors);

router.post("/class/book", bookClass);

router.post("/event/signup", signUpEvent);

router.post("/event/create", createEvent);

router.get("/events/get", getEvents);

router.patch("/events/:id", updateEvent);

router.get("/event/:id", getEventInfo);

router.delete("/event/:id", deleteEvent);

router.post("/packages/update", updatePackage);

router.delete("/packages/:id", deletePackage);

router.put("/packages/:id", getPackage);

// router.post("/chat", createChat)

// router.get("/:userId", userChats)

// router.get("/:firstId/:secondId", findChat)

module.exports = router;
