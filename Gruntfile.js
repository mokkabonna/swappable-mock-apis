/*jshint node:true*/
'use strict';

module.exports = function(grunt) {
  var _ = require('lodash');
  var express = require('express');
  var url = require('url');
  var proxyMiddleware = require('proxy-middleware');

  var mockServers = {
    defaultApi: {
      attachTo: '/api',
      port: 9101,
      mockServer: './defaultApi.js'
    },
    usersApi: {
      attachTo: '/otherApi',
      port: 9102,
      mockServer: './usersApi.js'
    }
  };

  function injectProxyMiddlewares(middlewares) {
    _.each(mockServers, function(config, name) {
      var overrideUrl = grunt.option(name);

      if (overrideUrl) {
        //jsut attach the url to the normal path
        attachProxy(middlewares, config.attachTo, overrideUrl);
      } else {
        //start normal mock
        startMock(config, name)
        attachProxy(middlewares, config.attachTo, 'http://localhost:' + config.port);
      }
    });
  }

  function attachProxy(middlewares, route, apiUrl) {
    var proxyConfig = url.parse(apiUrl);
    proxyConfig.route = route;
    //place before other middlewares
    grunt.log.writeln('Forwarding requests to ' + route + ' to ' + apiUrl);
    middlewares.unshift(proxyMiddleware(proxyConfig));
  }

  function startMock(config, name) {
    var mockServer = require(config.mockServer);
    grunt.log.writeln('Starting mock server ' + name + ' on localhost:' + config.port);
    mockServer.listen(config.port);
  }

  // Define the configuration for all the tasks
  grunt.initConfig({
    connect: {
      devServer: {
        options: {
          port: 9001,
          hostname: 'localhost',
          keepalive: true,
          base: [
            'app'
          ],
          middleware: function(connect, options, middlewares) {
            injectProxyMiddlewares(middlewares);
            return middlewares;
          }
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-connect');

};
