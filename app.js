require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var path = require('path')
const _dirname = path.resolve()

require("./models/model")

const cors=require("cors")

const mongoose=require("mongoose")
mongoose.connect(process.env.MONGO_URL)

mongoose.connection.on("connected",()=>{
  console.log("successfully connected to mongo")
})
mongoose.connection.on("error",()=>{
  console.log("not connected to mongo")
})

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth')
var postRouter = require('./routes/post')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth',authRouter);
app.use('/post',postRouter)
// app.use("/",(req,res)=>{
//   res.json({message:"chalo chal rha hai"})
// })
//  change for deploy the website
// app.use(express.static(path.join(_dirname,"/frontend/dist")))
// app.get('*',(req,res)=>{
//     res.sendFile(path.resolve(_dirname,"frontend","dist","index.html"))
// })

const server = app.listen(process.env.PORT, () => {
  console.log("Server is running on port", process.env.PORT);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
