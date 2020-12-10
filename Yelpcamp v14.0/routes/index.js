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
	res.render("register", {page: 'register'});
});

// show admin register form
router.get("/adminSignup", function(req, res){
	res.render("admin");
});

// handle sign up logic
router.post("/register", function(req,res){
	var newUser = new User({username: req.body.username});
	if(req.body.adminCode === "yelpsecret123"){
		newUser.isAdmin = true;
	}
	else if(req.body.adminCode){
		req.flash("error", "Something Went Wrong");
		 return res.redirect("/campgrounds");
	}
	User.register(newUser, req.body.password, function(err,user){
		if(err){
			//Passport has the errors ready for us so we directly pass them to our header
			return res.render("register", {"error": err.message});
		}
		passport.authenticate("local")(req,res, function(){
			req.flash("success", "Welcome to Yelpcamp " + user.username);
			res.redirect("/campgrounds");
		});
	});
});
// If you sign up with the same username then passport will give an error saying username already exists


//  Show login form
router.get("/login", function(req,res){
	res.render("login", {page: 'login'});
});

// Handling login logic
// router.post("/login", middleware, callback);
// The middleware will call authenticate method which we setup above (passport.use(new LocalStrategy(User.authenticate()));)
router.post("/login",passport.authenticate("local",
 {
	 successRedirect:"/campgrounds",
	 failureRedirect:"/login",
	 badRequestMessage : 'Missing username or password.',
     failureFlash: true
	}), function(req,res){
});

/* The passport.authenticate in the login and signup is the same the only difference is that in signup we need to do other things
   before calling the passport.authenticate
*/

//  logout route
router.get("/logout", function(req,res){
	req.logout();
	req.flash("success", "Logged You Out!");
	/* we can add anything as the 1st argument "success", "info", "error" or even "blah"
	 it is just a key we are looking for inside our app.js
	 */
	res.redirect("/campgrounds");
}); 

module.exports = router;