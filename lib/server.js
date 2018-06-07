/*
 * Server related tasks
 */

const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')
const fs = require('fs')
const handlers = require('./handlers')
const helpers = require('./helpers')
const path = require('path')
const util = require('util')
const debug = util.debuglog('server')

const server = {}

// HTTP server
server.httpServer = http.createServer(function (req, res) {
	server.unifiedServer(req, res)
})

// HTTPS server
server.httpsServerOptions = {
	'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
	'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}
server.httpsServer = https.createServer(server.httpsServerOptions, function (req, res) {
	server.unifiedServer(req, res)
})

// Server logic
server.unifiedServer = function (req, res) {
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
	req.on('data', data => {
		buffer += decoder.write(data)
	})
	req.on('end', () => {
		buffer += decoder.end()

		// Choose the handler
		let chosenHandler = trimmedPath in this.router ? this.router[trimmedPath] : handlers.notFound;

    // If the request is within the public directory, use the public handler
    chosenHandler = trimmedPath.startsWith('public/') ? handlers.public : chosenHandler

		// Construct the data object
		let data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObj,
			'method': method,
			'headers': headers,
			'payload': helpers.parseJsonToObject(buffer)
		}

		// Router the request
		chosenHandler(data, (statusCode = 200, payload, contentType = 'json') => {
      let payloadString = ''
			// Return the response-parts that are content-specific
			if (contentType === 'json') {
				res.setHeader('Content-Type', 'application/json')
        payload = typeof payload === 'object' ? payload : {}
        payloadString = JSON.stringify(payload)
			} else if (contentType === 'html') {
        res.setHeader('Content-Type', 'text/html')
        payloadString = typeof payload === 'string' ? payload : ''
			} else if (contentType === 'favicon') {
        res.setHeader('Content-Type', 'image/x-icon')
        payloadString = payload || ''
      } else if (contentType === 'css') {
        res.setHeader('Content-Type', 'text/css')
        payloadString = payload || ''
      } else if (contentType === 'png') {
        res.setHeader('Content-Type', 'image/png')
        payloadString = payload || ''
      } else if (contentType === 'jpg') {
        res.setHeader('Content-Type', 'image/jpeg')
        payloadString = payload || ''
      } else if (contentType === 'plain') {
        res.setHeader('Content-Type', 'text/plain')
        payloadString = payload || ''
      }

			// Return the response-parts that are common to all content-types
			res.writeHead(statusCode)
			res.end(payloadString)

			// If the response is 200, print green otherwise print red
			if (statusCode === 200) {
				debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode)
			} else {
				debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode)
			}
		})
	})
}

//Define a request router
server.router = {
	'': handlers.index,
	'account/create': handlers.accountCreate,
	'account/edit': handlers.accountEdit,
	'account/deleted': handlers.accountDeleted,
	'session/create': handlers.sessionCreate,
	'session/deleted': handlers.sessionDeleted,
	'checks/all': handlers.checksList,
	'checks/create': handlers.checksCreate,
	'checks/edit': handlers.checksEdit,
	'ping': handlers.ping,
	'api/users': handlers.users,
	'api/tokens': handlers.tokens,
  'api/checks': handlers.checks,
  'favicon.ico': handlers.favicon,
  'public': handlers.public
}

// Init server
server.init = function () {
	// Start the HTTP server
	this.httpServer.listen(config.httpPort, function () {
		console.log('\x1b[35m%s\x1b[0m', `The HTTP server is listening on port ${config.httpPort} now`)
	})

	// Start the HTTPS server
	this.httpsServer.listen(config.httpsPort, function () {
		console.log('\x1b[35m%s\x1b[0m', `The HTTPS server is listening on port ${config.httpsPort} now`)
	})
}

module.exports = server