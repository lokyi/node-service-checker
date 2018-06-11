/*
 * API Tests
 */

 const app = require('../index')
 const assert = require('assert')
 const http = require('http')
 const config = require('../lib/config')

 let api = {}

let helpers = {}

helpers.makeGetRequest = function (path, callback) {
	// Configure the request details
	let requestDetails = {
		'protocol': 'http:',
		'hostname': 'localhost',
		'port': config.httpPort,
		'method': 'GET',
		'path': path,
		'headers': {
			'COntent-Type': 'application/json'
		}
	}
	// Send the request
	let req = http.request(requestDetails, res => {
		callback(res)
	})
	req.end()
}

// The main init() function should be able to run without throwing
api['app.init should start without throwing'] = function (done) {
	assert.doesNotThrow(() => {
		app.init(() => {
			done()
		})
	}, TypeError)
}

// Make a request to /ping
api['/ping should respond to GET with 200'] = function (done) {
	helpers.makeGetRequest('/ping', function (res) {
		assert.equal(res.statusCode, 200)
		done()
	})
}

// Make a request to /api/users
api['/api/users should respond to GET with 400'] = function (done) {
	helpers.makeGetRequest('/api/users', function (res) {
		assert.equal(res.statusCode, 400)
		done()
	})
}

// Make a request to a random path
api['A random path should respond to GET with 404'] = function (done) {
	helpers.makeGetRequest('/asdfdsfa/dsfsdf', function (res) {
		assert.equal(res.statusCode, 404)
		done()
	})
}

 module.exports = api
