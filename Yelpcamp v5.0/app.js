var express 	= require("express"),
	bodyParser  = require("body-parser"),
	mongoose    = require("mongoose"),
	Campground  = require("./models/campground"),
	Comment		= require("./models/comment"),
	seedDB		= require("./seeds");


var app = express();

mongoose.connect("mongodb://localhost/yelp_camp",{useNewUrlParser:true,useUnifiedTopology:true});

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
// console.log(__dirname);
// /mnt/83d52c45-cd1e-4268-adb4-b027109d7e5c/udemy_courses/1.webD(colt steele)/codes/Yelpcamp/Yelpcamp/Yelpcamp v5.0
/* __dirname is the path in which we are working. So it is always safer to write in the above manner because if any
problem occurs we always have the right address for public folder
*/
seedDB();






app.get("/", function(req,res){
	res.render("landing");
});

//Index : show all campgrounds
app.get("/campgrounds", function(req,res){
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
app.post("/campgrounds", function(req,res){
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
app.get("/campgrounds/new", function(req,res){
	res.render("campgrounds/new");
}); 

/*The order of "/campgrounds/new" and "/campgrounds/:id" matters.
If we interchange them then all the requests including "/campgrounds/new"
will also be accepted by "/campgrounds/:id"
*/
//SHOW : Shows more info about one campground
app.get("/campgrounds/:id",function(req,res){
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


// =====================
// COMMENT ROUTES
// =====================

app.get("/campgrounds/:id/comments/new",function(req,res){
	// find campground by id
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/new",{campground:campground});
		}
	})
});

app.post("/campgrounds/:id/comments",function(req,res){
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
})



app.listen(3000, function(){
	console.log("Yelpcamp server has started!");
});



/*
RESTFUL ROUTES(THERE ARE 7 RESTFUL ROUTES)
LETS TAKE AN EXAMPLE OF DOGS

name         url                              verb       description
==================================================================================
INDEX       /dogs(/campgrounds)                GET      Display a list of all dogs
NEW         /dogs/new(/campgrounds/new)		   GET      Add new dog to the DB
CREATE      /dogs(/campgrounds)                POST     Add new dog to DB
SHOW        /dogs/:id                          GET      Show info about one dog

INDEX 	/campgrounds
NEW   	/campgrounds/new
CREATE	/campgrounds
SHOW 	/campgrounds/:id					


NEW		/campgrounds/:id/comments/new		GET
CREATE 	/campgrounds/:id/comments			POST
Since a comment is dependent on the id we are chaining comments with a campground

*/