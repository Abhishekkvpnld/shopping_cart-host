var createError = require('http-errors');
var express = require('express');
var app = express(); 
const fileUpload=require("express-fileupload")
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require('express-handlebars');
const session=require('express-session')
//database connection
const db = require('./dbconfig/connection');
//route setting
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');


// view engine setup
app.engine('hbs', hbs.engine({extname: 'hbs', defualtLayout : 'main' , layoutsDir: __dirname + '/views/layouts',partialsDir:__dirname+'/views/partials/'}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

//middleware setup
app.use(logger('dev')); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
 app.use(fileUpload());
 app.use(session({secret:"key",cookie:{maxAge:600000}}));
 //db connect
dbconfig=db
//router settiing 
app.use('/', userRouter); 
app.use('/admin',adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
