var Ccampground = require("../models/campground");
var Comment = require("../models/comment");
// all the middleware goes here
var middlewareObj = {}; 

// check campground ownership(authorization)
middlewareObj.checkCampgroundOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err,foundCampground){
			if(err){
				res.redirect("back");
			}
			else{
				// does user own the campground?
				// console.log(foundCampground.author.id); //This is not a string but a mongoose object
				// console.log(req.user._id); //This is a string(object now but a different object)
			//	console.log(foundCampground.author.id === req.user._id) //so comparing both won't work eventhough they both look the same
				if(foundCampground.author.id.equals(req.user._id)){ //equals() is a method that mongoose provides us
					next();//Move on to next middleware or  callback
				}
				else{
					res.redirect("back");
				}
				
			}
		});
	}
	else{
		res.redirect("back");
		// This will take the user back from the page they came from
	}
}

// check comment ownership(authorization)
middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err,foundComment){
			if(err){
				res.redirect("back");
			}
			else{
				// does user own the comment?
				// console.log(foundComment.author.id); //This is not a string but a mongoose object
				// console.log(req.user._id); //This is a string(object now but a different object)
			//	console.log(foundComment.author.id === req.user._id) //so comparing both won't work eventhough they both look the same
				if(foundComment.author.id.equals(req.user._id)){ //equals() is a method that mongoose provides us
					next();//Move on to next middleware or  callback
				}
				else{
					res.redirect("back");
				}
				
			}
		});

	}
	else{
		res.redirect("back");
		// This will take the user back from the page they came from
	}
}

// This is the middleware to check if a user is authenticated to access certain things
middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
		// next in our case would mean to rendering a new campground or the new comment form
		// next will call the next function
	}
	else{
		res.redirect("/login");
	}
} 




module.exports = middlewareObj