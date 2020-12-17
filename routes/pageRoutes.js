const express = require("express");
const router = express.Router();
const passport = require("passport");
const passportConfig = require("../passport");
const Car = require("../model/Car");
const Flag = require("../model/Flag");
const Order = require("../model/Order");
const { json } = require("express");
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

router.post(
  "/car",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
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
  }
);

//get all cars for guests
router.get("/car/guest", (req, res) => {
  Car.find({ status: "Available" })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => res.json(err));
});

//get all cars
router.get(
  "/car",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Car.find({ status: "Available" })
      .then((result) => {
        res.json(result);
      })
      .catch((err) => res.json(err));
  }
);

router.get(
  "/car/admin",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Car.find()
      .then((result) => {
        res.json(result);
      })
      .catch((err) => res.json(err));
  }
);

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

    Flag.deleteMany({ car_id: id })
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
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

//Flag
router.post(
  "/flag",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const data = req.body;
    Flag.create(data)
      .then((data) => {
        res.json({ message: "data created", data });
      })
      .catch((err) => res.json(err));
  }
);

//See specific flag
router.get(
  "/flag/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let id = req.params.id;
    Flag.find({ car_id: id })
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
  }
);

router.get(
  "/flag",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Flag.find()
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
  }
);

//search api
router.post(
  "/car/search",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { min_price, max_price, state, manufacturer } = req.body;
    Car.find({
      $and: [
        {
          $or: [
            { price: min_price },
            { price: max_price },
            { price: { $gte: min_price, $lte: max_price } },
            { state },
            { manufacturer },
          ],
        },
        { status: "Available" },
      ],
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  }
);

//Create order api
router.post(
  "/order",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { amount } = req.body;
    if (isNaN(amount)) {
      res.json({ error: "Enter a valid amount" });
    } else {
      let data = req.body;
      Order.create(data).then((result) => {
        res.json(result);
      });
    }
  }
);

//get orders specific to owner api
router.get(
  "/order/:owner",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Order.find({ owner: req.params.owner })
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.json(err);
      });
  }
);

//get orders by specific buyer
router.get(
  "/order/:buyer/buyer",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Order.find({ buyer: req.params.buyer })
      .then((result) => {
        res.json(result);
      })
      .catch((err) => res.json(err));
  }
);

//mark car as sold
router.patch(
  "/car/:car_id/status",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Car.findByIdAndUpdate(req.params.car_id, { status: "sold" })
      .then((updatedCar) => {
        res.json(updatedCar);
      })
      .catch((err) => {
        res.json(err);
      });
  }
);

//change order status when accepted
router.patch(
  "/order/accepted/:id/status",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Order.findByIdAndUpdate(req.params.id, { status: "accepted" })
      .then((updatedOrder) => {
        res.json(updatedOrder);
      })
      .catch((err) => {
        res.json(err);
      });
  }
);

//change order status when rejected
router.patch(
  "/order/rejected/:id/status",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Order.findByIdAndUpdate(req.params.id, { status: "rejected" })
      .then((updatedOrder) => {
        res.json(updatedOrder);
      })
      .catch((err) => {
        res.json(err);
      });
  }
);

//edit order
router.patch(
  "/order/:order_id/price",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { amount } = req.body;
    console.log(amount);
    Order.findByIdAndUpdate(req.params.order_id, { amount: amount })
      .then((result) => {
        console.log(result);
        res.json(result);
      })
      .catch((err) => res.json(err));
  }
);

//delete order
router.delete(
  "/order/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Order.findByIdAndDelete(req.params.id).then((result) =>
      res.json({ message: "Order Deleted", result })
    );
  }
);
module.exports = router;
