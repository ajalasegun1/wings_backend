const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
  },
  first_name: String,
  last_name: String,
  password: String,
  address: String,
  is_admin: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next;
  }

  bcrypt.hash(this.password, 10, (err, hashedPassword) => {
    if (err) return next(err);
    this.password = hashedPassword;
    return next();
  });
});

module.exports = mongoose.model("user", userSchema);
