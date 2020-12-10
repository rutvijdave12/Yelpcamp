var  express = require("express");
var router =  express.Router({mergeParams: true});
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware"); 
var Campground = require("../models/campground");


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
router.put("/", function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
        if(err){
            req.flash("error", "There was a problem in updating your profile");
            return res.redirect("back"); 
        }
        else{
            req.flash("success", "Profile Updated");
			res.redirect("/users/" + req.params.id);
        }
    })
})

module.exports = router;