// API ENTRY POINT

const server = require('./lib/server')
const workers = require('./lib/workers')
const cli = require('./lib/cli')
const cluster = require('cluster')
const os = require('os')

// Declare the app
const app = {}

// Init function
app.init = function (callback) {
  if (cluster.isMaster) {
    // Start the workers
    // workers.init()

    // Start the CLI, but make sure it starts last
    setTimeout(() => {
      cli.init();
      callback()
    }, 50);

    // Fork the process
    for (let i = 0; i < os.cpus().length; i++) {
      cluster.fork();
    }
  } else {
    // Start the server
    server.init()
  }
}

// Self execute only when it is being invoked directly
if (require.main === module) {
  app.init(() => {})
}

module.exports = app