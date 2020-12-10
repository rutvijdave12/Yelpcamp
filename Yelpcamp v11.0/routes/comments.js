var express = require("express");
var router = express.Router({mergeParams: true});//This will merge the params and then we can access the :id  
var Campground = require("../models/campground");
var Comment = require("../models/comment");
// var middleware = require("../middleware/index");
var middleware = require("../middleware"); 
/* whenever we require a directory. index.js is automatically
 required when we require its directory.
 For eg. when we require express its index.js is automatically imported or
 required which imports a bunch of other files which imports some other files.
 So index.js is a special filename so we don't have to require it explicitly
*/

// Comments new
router.get("/new", middleware.isLoggedIn,function(req,res){
    // find campground by id
    // console.log(req.params.id);
    // The above line will print undefined since our id doesn't get through app.js over here
	Campground.findById(req.params.id,function(err,campground){
		if(err || !campground){
			console.log(err);
			req.flash("error", "Something went wrong");
			res.redirect("back");
		}
		else{
			res.render("comments/new",{campground:campground});
		}
	})
});

// Comments create
router.post("/", middleware.isLoggedIn, function(req,res){
	// lookup campground using ID
	Campground.findById(req.params.id,function(err,campground){
		if(err || !campground){
			req.flash("error", "Something went wrong");
			res.redirect("/campgrounds");
		}
		else{
			// console.log(req.body.comment);
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					console.log(err);
					req.flash("error", "Something went wrong");
					res.redirect("back");
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
					req.flash("success", "Successfully added comment");
					res.redirect("/campgrounds/" + campground._id);
				}
			});

		}
	})
	// create a new comment
	// connect new comment to campground
	// redirect campground to show page
});


// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err || !foundComment){
			req.flash("error", "Something went wrong");
			res.redirect("/back");
		}
		else{
		res.render("comments/edit", {campground_id:req.params.id, comment: foundComment});
		}
	})
	
});

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedComment){
		if(err || !updatedComment){
			req.flash("error", "Something went wrong");
			res.redirect("back");
		}
		else{
			req.flash("success", "Comment Edited");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	// findByIdAndDelete
	Comment.findByIdAndDelete(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		}
		else{
			req.flash("success", "Comment deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});






module.exports = router;