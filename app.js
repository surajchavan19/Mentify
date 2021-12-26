require('dotenv').config();
const express=require("express");
const app=express();
const Quote = require('inspirational-quotes');
const bodyparser=require("body-parser");
const ejs=require("ejs")
const mongoose=require("mongoose");
const multer=require("multer");
const path=require("path")
const fs = require('fs');
const directoryPath = path.join(__dirname +'/public/upload');
const directoryPath1 = path.join(__dirname +'/public/upload1');
const directoryPath2 = path.join(__dirname +'/public/upload2');
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findorcreate=require("mongoose-findorcreate")
const ejsLint = require('ejs-lint');
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));


app.use(session({
    secret:"our secret.",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema= new mongoose.Schema({
    email:String,
    password:String,
    googleId:String,
    secret:String,
    dash:String


})
const precSchema= new mongoose.Schema({
    name:String,
    blood:String,
    age:String,
    history:String,



})
const detSchema= new mongoose.Schema({
    name:String,
   prescription:String,
   medicine:String,



})
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findorcreate);
const User = new mongoose.model("User",userSchema);
const Prec=new mongoose.model("prec",precSchema);
const Det=new mongoose.model("det",detSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  })
// userSchema.plugin(encrypt, {secret:process.env.SECRET,encryptedFields:["password"] });
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:80/auth/google/home1",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

var zl=[];
var imgArray = [];
var imgArray1 = [];
var imgArray2 = [];
var title1=[];
var fc=[];
var fr="";
const bk=[];
const qt=Quote.getRandomQuote();

var das=[];
app.get("/",(req,res)=>{
    res.render("home" ,{link:zl ,he:imgArray,qoute:qt});
})
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));
  app.get('/auth/google/home1',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home1');
  })
  app.get("/home1",(req,res)=>{
    res.render("home1",{link:zl ,he:imgArray,qoute:qt})
  })
  var ans=" ";
  app.get("/prec",(req,res)=>{


      res.render("prec" )
  })
  app.get("/doc",(req,res)=>{
    Prec.find({},(er,cd)=>{
        if(er){
            console.log(er);
        }else{

res.render("doc",{pats:cd})

        }
    })

  })
  app.post("/send",(req,res)=>{
      const det=new Det({
          name:req.body.fn,
          prescription:req.body.prescription,
          medicine:req.body.med,
      })
      det.save();



    })
    app.post("/see",(req,res)=>{

        var n=req.body.name;
        Det.find({name:n},(er,cd)=>{
            if(er){
                console.log(er);
            }else{
                res.render("detail",{pat:cd})

            }
        })
    })
  app.post("/pres",(req,res)=>{
      const pre=new Prec({
name:req.body.firstname,
blood:req.body.blod,
age:req.body.ag,
history:req.body.hist,

      })
      pre.save();


  })

app.get("/registe",(req,res)=>{
    res.render("registlog")
})
app.get("/dash",(req,res)=>{

    res.render("dashboard")
})

  app.get("/login",(req,res)=>{
res.render("login")
})
app.get("/register",(req,res)=>{
    res.render("register")
})
const bk1=[];
app.post("/ap",(req,res)=>{
    var a=req.body.fname;
    var b=req.body.age;
    bk.push(a);
    bk1.push(b);
    res.render("home1",{link:zl ,he:imgArray,qoute:qt})
})
// app.get("/secrets",(req,res)=>{
//   User.find({"secret": {$ne: null}},(er,fd)=>{
//       if(er){
//           console.log(er);
//       }else{
//           if(fd){

//               res.render("secrets",{userWithsecrets : das})
//           }
//       }
//   })
// })
app.post("/register",(req,res)=>{
User.register({username:req.body.username},req.body.password,(er,fd)=>{
    if(er){
        console.log(er);
    }else{
        passport.authenticate("local")(req,res,()=>{
            res.redirect("/")
        })
    }
})

})
app.get("/admin",(req,res)=>{
    res.render("admin",{link:bk,link1:bk1})
})
app.post("/getlink",(req,res)=>{
    const a=req.body.zoom;

    zl.push(a)
    res.redirect("/home1")


})
app.get("/book",(req,res)=>{
    res.render("book")
})
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/")
})
app.post("/login",(req,res)=>{
    const user= new User({
        username:req.body.username,
        pass:req.body.password
    })
    req.login(user,(er)=>{
        if(er){
        console.log(er);
        }else{
            passport.authenticate("local")(req,res,()=>{
                res.render("home1" ,{link:zl,he:imgArray,qoute:qt})
            })
        }
    })
})
app.get("/submit",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("submit")
    }else{
        res.redirect("/login")
    }
})
app.get("/dashboard",(req,res)=>{
    User.find({"secret": {$ne: null}},(er,fd)=>{
        if(er){
            console.log(er);
        }else{
            if(fd){

                res.render("dashboard",{ userWithsecrets : fd})
            }
        }
    })
})
app.post("/s",(req,res)=>{
    const su=req.body.dash;
    User.findById(req.user.id,(er,fd)=>{
        if(er){
            console.log(er);
        }else{
            if(fd){
                fd.dash=su;
                fd.save(()=>{
res.redirect("/dashboard")
                })
            }
        }
    })

})
app.get("/video",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("video" ,{he:imgArray,he1:imgArray1,he2:imgArray2,link:zl})
    }else{
        res.redirect("/")
    }
})
app.get("/videof",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("video1" ,{he:imgArray,link:zl,re:fc})
    }else{
        res.redirect("/")
    }
})
app.get("/video1",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("video2" ,{he1:imgArray1,link:zl,re:fr})
    }else{
        res.redirect("/")
    }
})
app.get("/video2",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("video3" ,{he2:imgArray2,link:zl})
    }else{
        res.redirect("/")
    }
})
app.get("/ide",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("ise")
    }else{
        res.redirect("/")
    }
})
app.get("/red",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("/registe")
    }
})
app.post("/submit",(req,res)=>{
    const sc=req.body.secret;
    console.log(req.user);

    User.findById(req.user.id , (err,founduser)=>{
        if(err){
            console.log(err);
        }else{

            if(founduser){
                founduser.secret=sc;
                founduser.save(()=>{
                    res.redirect("/secrets")
                })
            }
        }
    })

})


var Storage=multer.diskStorage({
    destination:"./public/upload/",
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
})

var Storage1=multer.diskStorage({
    destination:"./public/upload1/",
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
})

var Storage2=multer.diskStorage({
    destination:"./public/upload2/",
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
})
var upload=multer({
    storage:Storage
}).single('file')

var upload1=multer({
    storage:Storage1
}).single('file')
var upload2=multer({
    storage:Storage2
}).single('file')

app.post('/upload',upload,function(req,res,next){
    var success=req.file.fieldname+"uploaded succesfuly";
    res.redirect("/")
   })
   fs.readdir(directoryPath, function (err, files) {
       //handling error
       if (err) {
           return console.log('Unable to scan directory: ' + err);
       }
       //listing all files using forEach
       files.forEach(function (file) {
           // Do whatever you want to do with the file
        imgArray.push(file);
        console.log(file);
       //    const stat = fs.lstatSync(path.join(__dirname, 'upload'))
       // //    console.log(stat);
       // ff.push(stat)

       });
   });
   app.post('/upload1',upload1,function(req,res,next){
    var success=req.file.fieldname+"uploaded succesfuly";
    var b=req.body.title;
    title1.push(b);
    res.redirect("/admin")
   })
   fs.readdir(directoryPath1, function (err, files) {
       //handling error
       if (err) {
           return console.log('Unable to scan directory: ' + err);
       }
       //listing all files using forEach
       files.forEach(function (file) {
           // Do whatever you want to do with the file
        imgArray1.push(file);
        console.log(file);
       //    const stat = fs.lstatSync(path.join(__dirname, 'upload'))
       // //    console.log(stat);
       // ff.push(stat)

       });
   });
   app.post('/upload2',upload2,function(req,res,next){
    var success=req.file.fieldname+"uploaded succesfuly";
    res.redirect("/admin")
   })
   fs.readdir(directoryPath2, function (err, files) {
       //handling error
       if (err) {
           return console.log('Unable to scan directory: ' + err);
       }
       //listing all files using forEach
       files.forEach(function (file) {
           // Do whatever you want to do with the file
        imgArray2.push(file);
        console.log(file);
       //    const stat = fs.lstatSync(path.join(__dirname, 'upload'))
       // //    console.log(stat);
       // ff.push(stat)

       });
   });
   app.post("/fr",(req,res)=>{
       const a=req.body.frr;
       fc=a;
       console.log(fc);
       res.redirect("/video")
   })
   app.post("/br",(req,res)=>{
    const a=req.body.br;
    fr=a;
    console.log(fr);
    res.redirect("/video")
})
app.listen(80 || process.env.PORT,()=>{
    console.log("succes");
})
