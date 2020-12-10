var express 		= require("express"),
	bodyParser  	= require("body-parser"),
	mongoose    	= require("mongoose"),
	Campground  	= require("./models/campground"),
	Comment			= require("./models/comment"),
	seedDB			= require("./seeds"),
	passport		= require("passport"),
	LocalStrategy	= require("passport-local"),
	User 			= require("./models/user")
	methodOverride  = require("method-override");

// requiring routes
var commentRoutes 		= require("./routes/comments"),
	campgroundRoutes	= require("./routes/campgrounds"),
	indexRoutes 		= require("./routes/index"); 


var app = express();

mongoose.connect("mongodb://localhost/yelp_camp",{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.set('useFindAndModify', false);

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
// console.log(__dirname);
// /mnt/83d52c45-cd1e-4268-adb4-b027109d7e5c/udemy_courses/1.webD(colt steele)/codes/Yelpcamp/Yelpcamp/Yelpcamp v5.0
/* __dirname is the path in which we are working. So it is always safer to write in the above manner because if any
problem occurs we always have the right address for public folder
*/
// seedDB();//seed the database


app.use(methodOverride("_method"));

// PASSPORT CONFIGURATION	
app.use(require("express-session")({
	secret:"Once again Rusty wins cutest dog!",
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// User.authenticate comes with passportLocalMongoose

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Both the above methods also come with passportLocalMongoose


/*
The below code will call our middleware on every route and whatever we provide inside our
currentUser is what we use inside our templates.
After that we need to move on to the next code i.e the route handlers in most of the cases so
for that we use next();
*/
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

// The below code tells our app to use the 3 route files that we have required
app.use("/",indexRoutes);
/*
Since nothing is common inside the routes/index.js we can either put a "/" or write nothing 
*/
app.use("/campgrounds",campgroundRoutes);
/* Inside our routes/campgrounds.js we have every route starting with "/campgrounds", so instead of writing it everytime
we write it inside app.use(). so everytime we hit that route /campgrounds get appended to it
*/
app.use("/campgrounds/:id/comments",commentRoutes);//This route is a prefix that gets added to the route inside its actual file routes
/* After doing the above step we need to merge the routes for commentRoutes because the above routes just gets appended
but don't get through through meaning it cannot find our campground since out "/:id" is present over here
*/

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