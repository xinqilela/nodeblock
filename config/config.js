var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'nodeblock'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/nodeblock-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'nodeblock'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/nodeblock-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'nodeblock'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/nodeblock-production'
  }
};

module.exports = config[env];
