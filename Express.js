const express=require("express");
const app=express();
const helmet = require('helmet');
const clientSessions = require('client-sessions');
const HTTP_PORT = process.env.PORT || 8080; 

//a sample user
const user={
    username:"ttsao3",
    password:"123123123",
    email:"ttsao3@myseneca.ca",
    address: "8th the seneca way",
    pincode: "8898",
};

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      next();
    }
}

//register ejs as the rendering engin for views
app.set("view engine", "ejs");
app.use(helmet());

//setup client sessions
app.use(
  clientSessions({
    cookieName: 'session', // this is the object name that will be added to 'req'
    secret: 'demo', // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

app.use(express.urlencoded({ extended: true }));

//add the session to use app.locals
app.use((req,res,next)=>{
    app.locals.session=req.session;
    next();
})

//setup route to direct the user to /login
app.get('/', ensureLogin, (req, res) => {
  res.redirect('/login');
});

//display login html page 
app.get('/login', (req,res)=>{
    res.render('login',{
        errorMsg:""
    });
});

//adding a login route that will add the user to the session
app.post('/login', (req, res) => {
  const username=req.body.username;
  const password=req.body.password;
    if (username === "" || password === "") {
    res.render('login', { 
        errorMsg:"missing credentials"
        });
  } else {
    if(username == user.username && password == user.password){
        req.session.user={
            username: user.username,
            email: user.email,
            address: user.address,
            pincode: user.pincode,
        };
        res.redirect('/profile');
    }else{
        res.render('login',{
            errorMsg: "Invalid username or password, please enter again"
        });
    }
  }
});

//log a user out by destroying the session
app.get("/logout", (req,res)=>{
    req.session.reset();
    res.redirect("/login");
})

//an authenticated route 
app.get("/profile", ensureLogin, (req,res)=>{
    res.render("profile");
})

app.use((req,res,next)=>{
    res.status(404).render("404");
})

app.listen(HTTP_PORT, () => console.log(`The server is listening on ${HTTP_PORT}`));