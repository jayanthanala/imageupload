require('dotenv').config()
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
var multer  = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});
var upload = multer({ storage: storage })

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");


mongoose.connect("mongodb+srv://manishreddy:"+process.env.DBPASS+"@webdatabase.rbrhg.mongodb.net/manishDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

//mongoose.connect("mongodb://localhost:27017/manishDB",{useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify:true});


const imgSchema = new mongoose.Schema({
    img: {
        data: Buffer,
        contentType: String
    }
});

const Image = mongoose.model("Image",imgSchema);

const adminSchema = new mongoose.Schema({
  username:String,
  password:String
});

const Admin = mongoose.model("Admin",adminSchema);

var admin = new Admin({
  username:"Manish",
  password:"9000072033"
});

// admin.save();

app.get("/",(req,res) => {
    Image.find({},function(err,results){
        if(err){
            console.log(err);
        }else{
            res.render("pictures",{items: results.reverse(),title: "My Recent Works"});
        }
    });
});

app.get("/upload",(req,res) => {
    res.render("login");
});

app.post("/upload",(req,res) => {
    Admin.findOne({},function(err, results){
      if(err){
        console.log(err);
      }else{

        if(req.body.username === results.username && req.body.password === results.password){
          res.render("app",{Name: req.body.username});
        }else{
          res.send("Wrong Credential Entered");
        }
      }
    });
});

app.post('/imgupload', upload.single('image'), function (req, res, next) {
    var image = new Image({
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    });
    image.save();
    res.render("app",{Name: req.body.username});
});

app.get('/change',(req,res) => {
  res.render("change");
});

app.post("/change",(req,res) => {

  Admin.find({},function(err,result){
    if(err){
      console.log(err);
    }else{

      if(result[0].password === req.body.oldpass && req.body.newpass === req.body.newpass1){
        Admin.findOneAndUpdate({username:"Manish"},{password: req.body.newpass},function(err,results){
          if(err){
            console.log(err);
          }else{
            res.redirect("/upload")
          }
        });
      }else{
        res.send("The creds you entered might be wrong. Check again!")
      }
    }
  });
});

app.listen(process.env.PORT || 3000,function(){
    console.log("Server is up at "+process.env.PORT);
});
