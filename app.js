require('dotenv').config()
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
var multer = require('multer');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  }
});
var upload = multer({
  storage: storage
})

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.set("view engine", "ejs");


mongoose.connect("mongodb+srv://manishreddy:"+process.env.DBPASS+"@webdatabase.rbrhg.mongodb.net/manishDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// mongoose.connect("mongodb://localhost:27017/manishDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false
// });


const imgSchema = new mongoose.Schema({
  img: {
    data: Buffer,
    contentType: String
  }
});

const Image = mongoose.model("Image", imgSchema);

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

const Admin = mongoose.model("Admin", adminSchema);

// var admin = new Admin({
//   username:"Manish",
//   password:"9000072033"
// });

// admin.save();

var result = Image.find({},function(err, results){})

var islogged = false;


app.get("/", (req, res) => {

  islogged = false;

  result.exec((err, s) => {
    if (err) {
      console.log(err);
    } else {
      res.render("pictures", {
        items: s.reverse()
      });
    }
  });

});

app.get("/upload", (req, res) => {

  if(islogged === true){
    res.render("admin");
  }else{
    res.render("login");
  }

});

app.post("/upload", (req, res) => {
  Admin.findOne({}, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      if (req.body.username === results.username && req.body.password === results.password) {
        islogged = true;
        res.render("admin");
      } else {
        islogged = false;
        res.send("Wrong Credential Entered");
      }
    }
  });
});



app.post('/imgupload', upload.single('image'), function(req, res, next) {
  var image = new Image({
    img: {
      data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      contentType: 'image/png'
    }
  });
  image.save();
  res.render("admin");
});



app.get("/delete",(req,res) => {

  if(islogged === true){
    result.exec((err, s) => {
      if (err) {
        console.log(err);
      } else {
        res.render("delete",{items:s.reverse()});
      }
    });
  }else{
    res.redirect("/upload")
  }

});

app.post("/delete", (req, res) => {
  //console.log(req.body.picture);
  Image.deleteOne({
    _id: req.body.picture
  },(err, done) => {
    if (err) {
      console.log(err);
    } else {
      result.exec((err, s) => {
        if (err) {
          console.log(err);
        } else {
          res.render("delete", {
            items: s.reverse()
          });
        }
      });
    }
  });
});

app.get("/signout",(req,res) => {
  islogged = false;
  res.redirect("/upload")
});
///////////////////////////    CHANGE PASSWORD /////////////////////////////////

app.get('/change', (req, res) => {
  res.render("change");
});

app.post("/change", (req, res) => {
  Admin.find({},(err, results) => {
    if (err) {
      console.log(err);
    } else {
      if (results[0].password === req.body.oldpass && req.body.newpass === req.body.newpass1) {
        Admin.findOneAndUpdate({
          username: results[0].username
        }, {
          password: req.body.newpass
        }, (err, results) => {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/upload")
          }
        });
      } else {
        res.send("The creds you entered might be wrong. Check again!")
      }
    }
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server is up at " + process.env.PORT);
});
