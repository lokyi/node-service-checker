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

		// Construct the data object
		let data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObj,
			'method': method,
			'headers': headers,
			'payload': helpers.parseJsonToObject(buffer)
		}

		// Router the request
		chosenHandler(data, (statusCode = 200, payload = {}) => {
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
server.router = {
	'ping': handlers.ping,
	'users': handlers.users,
	'tokens': handlers.tokens,
	'checks': handlers.checks
}

// Init server
server.init = function () {
	// Start the HTTP server
	this.httpServer.listen(config.httpPort, function () {
		console.log(`The HTTP server is listening on port ${config.httpPort} now`)
	})

	// Start the HTTPS server
	this.httpsServer.listen(config.httpsPort, function () {
		console.log(`The HTTPS server is listening on port ${config.httpsPort} now`)
	})
}

module.exports = server