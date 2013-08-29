/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , docs = require('./routes/docs')
  , db = require('./modules/db')(mongoose);

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html', require('jade').__express);
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('appsecretLoL'));
app.use(express.cookieSession({ secret: 'appsecretLoL', cookie: { maxAge: 60 * 60 * 1000 }}));
app.use(app.router);
//app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, "/public")));
app.use("/docs", express.static(__dirname + "/doc"));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// route maps
app.get('/', routes.index);

//init server
app.listen(3000);