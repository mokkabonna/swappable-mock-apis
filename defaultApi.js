var express = require('express');
var app = express();

app.get('/articles', function(req, res) {
  res.status(200).send([{
    id: 1
  }])
});

module.exports = app;
