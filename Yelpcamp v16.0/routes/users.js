var  express = require("express");
var router =  express.Router({mergeParams: true});
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware"); 
var Campground = require("../models/campground");

var multer = require('multer');

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter})

// cloudinary is the service we are going to use for image upload
var cloudinary = require('cloudinary');

cloudinary.config({ 
  cloud_name: 'yelpcamping', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// User profile
router.get("/",middleware.isLoggedIn, function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			req.flash("error", "Something Went Wrong");
		 	return res.redirect("back");
		}
		Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
			if(err){
				req.flash("error", "Something Went Wrong");
		 		return res.redirect("back");
			}
			res.render("users/show", {user: foundUser, campgrounds:campgrounds});
		});
	});
});

// Edit profile
router.get("/edit", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "User profile not found");
            return res.redirect("back"); 
        }
        res.render("users/edit", {user: foundUser});
    });
});

// Update profile
router.put("/", upload.single('image'), function(req, res){
    User.findById(req.params.id, async function(err, user){
        if(err){
            req.flash("error", "There was a problem in updating your profile");
            return res.redirect("back"); 
        }
        else{
            if(req.file){
                try{
                    await cloudinary.uploader.destroy(user.picId);
                    var result = await cloudinary.uploader.upload(req.file.path);
                    user.picId = result.public_id;
                    user.userPic = result.secure_url;
                }
                catch(err){
                    var result = await cloudinary.uploader.upload(req.file.path);
                    user.picId = result.public_id;
                    user.userPic = result.secure_url;
                }		
            }
            user.bio = req.body.user.bio;
            user.save();
            req.flash("success", "Profile Updated");
			res.redirect("/users/" + req.params.id);
        }
    });
});

module.exports = router;