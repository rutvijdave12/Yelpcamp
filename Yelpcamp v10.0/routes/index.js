var  express = require("express");
var router =  express.Router();
var passport = require("passport");
var User = require("../models/user");

// root route
router.get("/", function(req,res){
	res.render("landing");
});


// show register form
router.get("/register", function(req,res){
	res.render("register");
});

// handle sign up logic
router.post("/register", function(req,res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err,user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req,res, function(){
			res.redirect("/campgrounds");
		});
	});
});
// If you sign up with the same username then passport will give an error saying username already exists


//  Show login form
router.get("/login", function(req,res){
	res.render("login");
});

// Handling login logic
// router.post("/login", middleware, callback);
// The middleware will call authenticate method which we setup above (passport.use(new LocalStrategy(User.authenticate()));)
router.post("/login",passport.authenticate("local",
 {
	 successRedirect:"/campgrounds",
	 failureRedirect:"/login"
	}), function(req,res){
});

/* The passport.authenticate in the login and signup is the same the only difference is that in signup we need to do other things
   before calling the passport.authenticate
*/

//  logout route
router.get("/logout", function(req,res){
	req.logout();
	res.redirect("/campgrounds");
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