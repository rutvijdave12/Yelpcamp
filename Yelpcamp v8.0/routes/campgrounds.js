var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

//Index : show all campgrounds
router.get("/", function(req,res){
	// console.log(req.user);
	/*Our user data gets stored inside this. If the user is logged in then req.user contains 
	the username and an id (no password).
	If the user isn't logged in then req.user is undefined (empty).
	This is a passport functionality
	*/
	//Get all the campgrounds from db
	Campground.find({},function(err,allCampgrounds){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/index",{campgrounds:allCampgrounds});
		}
	});

});

/*We are keeping the url for post and get request the same as a part of a convention.
To add a friend to a friendsList we should keep the route for both the post and get as /friends.
This is convention is called as REST.
So we now have a get request with a url "/campgrounds" and a post request where we could add new
campgrounds with a url "/campgrounds" as well.
There are 7 different routes that follow thus REST convention
*/

//create : add new campground to DB 
router.post("/", isLoggedIn, function(req,res){
	//get data from form and add to the campgrounds array
	//redirect back to campgrounds page
	/*We have to store the data in a variable and that data passed inside the input form is stored 
	inside the body object by their name attribute value in the form
	*/
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	// Now we need to convert this into an object and push it inside our array
	var newCampground = {name:name, image:image, description:description};
	//Create a new campground save it to the db(by using create ot save method)
	Campground.create(newCampground,function(err,campground){
		if(err){
			console.log(err);
		}
		else{
			//And now we redirect to /campgrounds to view the new data added
			res.redirect("/campgrounds");
			//Since we have two "/campgrounds" urls the res.redirect() method by default redirects us to a get route
		}
	}) 


});


//We will have a separate page for forms that will create and submit the campground to the above post request

//Again this could've been any url but by the REST conventions we keep it the same
//New : Show form to create a new campground
router.get("/new", isLoggedIn, function(req,res){
	res.render("campgrounds/new");
}); 

/*The order of "/campgrounds/new" and "/campgrounds/:id" matters.
If we interchange them then all the requests including "/campgrounds/new"
will also be accepted by "/campgrounds/:id"
*/

//SHOW : Shows more info about one campground
router.get("/:id",function(req,res){
	//Find the campground with provided ID
	//render "show" template with that campground
	// res.send("This will be a show page one day");


	//Now we need to capture the id that is shown when we land on show page.
	//FindById() is a mongoose method to find a unique entry by its id
	/* We have ids of our comments in the campground collection so instead of passing the campground object we first need to
	   need to populate the comments field and then execute the query after that we will pass the campgrounds object
	   */
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err){
			console.log(err);
			// res.redirect("/campgrounds");
		}
		else{
			// console.log(foundCampground);
			res.render("campgrounds/show",{campground:foundCampground});
		}
	})
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

