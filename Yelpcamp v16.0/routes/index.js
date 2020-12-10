var  express = require("express");
var router =  express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware"); 
var Campground = require("../models/campground");
var async = require("async");
nodemailer = require("nodemailer");// sends mail on password reset
var crypto = require("crypto"); //crypto is a part of express so no need to install it
// root route
router.get("/", function(req,res){
	res.render("landing");
});


// show register form
router.get("/register", middleware.isNotLoggedIn, function(req,res){
	res.render("register", {page: 'register'});
});

// show admin register form
router.get("/adminSignup", middleware.isNotLoggedIn, function(req, res){
	res.render("admin");
});

// handle sign up logic
router.post("/register", middleware.isNotLoggedIn, function(req,res){
	var newUser = new User(
		{
			username: req.body.username,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email:req.body.email
		});
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
router.get("/login", middleware.isNotLoggedIn, function(req,res){
	res.render("login", {page: 'login'});
});

// Handling login logic
// router.post("/login", middleware, callback);
// The middleware will call authenticate method which we setup above (passport.use(new LocalStrategy(User.authenticate()));)
router.post("/login", middleware.isNotLoggedIn, passport.authenticate("local",
 {
	 successRedirect:"/campgrounds",
	 failureRedirect:"/login",
	 badRequestMessage : 'Missing username or password.',
	 failureFlash: true,
	 successFlash: "Welcome to Yelpcamp"
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

// forgot route
router.get("/forgot", middleware.isNotLoggedIn, function(req, res){
	res.render("forgot");
});

// handle forgot password
router.post("/forgot", middleware.isNotLoggedIn, function(req, res, next){
	async.waterfall([//async.waterfall is a series of functions inside an array which passes on its result to the next function
		function(done){
			crypto.randomBytes(20, function(err, buf){
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		function(token, done){
			User.findOne({email: req.body.email}, function(err, user){
				if(err || !user){
					req.flash("error", "No account with that email address exists.");
					return res.redirect("/forgot");
				}
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; //1 hour in ms

				user.save(function(err){
					done(err, token, user);
				});
			});
		},
		function(token, user, done){
			var smtpTransport = nodemailer.createTransport({
				service:"Gmail",//we can use sendgrid, sendpost, godaddy
				auth: {
					user:"yelp.camping@gmail.com",
					pass:process.env.GMAIL_PASSWORD
				}
			});
			var mailOptions = {
				to: user.email,
				from: "yelp.camping@gmail.com",
				subject: "Yelpcamp Password Reset",
				text: "You are receiving this mail because you (or someone else) have requested the reset of the password" +
				"Please click on the following link, or paste this into your browser to complete the process" + "\n\n" + 
				"http://" + req.headers.host + '/reset/' + token + "\n\n" +
				"If you did not request this, please ignore this email and your password will remain unchanged"
			};
			smtpTransport.sendMail(mailOptions, function(err){
				console.log("mail sent");
				req.flash("success", "An e-mail has been sent to " + user.email + " to reset your password");
				done(err, "done");
			});
		}
	], function(err){
		if(err) return next(err);
		res.redirect("/forgot");
	});
});

router.get("/reset/:token", middleware.isNotLoggedIn, function(req, res){
	User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
		if(err || !user){
			req.flash("error", "Password reset token is invalid or has expired");
			return res.redirect("/forgot");
		}
		res.render("reset", {token: req.params.token});
	});
});

router.post("/reset/:token", middleware.isNotLoggedIn, function(req, res){
	async.waterfall([
		function(done){
			User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires:{ $gt: Date.now()}}, function(err, user){
				if(err || !user){
					req.flash("error", "Password reset token is invalid or has expired");
					return res.redirect("back");
				}
				if(req.body.password === req.body.confirm){
					user.setPassword(req.body.password, function(err){
						if(err){
							req.flash("error", "Something Went Wrong.");
		 					return res.redirect("back");
						}
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						user.save(function(err){
							req.logIn(user, function(err){
								done(err, user);
							})
						});
					});
				}
				else{
					req.flash("error", "Passwords do not match.");
		 			return res.redirect("back");
				}
			});
		},
		function(user, done){
			var smtpTransport = nodemailer.createTransport({
				service:"Gmail",
				auth: {
					user:"yelp.camping@gmail.com",
					pass:process.env.GMAIL_PASSWORD
				}
			});
			var mailOptions = {
				to: user.email,
				from: "yelp.camping@gmail.com",
				subject: "Your password has been changed successfully",
				text: "Hello,\n\n" + 
				"This is a confirmation that the password for your account " + user.email + " has just been changed"
			};
			smtpTransport.sendMail(mailOptions, function(err){
				req.flash("success", "Success! Your password has been changed successfully.");
				done(err);
			});
		}
	], function(err){
		if(err){
			req.flash("error", "Something Went Wrong.");
		 	return res.redirect("back");
		}
		res.redirect("/campgrounds");
	})
})




module.exports = router;