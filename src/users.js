const jwt = require("jsonwebtoken");
const { connectDb } = require("./dbConnect");

exports.createUser = (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    res.status(400).send({
      success: false,
      message: "Invalid request",
    });
    return;
  }
  const newUser = {
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    isAdmin: false,
    userRole: 5,
  };

  const db = connectDb();
  db.collection("users")
    .add(newUser)
    .then((doc) => {
      const user = {
        id: doc.id,
        email: newUser.email,
        isAdmin: false,
        userRole: 5,
      };

      const token = jwt.sign(user, "doNotShareYourSecret");
      res.status(201).send({
        success: true,
        message: "Account created",
        token,
      });
    })
    .catch((err) =>
      res.status(500).send({
        success: false,
        message: err.message,
        error: err,
      })
    );
};

exports.loginUser = (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    res.status(400).send({
      success: false,
      message: "Invalid request",
    });
    return;
  }

  const db = connectDb();
  db.collection("users")
    .where("email", "==", req.body.email.toLowerCase())
    .where("password", "==", req.body.password)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.status(401).send({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }
      const users = snapshot.docs.map((doc) => {
        let user = doc.data();
        user.id = doc.id;
        user.password = undefined;
        return user;
      });

      const token = jwt.sign(users[0], "doNotShareYourSecret");
      res.send({
        sucess: true,
        message: "Login successful",
        token,
      });
    })
    .catch((err) =>
      res.status(500).send({
        success: false,
        message: err.message,
        error: err,
      })
    );
};

exports.getUsers = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(403).send({
      success: false,
      message: "No authorization token found",
    });
  }

  const decode = jwt.verify(req.headers.authorization, "doNotShareYourSecret");
  const db = connectDb();

  console.log(`NEW REQUEST BY ${decode.email}`);
  if (decode.userRole > 5) {
    return res.status(401).send({
      sucess: false,
      message: "Not authorized",
    });
  }

  db.collection("users")
    .get()
    .then((snapshot) => {
      const users = snapshot.docs.map((doc) => {
        let user = doc.data();
        user.id = doc.id;
        user.password = undefined;
        return user;
      });
      res.send({
        success: true,
        message: "Users returned",
        users,
      });
    })
    .catch((err) =>
      res.status(500).send({
        success: false,
        message: err.message,
        error: err,
      })
    );
};
