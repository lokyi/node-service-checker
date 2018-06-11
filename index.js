// API ENTRY POINT

const server = require('./lib/server')
const workers = require('./lib/workers')
const cli = require('./lib/cli')

// Declare the app
const app = {}

// Init function
app.init = function (callback) {
  // Start the server
  server.init()

  // Start the workers
  // workers.init()

  // Start the CLI, but make sure it starts last
  setTimeout(() => {
    cli.init();
    callback()
  }, 50);
}

// Self execute only when it is being invoked directly
if (require.main === module) {
  app.init(() => {})
}

module.exports = app