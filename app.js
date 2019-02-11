var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var logger = require('morgan');

var Logger = require('./utils/logger');
var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(cookieParser());
app.use(cors());

app.use('/api/v1', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  Logger.error('An error occurred', err);

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.json(err);
});

module.exports = app;
