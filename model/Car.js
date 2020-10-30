const mongoose = require("mongoose")
const Schema = mongoose.Schema

const carSchema = new Schema({
    imageUrl: String,
    imageID: String,
    created_on: String,
    manufacturer: String,
    body_type: String,
    model: String,
    owner: String,
    price: Number,
    state: String,
    status: String
})

module.exports = mongoose.model("cars", carSchema)