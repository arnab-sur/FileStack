const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const { nextTick } = require('process')
//const handwritten = require('handwritten.js')
const fs = require('fs')
const { parse } = require("csv-parse");
const bodyParser = require('body-parser');
const multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname)
}
})

var upload = multer({ storage: storage })

app.set('views', './views');
app.set('view engine', 'pug');


//middlewares
app.use(express.json()) ;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get("/",(req,res) => {
    res.render('index') // For sending a html file
    //res.status(500) --> For sending a status code
})

app.get("/auth",(req,res)=>{
  console.log(req.query) ;
  fs.readFile("auth.json",(err,data)=>{
    if(err) throw err ;
    let users = JSON.parse(data);
    let files = users.map(m=>m.files)
    files = files.flat()
    for(i of users){
      if(i.email==req.query.email && i.password==req.query.password){
        const my_files = files.filter(f=>i.files.includes(f))
        console.log(files)
        return res.render("home",{name:i.name,email:i.email,access:i.access,password:i.password,all_files:files,my_files:my_files})
      }
    }
    res.send("Invalid Credentials") ;
  })
})
app.get("/register",(req,res)=>{
  fs.readFile("auth.json", function(err, data) {
      
    // Check for errors
    if (err) throw err;
   
    // Convert to JSON
    let users = JSON.parse(data);
    req.query.files = []
    console.log(req.query) ;
    users.push(req.query)
    fs.writeFile("auth.json", JSON.stringify(users), err => {
     
    // Check for errors
    if (err) throw err; 
    
    console.log("Done writing"); // Success
  });
    // res.status(200).json("Registered succesfully")
    res.render('home')
    
});

})

app.post("/addfile",upload.single('myfile'),(req,res)=>{
  // console.log(req.body)
  const email = req.body.email ;
  fs.readFile("auth.json", function(err, data) {
    let users = JSON.parse(data); 
    for(i of users){
      if(i.email==email){
        if(!i.files.includes(req.file.originalname)) i.files.push(req.file.originalname)
        fs.writeFile("auth.json", JSON.stringify(users), err => {    
          // Checking for errors
          if (err) throw err; 
          console.log("Done writing"); // Success
          // res.status(200).json("File uploaded successfully !!!")
          res.render('home')
      });
      break;
      }
    }
  })
})

app.get("/downloadfile",(req,res)=>{
  let filename = req.query.filename
  console.log(filename)
  res.download(path.join(__dirname, `uploads/${filename}`), (err)=>{
    console.log(err);
  });
})

app.get("/requestadmin",(req,res)=>{
  console.log(req.query)
  fs.readFile("auth.json", function(err, data) {
    let users = JSON.parse(data); 
    for(i of users){
      if(i.email==req.query.email){
        i.access = "admin"
        fs.writeFile("auth.json", JSON.stringify(users), err => {    
          // Checking for errors
          if(req.query.code == "getit07") return res.status(200).json("ACCESS GRANTED SUCCESFULLY")
          else return res.status(200).json("ACCESS DENIED")
          if (err) throw err; 
          console.log("Done writing"); // Success
      });
      break;
      }
    }
})
})

app.listen(port, () => {
    console.log(`Filestack listening at http://localhost:${port}`)
  })