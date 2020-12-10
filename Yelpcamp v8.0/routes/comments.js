var express = require("express");
var router = express.Router({mergeParams: true});//This will merge the params and then we can access the :id  
var Campground = require("../models/campground");
var Comment = require("../models/comment");

// Comments new
router.get("/new", isLoggedIn,function(req,res){
    // find campground by id
    // console.log(req.params.id);
    // The above line will print undefined since our id doesn't get through app.js over here
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/new",{campground:campground});
		}
	})
});

// Comments create
router.post("/", isLoggedIn, function(req,res){
	// lookup campground using ID
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}
		else{
			// console.log(req.body.comment);
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					console.log(err);
				}
				else{
					// add username and id to comment
					// console.log("New comment's username will be: " + req.user.username);
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// save comment
					comment.save();
					// console.log(comment);
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/" + campground._id);
				}
			});

		}
	})
	// create a new comment
	// connect new comment to campground
	// redirect campground to show page
});

// This is the middleware to check if a user is authenticated to access certain things
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
		// next in our case would mean to rendering a new campground or the new comment form
		// next will call the next function
	}
	else{
		res.redirect("/login");
	}
} 


module.exports = router;