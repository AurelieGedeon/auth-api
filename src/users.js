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
    userRate: 5,
  };

  const db = connectDb();
  db.collection("user")
    .add(newUser)
    .then((doc) => {
      const user = {
        id: doc.id,
        email: newUser.email,
        isAdmin: false,
        userRole: 5,
      };
      //TODO: create a JWT and end back to token
      res.status(201).send({
        success: true,
        message: "Account created",
        token: user,
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

      res.send({
        sucess: true,
        message: "Login successful",
        token: users[0],
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
