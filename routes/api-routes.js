// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");

var delay = (function () {
  var timer=0

    return function (callback, ms) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms)
    }
}) ();

module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function(req, res) {

   delay (function (){
    res.json("/members");
   }, 2000)
    // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
    // So we're sending the user back the route to the members page because the redirect will happen on the front end
    // They won't get this or even be able to access this page if they aren't authed
    
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function(req, res) {
    console.log(req.body);

    delay (function (){
      db.User.create({
        email: req.body.email,
        password: req.body.password,
        first: req.body.first,
        last: req.body.last,
        address: req.body.address,
        address2: req.body.address2,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        phone: req.body.phone,
        secQuestion: req.body.secQuestion,
        secAnswer: req.body.secAnswer,
      }).then(function() {
        res.redirect(307, "/api/login");
      }).catch(function(err) {
        console.log(err);
        res.json(err);
        // res.status(422).json(err.errors[0].message);
      });
     }, 2000)
    
  });

  // Route for logging user out
  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function(req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    }
    else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        first: req.user.first,
        last:req.user.last,
        email: req.user.email,
        id: req.user.id
      });
    }
  });


    app.get("/api/members", function(req, res) {
      // Here we add an "include" property to our options in our findOne query
      // We set the value to an array of the models we want to include in a left outer join
      // In this case, just db.Author
      console.log(req.user.id);
      db.Room.findAll({
        where: {
          userID: req.user.id
        },
        include: [db.User]
      }).then(function(dbRoom) {
        res.json(dbRoom);
      });
    });




};
