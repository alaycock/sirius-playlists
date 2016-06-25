const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
const monk = require('monk');
const hpp = require('hpp');

var getSong = require('./routes/getsong');

var mongoURL = process.env.MONGO_DB;
var db = monk(mongoURL);

// create the express app
var app = express();

app.use(logger('dev'));

// trust the proxy that we're behind, aka, the server's ttl terminator
app.set('trust proxy', '127.0.0.1');

// load security modules
app.use(helmet({
  hsts: {
    maxAge: 7776000000, // 90 days in ms
    preload: true,
    force: true
  }
}));

if (app.get('env') === 'development') {

  // debug request querues during development
  require('request-debug')(require('request'));

  // allow cross domain requests during development
  // app.use(require('cors')());
}

app.use(bodyParser.json());
app.use(cookieParser());

// protect against HTTP Parameter Pollution attacks
app.use(hpp({
  checkBody: false
}));

// results are compressed when the data in the payload exceeds 1KB
app.use(compression());

// Only doing this until I rewrite getsong.js
app.use(function(req, res, next){
  req.db = db;
  next();
});


app.use('/getsong', getSong);

app.use(express.static('public'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message
    });
});

module.exports = app;
