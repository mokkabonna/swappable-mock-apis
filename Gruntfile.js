/*jshint node:true*/
'use strict';

module.exports = function(grunt) {
  var _ = require('lodash');
  var express = require('express');
  var url = require('url');
  var proxyMiddleware = require('proxy-middleware');

  //define the apis our app uses and the default module for the express server and what port it should start on
  //Also where it is attached on the local server
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

  /**
   * Iterates all our mock servers and sets up a proxy either to the predefined mock
   * or to the supplied url given in the command line arguments
   */
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

  /**
   * Injects a proxy middleware catching all the requests to route and forwarding them to apiUrl
   */
  function attachProxy(middlewares, route, apiUrl) {
    var proxyConfig = url.parse(apiUrl);
    proxyConfig.route = route;
    //place before other middlewares
    middlewares.unshift(proxyMiddleware(proxyConfig));

    grunt.log.writeln('Requests to ' + route + ' will be forwared to ' + apiUrl);
  }

  /**
   * Start the mock according to the mock config
   */
  function startMock(config, name) {
    var mockServer = require(config.mockServer);
    mockServer.listen(config.port);

    grunt.log.writeln('Started mock server ' + name + ' on localhost:' + config.port);
  }

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
