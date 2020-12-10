var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username:{type:String, unique:true, required:true},
    password:String,
    userPic:{type:String, default: "https://avatars1.githubusercontent.com/u/62494387?s=460&v=4"},
    picId:String,
    firstName:String,
    lastName:String,
    email:{type:String, unique:true, required:true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    bio:{type:String, default:null},
    isAdmin:{type:Boolean, default: false}
});


UserSchema.plugin(passportLocalMongoose);
// This adds a bunch of functionalities to our user model


module.exports = mongoose.model("User", UserSchema);