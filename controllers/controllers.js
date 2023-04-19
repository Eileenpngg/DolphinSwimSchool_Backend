const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../jwt/jwtgenerator");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

// ================================================================================================= REGISTER =====================================================================================================

const register = async (req, res) => {
  try {
    const { name, age, level, contact, is_instructor, email, password } =
      req.body;
    console.log(req.body);
    const user = await pool.query(
      `SELECT * from users WHERE email = '${email}'`
    );

    //Checks if user exist
    if (user.rows.length != 0) {
      return res.status(401).send("User already exist");
    }
    console.log(user);
    const saltRound = 12;
    const bcryptedPassword = await bcrypt.hash(password, saltRound);

    const newUser = await pool.query(
      `INSERT INTO users(email, password) VALUES ('${email}', '${bcryptedPassword} RETURNING *');`
    );
    console.log(newUser.rows);

    const user_id = await pool.query(
      `SELECT id FROM users WHERE email= '${email}';`
    );

    const id = user_id.rows[0].id;
    console.log(id);

    const newProfile = await pool.query(
      `INSERT INTO profiles(id, name, age, level, contact, is_instructor ) VALUES (${id}, '${name}', ${age}, '${level}', ${contact}, '${is_instructor}');`
    );
    res.status(200).json({ status: "ok", message: "profile is created" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json(err);
  }
};
// ===============================================================================================================================================================================================================
// ================================================================================================= LOGIN =====================================================================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query(
      `SELECT * from users WHERE email = '${email}'`
    );

    const response = {};
    //Checks if user exist
    if (user?.rows?.length === 0) {
      return res.status(401).json("Password or Email is Incorrect");
    }

    if (user?.rows?.length != 0) {
      const validPassword = await bcrypt.compare(
        password,
        user.rows[0].password
      );

      console.log(password);
      console.log(user.rows[0].password);

      const userDetails = await pool.query(
        `SELECT * from profiles WHERE id = ${user.rows[0].id}`
      );
      const email = await pool.query(
        `SELECT * from users WHERE id = ${user.rows[0].id}`
      );
      response.id = userDetails.rows[0].id;
      response.name = userDetails.rows[0].name;
      response.email = email.rows[0].email;
      response.level = userDetails.rows[0].level;
      response.contact = userDetails.rows[0].contact;
      response.age = userDetails.rows[0].age;
      response.is_instructor = userDetails.rows[0].is_instructor;

      req.session.user = {
        username: response.name,
        id: response.id,
      };
      if (!validPassword) {
        return res.status(401).json("Password or Email is incorrect");
      }

      const payload = {
        id: user.id,
        email: user.email,
      };

      const access = jwt.sign(payload, process.env.ACCESS_SECRET, {
        expiresIn: "20m",
        jwtid: uuidv4(),
      });

      const refresh = jwt.sign(payload, process.env.REFRESH_SECRET, {
        expiresIn: "30d",
        jwtid: uuidv4(),
      });

      console.log(req.session);
      res.status.json({ status: "ok", message: "login ok" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Login Failed");
  }
};
// ===============================================================================================================================================================================================================

// ================================================================================================= INSTRUCTORS =====================================================================================================

//Creates classes
const createClass = async (req, res) => {
  try {
    const { name, level, date, time } = req.body;
    console.log(date);

    const class_session_id = await pool.query(
      `SELECT id FROM class_session WHERE date= '${date}' AND session_id= ${time};`
    );
    console.log(class_session_id.rows);

    if (class_session_id?.rows?.length === 0) {
      const newClassSess = await pool.query(
        `INSERT INTO class_session (date, session_id)VALUES('${date}', ${time});`
      );
      const newClassSessid = await pool.query(
        `SELECT id FROM class_session WHERE date= '${date}' AND session_id= ${time};`
      );
      console.log(newClassSessid.rows[0].id);
      const newClass = await pool.query(
        `INSERT INTO classes(class_session_id, instructor_name, level) VALUES(${newClassSessid.rows[0].id}, '${name}', '${level}');`
      );
    }
    if (class_session_id?.rows?.length !== 0) {
      const newClass = await pool.query(
        `INSERT INTO classes(class_session_id, instructor_name, level) VALUES(${class_session_id.rows[0].id}, '${name}', '${level}');`
      );
    }
    res.json({ status: "ok", message: "class is created" });
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};

//gets all sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await pool.query("SELECT * from sessions");
    res.json(sessions.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};

//gets schedule
const getSchedule = async (req, res) => {
  try {
    const { date, session_id, instructor_name } = req.body;
    console.log(date);
    console.log(instructor_name);
    console.log(session_id);

    const classes = await pool.query(
      `SELECT * FROM class_session 
          JOIN classes ON classes.class_session_id= class_session.id 
          JOIN class_user ON class_user.class_id= classes.id 
          JOIN profiles on class_user.user_id= profiles.id 
          WHERE date= '${date}' AND session_id=${session_id} AND instructor_name='${instructor_name}';`
    );

    console.log(classes.rows);

    res.json(classes.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};

//gets students that applied for an event
const getStudentEvent = async (req, res) => {
  try {
    console.log(req.params.id);
    const students = await pool.query(
      `SELECT name from event_user JOIN events on events.id = event_user.event_id JOIN profiles on event_user.user_id = profiles.id WHERE events.id= ${req.params.id}`
    );
    console.log(students.rows);

    res.json(students.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};
// ===============================================================================================================================================================================================================

// ================================================================================================= STUDENTS =====================================================================================================

// get classes available with student level
const getClasses = async (req, res) => {
  try {
    const { level, date } = req.body;
    const classDetails = await pool.query(`SELECT * FROM classes
          JOIN class_session 
          ON class_session.id = classes.class_session_id 
              JOIN sessions ON sessions.id=class_session.session_id
              WHERE level = '${level}' AND date = '${date}';`);
    res.json(classDetails.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};

//get instructors
const getInstructors = async (req, res) => {
  try {
    const { level, date, time } = req.body;
    console.log(level);
    const classDetails = await pool.query(`SELECT * FROM classes
            JOIN class_session 
            ON class_session.id = classes.class_session_id 
                JOIN sessions ON sessions.id=class_session.session_id
                WHERE level = '${level}' AND date = '${date}' AND session_id=${time};`);
    res.json(classDetails.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};

// book class
const bookClass = async (req, res) => {
  try {
    const { user_id, level, date, time } = req.body;
    const class_id =
      await pool.query(`SELECT classes.id FROM classes JOIN class_session 
        ON class_session.id = classes.class_session_id 
            LEFT OUTER JOIN sessions ON sessions.id=class_session.session_id
            WHERE level = '${level}' AND date = '${date}' AND session_id=${time};`);

    const classDetails = await pool.query(
      `INSERT into class_user(class_id, user_id) VALUES(${class_id.rows[0].id}, ${user_id})`
    );
    res.json(classDetails);
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};

//Sign up for events
const signUpEvent = async (req, res) => {
  try {
    const { user_id, event_id } = req.body;
    const eventDetails = await pool.query(
      `INSERT into event_user(user_id, event_id) VALUES(${user_id}, ${event_id})`
    );
    res.json(eventDetails);
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};

// ====================================================================================================================================================================================================================

// ================================================================================================= EVENTS =====================================================================================================
// create an event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      image,
      description,
      start_date,
      end_date,
      start_time,
      end_time,
    } = req.body;
    console.log(req.body);
    const newEvent = await pool.query(
      `INSERT INTO events(title, image, description, start_date, end_date, start_time, end_time) VALUES ('${title}','${image}', '${description}', '${start_date}', '${end_date}', '${start_time}', '${end_time}');`
    );
    res.json({ status: "ok", message: "event is created" });
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await pool.query(
      "SELECT id, image, start_date::varchar, end_date::varchar, start_time, end_time, description, title from events"
    );
    res.json(events.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};

//update a event
const updateEvent = async (req, res) => {
  try {
    const {
      title,
      image,
      description,
      start_date,
      end_date,
      start_time,
      end_time,
    } = req.body;
    const updatedEvent = await pool.query(
      `UPDATE events SET title='${title}', image= '${image}', description= '${description}', start_date='${start_date}', end_date='${end_date}', start_time= '${start_time}', end_time='${end_time}' WHERE id= ${req.params.id};`
    );
    res.json({ status: "ok", message: "event is updated" });
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};

//gets an event info
const getEventInfo = async (req, res) => {
  try {
    const eventDetail = await pool.query(
      `SELECT * FROM events WHERE id= ${req.params.id};`
    );
    res.json(eventDetail.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};

//delete an event
const deleteEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const deleteEventUser = await pool.query(
      `DELETE from event_user WHERE event_id= ${id}`
    );
    const deleteEvent = await pool.query(`DELETE from events WHERE id= ${id}`);

    res.json({ status: "ok", message: "event deleted" });
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};

// ====================================================================================================================================================================================================================

// ================================================================================================= PACKAGES =====================================================================================================
//updates package based on amount purchased
const updatePackage = async (req, res) => {
  try {
    const { id, amount } = req.body;
    const remaining = await pool.query(`SELECT * from packages WHERE id=${id}`);
    if (remaining.rows.length == 0) {
      const newPackage = await pool.query(
        `INSERT into packages (id, remaining) VALUES (${id}, ${amount})`
      );
      res.json({ status: "ok", message: "new user inserted into package" });
    } else if (remaining.rows[0].remaining >= 50) {
      res.status(500).json({ status: "error", message: "unsuccessful" });
    }

    const newRemaining = remaining.rows[0].remaining + parseInt(amount);
    const addNewRemaining = await pool.query(
      `UPDATE packages SET remaining = ${newRemaining} WHERE id = ${id}`
    );
    res.status(200).json({ status: "ok", message: "updated package" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const deletePackage = async (req, res) => {
  try {
    const id = req.params.id;
    const remaining = await pool.query(`SELECT * from packages WHERE id=${id}`);

    if (remaining.rows.length == 0 || remaining.rows[0].remaining === 0) {
      return res.status(401).send("No more packages");
    }
    const newRemaining = remaining.rows[0].remaining - 1;
    const addNewRemaining = await pool.query(
      `UPDATE packages SET remaining = ${newRemaining} WHERE id = ${id}`
    );
    res.json({ status: "ok", message: "updated package" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getPackage = async (req, res) => {
  try {
    const id = req.params.id;
    const remaining = await pool.query(
      `SELECT * from packages WHERE id= ${id}`
    );

    res.json(remaining.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500);
  }
};
// ====================================================================================================================================================================================================================

// ================================================================================================= CHAT =====================================================================================================
// const createChat = async (req, res) => {
//   const members = [req.body.senderId, req.body.receiverId];
//   try {
//     const result = await res.statu(200).json(result);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };

// const userChats = async (req, res) => {
//   try {
//     const chat = await res.statu(200).json(result);
//     //check if the id is one of the members in the chat
//     if(){

//     }
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };

// const findChat = async (req, res) => {};

module.exports = {
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
  deletePackage,
  getPackage,
};
