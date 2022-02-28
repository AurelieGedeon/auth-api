const { connectDb } = require("./dbConnect");

exports.createUser = (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    res.status(400).send("invalid request");
  }
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    isAdmin: false,
    userRate: 5,
  };

  const db = connectDb();
  db.collection("user")
    .add(newUser)
    .then((doc) => {
      //TODO: create a JWT and end back to token
      res.status(201).send("Account created");
    })
    .catch((err) => res.status(500).send(err));
};
