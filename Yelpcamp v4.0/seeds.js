var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
    {
        name:"Cloud's Rest", 
        image:"https://images.unsplash.com/photo-1483381719261-6620dfa2d28a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description:"blah blah blah"
    },
    {
        name:"Desert Mesa", 
        image:"https://images.unsplash.com/photo-1499363536502-87642509e31b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description:"blah blah blah"
    },
    {
        name:"Canyon Floor", 
        image:"https://images.unsplash.com/photo-1445308394109-4ec2920981b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description:"blah blah blah"
    }
]

function seedDB(){
    // Remove all campgrounds
    Campground.deleteMany({}, function(err){
        // .remove() is depricated so now we will use deleteMany()
        if(err){
            console.log(err);
        }
        console.log("removed campgrounds");
        // Add a few campgrounds
        data.forEach(function(seed){
            /* need to put this whole code inside the "remove" callback as
            there is no guaranteee that the remove code will get executed before
            the create so for that to happen we need to put this inside the callback
            */
            Campground.create(seed, function(err,campground){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("added a campground");
                    // Add a few comments
                    // Create a comment 
                    Comment.create({
                        text:"This place is great, but I wish there was internet",
                        author:"Homer"
                    },function(err,comment){
                        if(err){
                            console.log(err);
                        }
                        else{
                            campground.comments.push(comment);
                            campground.save();
                            console.log("created a new comment");
                        }
                    });
                }
            });
        });
    });
}


module.exports = seedDB;