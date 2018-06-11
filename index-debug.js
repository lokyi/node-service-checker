// API ENTRY POINT

const server = require('./lib/server')
const workers = require('./lib/workers')
const cli = require('./lib/cli')

const exampleDebuggingProblem = require('./lib/exampleDebuggingProblem')

// Declare the app
const app = {}

// Init function
app.init = function () {
  // Start the server
  debugger
  server.init()
  debugger
  // Start the workers
  //debugger
  // workers.init()
  //debugger

  
  // Start the CLI, but make sure it starts last
  debugger
  setTimeout(() => {
    cli.init();
    debugger
  }, 50);
  debugger
  
  // set foo t 1
  let foo = 1
  // increament foo
  console.log('Just assigned 1 to foo')
  debugger
  foo++
  console.log('just incremented')
  debugger
  // Square foo
  foo = foo * foo
  debugger
  foo = foo.toString()
  debugger
  exampleDebuggingProblem.init()
  debugger
}

app.init()

module.exports = app