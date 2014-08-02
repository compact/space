/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
// var mongoose = require('mongoose');
// var passport = require('passport');
// var db = require('./modules/db')(mongoose);

// Express middleware
var morgan = require('morgan');
var bodyParser = require('body-parser');
// var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');

var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
//app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(morgan('dev'));
app.use(bodyParser.raw());
// app.use(methodOverride());
app.use(cookieParser('appsecretLoL', { maxAge: 60 * 60 * 1000 }));

//app.use(app.router);

// set the static dir, which defaults to dist
app.use(express.static(path.join(
  __dirname,
  process.env.NODE_ENV === 'development' ? 'app' : 'dist'
)));

// start the ephemeris API
// require('./ephemeris-api')(app);

// development only
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
}

//init server
app.listen(3001);
