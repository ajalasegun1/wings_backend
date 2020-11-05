const express = require("express");
const router = express.Router();
const passport = require("passport");
const passportConfig = require("../passport");
const Car = require("../model/Car");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json("we are on the pages route babaaay!");
  }
);

router.post("/car", (req, res) => {
  const post = req.body;
  //console.log(post);
  cloudinary.uploader.upload(
    post.imageUrl,
    { upload_preset: "tests" },
    (error, result) => {
      if (error) {
        res.json({ error });
      }
      if (result) {
        post.imageUrl = result.url;
        post.imageID = result.public_id;
        //res.json({ cloud: result, data: post });
        Car.create(post)
          .then((result) => {
            res.json(result);
          })
          .catch((err) => {
            res.json(err);
          });
      }
    }
  );
});

//get all cars
router.get("/car", (req, res) => {
  Car.find()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => res.json(err));
});

//delete car ad
router.delete(
  "/car/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const id = req.params.id;
    Car.findByIdAndDelete(id)
      .then((data) => {
        cloudinary.uploader.destroy(data.imageID, (err, success) => {
          if (err) {
            console.log(err);
          }
          if (success) {
            console.log({ success: true, success });
          }
        });
        res.json(data);
      })
      .catch((error) => {
        res.json(error);
      });
  }
);

//Edit car ad price
router.patch(
  "/car/:id/price",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const id = req.params.id;
    let { price } = req.body;
    Car.findByIdAndUpdate(id, { price })
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.json(err);
      });
  }
);

module.exports = router;
