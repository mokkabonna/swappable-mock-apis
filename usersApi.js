var express = require('express');
var app = express();

app.get('/users', function(req, res) {
  res.status(200).send([{
    id: 1,
    name: 'Eric'
  }])
});

module.exports = app;
