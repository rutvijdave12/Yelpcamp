var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username:String,
    password:String
});


UserSchema.plugin(passportLocalMongoose);
// This adds a bunch of functionalities to our user model


module.exports = mongoose.model("User", UserSchema);