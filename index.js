// API ENTRY POINT

// Dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./lib/config')
const fs = require('fs')
const handlers = require('./lib/handlers')
const helpers = require('./lib/helpers')

// HTTP server
var httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res)
})
httpServer.listen(config.httpPort, function () {
  console.log(`The server is listening on port ${config.httpPort} now`)
})

// HTTPS server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res)
})
httpsServer.listen(config.httpsPort, function () {
  console.log(`The server is listening on port ${config.httpsPort} now`)
})

// Server logic
var unifiedServer = function (req, res) {
  // Get the url and parse it
  let parsedUrl = url.parse(req.url, true)
  // Get the path
  let path = parsedUrl.pathname
  let trimmedPath = path.replace(/^\/+|\/+$/g, '')

  // Get the query string as an object
  let queryStringObj = parsedUrl.query

  // Get the HTTP method
  let method = req.method.toLowerCase()

  //Get the headers as an object
  let headers = req.headers

  // Get the payload, if any
  let decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', function (data) {
    buffer += decoder.write(data)
  })
  req.on('end', function () {
    buffer += decoder.end()

    // Choose the handler
    let chosenHandler = trimmedPath in router ? router[trimmedPath] : handlers.notFound;

    // Construct the data object
    let data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObj,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    }

    // Router the request
    chosenHandler(data, function (statusCode = 200, payload = {}) {
      let payloadString = JSON.stringify(payload)

      // Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)

      // log the request
      console.log('Returning this response: ', statusCode, payloadString)
    })
  })
}

//Define a request router
var router = {
  'ping' : handlers.ping,
  'users' : handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks 
}