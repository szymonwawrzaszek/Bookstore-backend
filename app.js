const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require('express-session');
const SessionStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const multer = require('multer');
const path = require('path');

//const sequelize = require('./database/context');
//const associations = require('./database/associations');
const User = require('./models/user');
const authRoutes = require('./routes/authentication-routes');
const bookRoutes = require('./routes/book-routes');
const authorRoutes = require('./routes/author-routes');
const publisherRoutes = require('./routes/publisher-routes');
const errorRoutes = require('./routes/errors');
const CONFIG = require('./config');

const connectionString = CONFIG.ConnectionString

const app = express();
//const csurfProtection = csurf();
const store = new SessionStore({
    uri: connectionString,
    collection: 'sessions'
});

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString().replace(':', '-').replace(':', '-').replace('.', '-') + '-' + file.originalname);
    }
  });
  
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
  );
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));  

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));
//app.use(csurfProtection);

app.use((req, res, next) => {
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

// app.use((req, res, next) => {
//     const email =  req.session.user ? req.session.user.email : "";
//     //const email =  req.session.user ? req.session.user.email.split('@')[0] : "";

//     res.locals.isAuthenticated = req.session.isLoggedIn;
//     res.locals.username = email;
//     res.locals.csrfToken = req.csrfToken();
//     //console.log("isAuth", res.locals.isAuthenticated)
//     next();
// });

app.get('/',(req, res, next) => {
    res.render('./home', {
        title: "Home"
    })
})

app.use(authRoutes);
app.use(bookRoutes);
app.use(authorRoutes);
app.use(publisherRoutes);

app.use((error, req, res, next) => {
        // res.status(error.httpStatusCode).render(...);
        // res.redirect('/500');
        //res.status(500).render('error', {
        //  title: 'Error',
        //  message: error.message
        //});
        const status = error.httpStatusCode || 500;
        const message = error.message;
        //const data = error.data;
        res.status(status).json({ message: message });
      });
app.use(errorRoutes);

mongoose.connect(connectionString)
    .then(() => app.listen(8080))
    .catch(err => {
        console.log(err)
        console.log("Not connected with db!!!")
    })