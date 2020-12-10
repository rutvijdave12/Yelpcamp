var express = require("express");

var app = express();

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine","ejs");

var campgrounds = [
	{name: "Salmon Creek", image: "https://images.unsplash.com/photo-1515444744559-7be63e1600de?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
	{name: "Granite Hill", image: "https://images.unsplash.com/photo-1505735754789-3404132203ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"},
	{name: "Mountain Goat's Rest", image: "https://images.unsplash.com/photo-1537565266759-34bbc16be345?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
	{name: "Salmon Creek", image: "https://images.unsplash.com/photo-1515444744559-7be63e1600de?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
	{name: "Granite Hill", image: "https://images.unsplash.com/photo-1505735754789-3404132203ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"},
	{name: "Mountain Goat's Rest", image: "https://images.unsplash.com/photo-1537565266759-34bbc16be345?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
	{name: "Salmon Creek", image: "https://images.unsplash.com/photo-1515444744559-7be63e1600de?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
	{name: "Granite Hill", image: "https://images.unsplash.com/photo-1505735754789-3404132203ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"},
	{name: "Mountain Goat's Rest", image: "https://images.unsplash.com/photo-1537565266759-34bbc16be345?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"}
	]

app.get("/", function(req,res){
	res.render("landing");
});

app.get("/campgrounds", function(req,res){

	res.render("campgrounds", {campgrounds:campgrounds});

});

/*We are keeping the url for post and get request the same as a part of a convention.
To add a friend to a friendsList we should keep the route got both the post and get as /friends.
This is convention is called as REST.
So we now have a get request with a url "/campgrounds" and a post request where we could add new
campgrounds with a url "/campgrounds" as well.
There are 7 different routes that follow thus REST convention
*/
app.post("/campgrounds", function(req,res){
	//get data from form and add to the campgrounds array
	//redirect back to campgrounds page
	/*We have to store the data in a variable and that data passed inside the input form is stored 
	inside the body object by their name attribute value in the form
	*/
	var name = req.body.name;
	var image = req.body.image;
	// Now we need to convert this into an object and push it inside our array
	var newCampground = {name:name, image:image};
	campgrounds.push(newCampground);
	//And now we redirect to /campgrounds to view the new data added
	res.redirect("/campgrounds");
	//Since we have two "/campgrounds" urls the res.redirect() method by default redirects us to a get route

});


//We will have a separate page for forms that will create and submit the campground to the above post request

//Again this could've been any url but by the REST conventions we keep it the same
app.get("/campgrounds/new", function(req,res){
	res.render("new");
}); 




app.listen(3000, function(){
	console.log("Yelpcamp server has started!");
});