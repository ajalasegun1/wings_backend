const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Pusher = require("pusher");
//pusher config
const pusher = new Pusher({
  appId: process.env.appId,
  key: process.env.key,
  secret: process.env.secret,
  cluster: process.env.cluster,
  useTLS: process.env.useTLS,
});
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
//test db connection
const User = require("./model/User");
const cookieParser = require("cookie-parser");
const pageRoute = require("./routes/pageRoutes");

app.use(cors());
app.use(express.json({ limit: "50MB" }));
app.use(cookieParser());

//routes usage
app.use("/auth", authRoutes);
app.use(pageRoute);

mongoose.connect(
  process.env.mongoUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("Database connected")
);
mongoose.set("useCreateIndex", true);
const db = mongoose.connection;
db.once("open", () => {
  console.log("connection wa ooo");
  const carsCollection = db.collection("cars");
  const flagsCollection = db.collection("flags")
  const flagsChangeStream = flagsCollection.watch()
  const changeStream = carsCollection.watch();
  changeStream.on("change", (change) => {
    console.log("A change occured", change);
    //console.log(change.operationType)
    if (change.operationType === "insert") {
      console.log("inserted");
      pusher.trigger("cars", "inserted", change.fullDocument);
    } else {
      console.log("operation type isnt insert");
    }

    if(change.operationType === "delete") {
      console.log("deleted")
      pusher.trigger("cars", "deleted", change.documentKey._id)
    }
    if(change.operationType === "update") {
      console.log("updated")
      pusher.trigger("cars", "updated", change.documentKey._id)
    }
  });

  flagsChangeStream.on("change", change => {
    console.log(change)
    pusher.trigger("flags", "inserted", change.fullDocument);
  })
});



const PORT = process.env.PORT || 3001;
app.listen("3001", () => console.log(`Server running on port: ${PORT}`));
