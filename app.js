// REQUIRED
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


// DB CONFIG
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/parking", {native_parser:true});

// ROUTES IMPORT
var routes = require('./routes/index');

// GENERATE APP
var app = express();

// VIEW ENGINE SETUP
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// SERVER & SOCKET.IO
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

var io = require('socket.io').listen(server);

// SOCKETS CONTROLLER
require('./socket')(io, db);

// ADD HEADERS
app.use(function (req, res, next) {

    // ALLOW CONNECTION
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');

    // ALLOW METHODS
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // ALLOW HEADERS
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // ALLOW COOKIES
    res.setHeader('Access-Control-Allow-Credentials', true);

    // NEXT
    next();
});

// DB & SOCKET ACCESS
app.use(function(req,res,next){
    req.db = db; // db accessible to our router
    req.io = io; // socket io accessible to our router
    next();
});

// ROUTES
app.use('/', routes);

/// 404
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
