/*
 * Request handlers
*/
const users = require('./users')
const tokens = require('./tokens')
const checks = require('./checks')
const pages = require('./pages')
const helpers = require('../helpers')

//Define the handlers
var handlers = {}

handlers.index = pages.index

handlers.accountCreate = pages.accountCreate
handlers.accountEdit = pages.accountEdit
handlers.accountDeleted = pages.accountDeleted

handlers.sessionCreate = pages.sessionCreate
handlers.sessionDeleted = pages.sessionDeleted

handlers.checksCreate = pages.checksCreate
handlers.checksList = pages.checksList
handlers.checksEdit = pages.checksEdit

// Example error
handlers.exampleError = function (data, callback) {
	let error = new Error('This is an example error')

	throw error
}

// Favicon
handlers.favicon = function (data, callback) {
	if (data.method === 'get') {
		// Read in the favicon's data
		helpers.getStaticAsset('favicon.ico', (err, data) => {
			if (!err && data) {
				callback(200, data, 'favicon')
			} else {
				callback(500)
			}
		})
	} else {
		callback(405)
	}
}

// Serve Public Assets
handlers.public = function (data, callback) {
	if (data.method === 'get') {
		// Get the filename being requested
		let trimmedAssetName = data.trimmedPath.replace('public/', '').trim()
		if (trimmedAssetName.length > 0) {
			// Read in the asset's data
			helpers.getStaticAsset(trimmedAssetName, (err, data) => {
				if (!err && data) {
					// Determine the content type (default to plain text)
					let contentType = 'plain'
					if (trimmedAssetName.includes('.css')) {
						contentType = 'css'
					}
					if (trimmedAssetName.includes('.png')) {
						contentType = 'png'
					}
					if (trimmedAssetName.includes('.jpg')) {
						contentType = 'jpg'
					}
					if (trimmedAssetName.includes('.ico')) {
						contentType = 'favicon'
					}
					callback(200, data, contentType)
				} else {
					callback(404)
				}
			})
		} else {
			callback(404)
		}
	} else {
		callback(405)
	}
}

// JSON API Handlers

handlers.users = users

handlers.tokens = tokens

handlers.checks = checks

// Ping handler
handlers.ping = function (data, callback) {
	callback(200)
}

//Not found handler
handlers.notFound = function (data, callback) {
	callback(404)
}

module.exports = handlers;