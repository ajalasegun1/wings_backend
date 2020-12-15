const {Schema, model} = require("mongoose") 

const FlagSchema = new Schema({
    car_id: String,
    reason: String,
    description: String
})

module.exports = model("flag", FlagSchema)