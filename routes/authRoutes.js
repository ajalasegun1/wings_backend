const express = require("express");
const router = express.Router();
const User = require("../model/User");
const passport = require("passport");
const passportConfig = require("../passport");
const JWT = require("jsonwebtoken");

//SIGNUP ROUTE HANDLER
router.post("/signup", (req, res) => {
  const { first_name, last_name, address, password, email } = req.body;
  User.create({ first_name, last_name, address, password, email })
    .then((user) => {
      res.json({ status: 200, data: user });
    })
    .catch((err) => {
      res.json({
        status: 404,
        error: "Email already exists",
      });
    });
});

//SIGNIN ROUTE HANDLER
router.post(
  "/signin",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    if (req.isAuthenticated()) {
      const { first_name, last_name, is_admin, email, _id } = req.user;
      const token = JWT.sign(
        { iss: "Segun", sub: req.user._id },
        "blacksheep",
        { expiresIn: 60 * 60 }
      );
      res.cookie("access_token", token, { httpOnly: true, sameSite: true });
      res.json({
        status: 200,
        data: {
          first_name,
          last_name,
          is_admin,
          email,
          _id,
        },
      });
    }
  }
);

router.get(
  "/signout",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.clearCookie("access_token");
    res.json({ signout: true });
  }
);

module.exports = router;
