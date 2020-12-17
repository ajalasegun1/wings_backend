const { Schema, model } = require("mongoose");

const OrderSchema = new Schema({
  owner: String,
  buyer: String,
  buyer_name: String,
  car_details: String,
  car_id: String,
  status: String,
  amount: Number,
});

module.exports = model("order", OrderSchema);
