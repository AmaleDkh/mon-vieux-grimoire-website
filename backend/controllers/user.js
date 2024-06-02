const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("./../models/User");
const tokenSecretKey = process.env.TOKEN_SECRET_KEY;

// Sign up
// POST /api/auth/signup
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "User created" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Log in
// POST /api/auth/login
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user === null) {
        throw new Error("Incorrect login/password pair");
      }

      return bcrypt.compare(req.body.password, user.password).then((valid) => {
        if (!valid) {
          throw new Error("Incorrect login/password pair");
        }

        return res.status(200).json({
          userId: user._id,
          token: jwt.sign({ userId: user._id }, `${tokenSecretKey}`, {
            expiresIn: "24h",
          }),
        });
      });
    })
    .catch((error) => res.status(500).json(error.message));
};
