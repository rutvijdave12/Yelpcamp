var express = require("express");
var router = express.Router({mergeParams: true});
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
var geo = require('mapbox-geocoding');
geo.setAccessToken('pk.eyJ1IjoicnV0dmlqMTIiLCJhIjoiY2todTk0djgyMGk5YTMwbzNwbGx5a2wzYiJ9.R86nYLWXN1qj-iQC5JNvLQ');


// below code is for image uploading feature
// A multer storage engine for Cloudinary. Also consult the Cloudinary API.
var multer = require('multer');

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter})

// cloudinary is the service we are going to use for image upload
var cloudinary = require('cloudinary');

cloudinary.config({ 
  cloud_name: 'yelpcamping', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});




//Index : show all campgrounds
router.get("/", function(req,res){
	// console.log(req.user);
	/*Our user data gets stored inside this. If the user is logged in then req.user contains 
	the username and an id (no password).
	If the user isn't logged in then req.user is undefined (empty).
	This is a passport functionality
	*/
	//Get all the campgrounds from db
	var match = null;
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name:regex},function(err,allCampgrounds){
			if(err){
				console.log(err);
				req.flash("error", "Something went wrong");
				res.redirect("back");
			}
			else{
				if(allCampgrounds.length === 0){
					match = "\"" + req.query.search + "\"" + " not found, please try again!";
				}
				else{
					match = "Search results for " + "\"" + req.query.search + "\"";
				}
				res.render("campgrounds/index",{campgrounds:allCampgrounds, page: 'home', match: match});
			}
		});

	}
	else{
		Campground.find({},function(err,allCampgrounds){
			if(err){
				console.log(err);
			}
			else{
				res.render("campgrounds/index",{campgrounds:allCampgrounds, page: 'home', match: match});
			}
		});
	}

});

/*We are keeping the url for post and get request the same as a part of a convention.
To add a friend to a friendsList we should keep the route for both the post and get as /friends.
This is convention is called as REST.
So we now have a get request with a url "/campgrounds" and a post request where we could add new
campgrounds with a url "/campgrounds" as well.
There are 7 different routes that follow thus REST convention
*/

//create : add new campground to DB 
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
	// //get data from form and add to the campgrounds array
	// //redirect back to campgrounds page
	// /*We have to store the data in a variable and that data passed inside the input form is stored 
	// inside the body object by their name attribute value in the form
	// */
	// var name = req.body.name;
	// var image = req.body.image;
	// var description = req.body.description;
	// var price = req.body.price;
	// var author = {
	// 	id:req.user._id,
	// 	username:req.user.username
	// }
	// Geocode an address to coordinates
	geo.geocode('mapbox.places', req.body.campground.location, function (err, geoData) {
		if(err){
			req.flash("error", "Invalid Address");
			return res.redirect("back");
		}
		// console.log(geoData.features[0].center);
		var location = geoData.features[0].place_name;
		var lat = geoData.features[0].center[0];
		var lng = geoData.features[0].center[1];

		cloudinary.uploader.upload(req.file.path, function(result) {
			// add cloudinary url for the image to the campground object under image property
			req.body.campground.image = result.secure_url; // result object contains all the info including the url(http) and secure_url(https) that we store inside the image field of our campground db
			// add image's public_id to campground object
			req.body.campground.imageId = result.public_id; //This id is what is going us to allow to delete and update the image
			// add author to campground
			req.body.campground.author = {
			  id: req.user._id,
			  username: req.user.username
			}
			Campground.create(req.body.campground, function(err, campground) {
			  if (err) {
				req.flash('error', err.message);
				return res.redirect('back');
			  }
			  res.redirect('/campgrounds/' + campground.id);
			});
		  });
	});
});


//We will have a separate page for forms that will create and submit the campground to the above post request

//Again this could've been any url but by the REST conventions we keep it the same
//New : Show form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req,res){
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
		if(err || !foundCampground){
			console.log(err);
			req.flash("error", "Something went wrong");
			res.redirect("/campgrounds");
		}
		else{
			// console.log(foundCampground);
			res.render("campgrounds/show",{campground:foundCampground});
		}
	})
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Something went wrong");
			return res.redirect("/campgrounds/" + req.params.id);
		}
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});


// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req,res){
	// Geocode an address to coordinates
	geo.geocode('mapbox.places', req.body.campground.location, function (err, geoData) {
		if(err){
			req.flash("error", "Invalid Address");
			return res.redirect("back");
		}
		else{
			req.body.campground.location = geoData.features[0].place_name;
			req.body.campground.lat = geoData.features[0].center[0];
			req.body.campground.lng = geoData.features[0].center[1];
			// find and update the correct campground
			// redirect somewhere(show page)
			Campground.findById(req.params.id,async function(err, foundCampground){
				if(err || !foundCampground){
					req.flash("error", "Something went wrong");
					res.redirect("/campgrounds");
				}
				else{
					if(req.file){
						try{
							await cloudinary.uploader.destroy(foundCampground.imageId);
							var result = await cloudinary.uploader.upload(req.file.path);
							foundCampground.imageId = result.public_id;
							foundCampground.image = result.secure_url;
						}
						catch(err){
							req.flash("error", "Something went wrong");
							return res.redirect("/campgrounds");
						}		
					}
					foundCampground.name = req.body.campground.name;
					foundCampground.price = req.body.campground.price;
					foundCampground.description = req.body.campground.description;
					foundCampground.location = req.body.campground.location;
					foundCampground.lat = req.body.campground.lat;
					foundCampground.lng = req.body.campground.lng;
					foundCampground.save();
					req.flash("success", "Campground Updated");
					res.redirect("/campgrounds/" + req.params.id);
				}
			});
		}
	});	
});


// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findById(req.params.id, async function(err,campground){
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}

		try{
			await cloudinary.uploader.destroy(campground.imageId);
			Comment.deleteMany({_id : {$in : campground.comments}}, function(err){
				if(err){
					console.log(err);
					res.redirect("/campgrounds");
				}
				else{
					campground.remove();
					req.flash("success", "Campground Removed Successfully");
					res.redirect("/campgrounds");
				}
				});
			}
		catch(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}
	});
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



module.exports = router;