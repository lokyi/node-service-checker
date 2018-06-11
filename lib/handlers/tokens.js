// Tokens

const _data = require('../data')
const helpers = require('../helpers')

let _performance = require('perf_hooks').performance
let util = require('util')
let debug = util.debuglog('performance')

const tokens = function (data, callback) {
	let acceptableMethods = ['post', 'get', 'put', 'delete']
	if (acceptableMethods.includes(data.method)) {
		_tokens[data.method](data, callback)
	} else {
		callback(405)
	}
}

const _tokens = {}

// Token - post
// Required: phone, password
// Optional: none
_tokens.post = function (data, callback) {
	_performance.mark('entered function')
	//Check that all required fields are filled out
	let phone = typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false
	let password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

	_performance.mark('inputs validated')
	if (phone && password) {
		// Make sure that the user doesn't already exist
		_data.read('users', phone, function (err, userData) {
			_performance.mark('user lookup complete')
			if (!err && userData) {
				// Hash and compare the password
				let hashedPassword = helpers.hash(password)
				_performance.mark('password hashing complete')
				if (hashedPassword == userData.hashedPassword) {
					//If valid, create a new token with a random name, Set expiration date 1 hour in the future
					_performance.mark('creating data for token')
					let tokenId = helpers.createRandomString(20)
					let expires = Date.now() + 1000 * 60 * 60

					let tokenObject = { 'phone': phone, 'id': tokenId, 'expires': expires }

					// Store Token
					_data.create('tokens', tokenId, tokenObject, err => {
						_performance.mark('storing token complete')

						// Gather all the measurements
						_performance.measure('End to end', 'entered function', 'storing token complete')
						_performance.measure('user look up', 'inputs validated', 'user lookup complete')

						let measurements = _performance.getEntriesByType('measure')
						measurements.forEach(measurement => {
							debug('\x1b[33,%s\x1b[0m', measurement.name + ' ' + measurement.duration)
						})

						if (!err) {
							callback(200, tokenObject)
						} else {
							callback(500, { 'Error': 'Could not create the new token' })
						}
					})
				} else {
					callback(400, { 'Error': 'Password did not match the specified user\'s stored password' })
				}
			} else {
				callback(400, { 'Error': 'Could not find the specified user' })
			}
		})
	} else {
		callback(400, { 'Error': 'Missing Required Fields' })
	}
}

// Tokens - get
// Required data: id
// Optional data: none
_tokens.get = function (data, callback) {
	let id = (
		typeof data.queryStringObject.id == 'string' &&
		data.queryStringObject.id.trim().length === 20
	) ? data.queryStringObject.id.trim() : false
	if (id) {
		// Lookup the user
		_data.read('tokens', id, function (err, tokenData) {
			if (!err && tokenData) {
				callback(200, tokenData)
			} else {
				callback(404)
			}
		})
	} else {
		callback(400, { 'Error': 'Missing required field' })
	}
}

// Tokens - put
// Required data: id, extend
// Optional data: none
_tokens.put = function (data, callback) {
	let id = (
		typeof data.payload.id === 'string' &&
		data.payload.id.trim().length === 20
	) ? data.payload.id.trim() : false
	let extend = typeof data.payload.extend === 'boolean' && data.payload.extend === true ? true : false

	// Error if the phone is invalid
	if (id && extend) {
		// Look up the tokem
		_data.read('tokens', id, (err, tokenData) => {
			if (!err && tokenData) {
				// Check to make sure that the token isn't already expired
				if (tokenData.expires > Date.now()) {
					// Update the fields
					tokenData.expires += 1000 * 60 * 60
					// Store the new updates
					_data.update('tokens', id, tokenData, err => {
						if (!err) {
							callback(200)
						} else {
							console.log(err)
							callback(500, { 'Error': 'Could not update the token' })
						}
					})
				} else {
					callback(400, { 'Error': 'The token has already expired, and cannot be extended' })
				}
			} else {
				callback(400, { 'Error': 'The specified token does not exist' })
			}
		})
	} else {
		callback(400, { 'Error': 'Missing required field(s) or field(s) are invalid' })
	}
}

// Token - delete
// Required data: id
// Optional data: none
_tokens.delete = function (data, callback) {
	// Check that the phone number is valid
	let id = (
		typeof data.queryStringObject.id == 'string' &&
		data.queryStringObject.id.trim().length === 20
	) ? data.queryStringObject.id.trim() : false
	if (id) {
		// Lookup the user
		_data.read('tokens', id, function (err, tokenData) {
			if (!err && tokenData) {
				_data.delete('tokens', id, (err) => {
					if (!err) {
						callback(200)
					} else {
						callback(500, { 'Error': 'Could not delete the specified token' })
					}
				})
			} else {
				callback(400, { 'Error': 'Cannot find the specified token' })
			}
		})
	} else {
		callback(400, { 'Error': 'Missing required field' })
	}
}

module.exports = tokens;