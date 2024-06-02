const express = require("express");
const router = express.Router();
const userCtrl = require("./../controllers/user");

// Sign up
router.post("/signup", userCtrl.signup);

// Log in
router.post("/login", userCtrl.login);

module.exports = router;
