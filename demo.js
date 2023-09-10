//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");

const session = require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate = require('mongoose-findorcreate');
const path = require("path");
const docxtemplater = require("docxtemplater");
const JSZip = require("jszip");
const fs = require("fs");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
// const findOrCreate=require('mongoose-findorcreate')





const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
var harr=[];
var parr=[];
//var i=0;
mongoose.connect('mongodb://127.0.0.1:27017/blogDB');
const ms=new mongoose.Schema({
  heading:String,
  post:String,
  filename:String
});
const pms=new mongoose.Schema({
  pheading:String,
  ppost:String
});
const blog=new mongoose.model("post",ms);
const pblog=new mongoose.model("ppost",pms);
const i1=new blog({
  heading:"hi",
  post:"hello",
  filename:"Vivekdattaswot.docx"
});
const i2=new blog({
  heading:"namaste",
  post:"salaam",
  filename:"Vivekdattaswot.docx"
});
// blog.insertMany([i1,i2]).then(function(res){
//   console.log(res);
// });

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static("static"));

app.use(session({
    secret: 'this is a secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))
  
  app.use(passport.initialize());
  app.use(passport.session());


//   mongoose.connect('mongodb://127.0.0.1:27017/userDB');
const usc=new mongoose.Schema({
    username:String,
    password:String
})


usc.plugin(passportLocalMongoose);
usc.plugin(findOrCreate);

const User=new mongoose.model("user",usc);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
})

var cid="702313410452-muao3f20hjb9q1ka1v2oh1tlo2qievqr.apps.googleusercontent.com"
var cs="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"
passport.use(new GoogleStrategy({
  clientID: cid,
  clientSecret: cs,
  callbackURL: "http://localhost:3000/auth/google/home"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));




app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));



  app.get('/auth/google/home', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });



app.get("/displayFile", function (req, res) {
  // Path to the Word document
  const filePath = path.join(__dirname, "static", "Vivekdattaswot.docx");

  // Set the appropriate Content-Disposition header to prompt the browser to open the file
  res.set("Content-Disposition", "inline; filename=Vivekdattaswot.docx");

  // Send the Word document file as a response
  res.sendFile(filePath);
});

app.post("/displayFile", function(req, res) {
  var t = req.body.fileopen;
  

  blog.find({ heading: t }).then(function(result) {
    const filePath = path.join(__dirname, "static", result[0].filename);
  

    console.log(filePath); // Confirm that the filePath is set correctly

    res.sendFile(filePath); // Send the file after the filePath is set
  });
});


app.get("/login",function(req,res){
    res.render("login");
})


app.get("/register",function(req,res){
    res.render("register");
})



app.get("/",function(req,res){
    res.render("phome");
})

app.get("/home",function(req,res){
  pblog.find({}).then(function(result){
    res.render("home",{hh:result});
  })
  
})


app.post("/register", function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        console.log("entered register");
        passport.authenticate("local")(req, res, function() {
          console.log("authenticated");
          res.redirect("/home");
        });
      }
    });
  });


  app.post("/login",function(req,res){
    const u=new User({
      username:req.body.username,
      password:req.body.password
    })
    
    req.login(u,function(err){
      if(err)
      console.log(err);
      else{
        passport.authenticate("local" )(req,res,function(){
          console.log("authenticated");
          res.redirect("/home");
          l=1;
        })
      }
    })
    })

app.get("/compose",function(req,res){
  res.render("compose");
})
app.post("/home",function(req,res){
  var h=req.body.head;
  var p=req.body.post;
  if(h!=undefined&&p!=undefined){
    const ph=new pblog({
      pheading:req.body.head,
      ppost:p.substring(0,100)
    });
    ph.save();
  }
  const i=new blog({
    heading:req.body.head,
    post:req.body.post,
    filename:req.body.file
  });
  i.save();
  if(req.body.pub=="publ"){
res.redirect("/home");
}
else if(req.body.compose=="comp"){
  res.redirect("/compose")
}
else{
  console.log(harr);
  res.redirect("/"+req.body.b);   
}
})


app.get("/:generic",function(req,res){
 var cc= req.params.generic;
 console.log(cc);
  blog.find({heading:cc}).then(function(result){
    console.log(result);
    if(result.length!=0)
    res.render("post",{he:result[0].heading,po:result[0].post});
  })
});


app.get("/abc/ejs-challenge/public/css/about.ejs",function(req,res){
  res.render("about");
})
app.get("/abc/ejs-challenge/public/css/contact.ejs",function(req,res){
  res.render("contact");
})







app.listen(3000, function() {
  console.log("Server started on port 3000");
});


// var h=req.body.head;
// p=req.body.post;
// if(h!==undefined&&p!==undefined){
// //var ah=h.slice(0,100);
// var ap=p.substring(0,100);

//  harr.push(h);
//  parr.push(ap);
// }
// app.get("/"+h,function(req,res){
//   res.render("post",{he:h,po:p});
// })
// if(req.body.pub=="publ"){
// res.redirect("/");
// }
// else{
//   console.log(harr);
//   res.redirect("/"+req.body.b);   
// }
// }

// res.render("home",{hh:harr,pp:parr});

 // blog.find({_id:n}).then(function(result){
  //   // console.log(result);
  //   // console.log("/"+result[0].heading);
  //   // console.log(result[0].heading+" "+result[0].post);
  //   // app.get("/"+result[0].heading,function(req,res){
  //   //     res.render("post",{he:result[0].heading,po:result[0].post})
  //   // })
  // })