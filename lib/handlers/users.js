// USERS

const _data = require('../data')
const helpers = require('../helpers')
const verifyToken = require('../verifyToken')

var users = function (data, callback) {
	let acceptableMethods = ['post', 'get', 'put', 'delete']
	if (acceptableMethods.includes(data.method)) {
		_users[data.method](data, callback)
	} else {
		callback(405)
	}
}
// Contianer for users submethods
var _users = {}

// Users -post
// Required: firstName, lastName, phone, password, tosAgreement
// Optional: none
_users.post = function (data, callback) {
	//Check that all required fields are filled out
	let firstName = typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
	let lastName = typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
	let phone = typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false
	let password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
	let tosAgreement = typeof data.payload.tosAgreement === 'boolean' && data.payload.tosAgreement === true ? true : false

	if (firstName && lastName && phone && password && tosAgreement) {
		// Make sure that the user doesn't already exist
		_data.read('users', phone, function (err, data) {
			if (err) {
				// Hash the password
				var hashedPassword = helpers.hash(password);

				// Create the user object
				if (hashedPassword) {
					var userObject = {
						'firstName': firstName,
						'lastName': lastName,
						'phone': phone,
						'hashedPassword': hashedPassword,
						'tosAgreement': tosAgreement
					}

					_data.create('users', phone, userObject, (err) => {
						if (!err) {
							callback(200)
						} else {
							console.log(err)
							callback(500, { 'Error': 'Could not create the new user' })
						}
					})
				} else {
					callback(500, { 'Error': 'Cannot hash the password' })
				}
			} else {
				// User already exists
				callback(400, { 'Error': 'A user with that phone number already exists' })
			}
		})
	} else {
		callback(400, { 'Error': 'Missing Required Fields' })
	}
}

// Users -get
// Required data: phone
// Optional data: none
_users.get = function (data, callback) {
	// Check that the phone number is valid
	let phone = (
		typeof data.queryStringObject.phone == 'string' &&
		data.queryStringObject.phone.trim().length === 10
	) ? data.queryStringObject.phone.trim() : false
	if (phone) {
		// Get the token from the headers
		let token = typeof data.headers.token === 'string' ? data.headers.token : false
		// Verify that the token is valid for the phone number
		verifyToken(token, phone, tokenIsValid => {
			if (tokenIsValid) {
				// Lookup the user
				_data.read('users', phone, function (err, userData) {
					if (!err && userData) {
						// Remove the hashed password!
						delete userData.hashedPassword
						callback(200, userData)
					} else {
						callback(404)
					}
				})
			} else {
				callback(403, { 'Error': 'Missing required token in header, or token is invalid' })
			}
		})
	} else {
		callback(400, { 'Error': 'Missing required field' })
	}
}

// Users -put
// Required data: phone
// Optional data: (at least one of) firstName, lastName, password
_users.put = function (data, callback) {
	let firstName = typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
	let lastName = typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
	let phone = typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false
	let password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

	// Error if the phone is invalid
	if (phone) {
		// Get the token from the headers
		let token = typeof data.headers.token === 'string' ? data.headers.token : false
		// Verify that the token is valid for the phone number
		verifyToken(token, phone, tokenIsValid => {
			if (tokenIsValid) {
				if (firstName || lastName || password) {
					// Look up the user
					_data.read('users', phone, (err, userData) => {
						if (!err && userData) {
							// Update the fields
							if (firstName) {
								userData.firstName = firstName
							}
							if (lastName) {
								userData.lastName = lastName
							}
							if (password) {
								userData.hashedPassword = helpers.hash(password)
							}
							// Store the new updates
							_data.update('users', phone, userData, err => {
								if (!err) {
									callback(200)
								} else {
									console.log(err)
									callback(500, { 'Error': 'Could not update the user' })
								}
							})
						} else {
							callback(400, { 'Error': 'The specified user does not exist' })
						}
					})
				} else {
					callback(400, { 'Error': 'Missing field to update' })
				}
			} else {
				callback(403, { 'Error': 'Missing required token in header, or token is invalid' })
			}
		})
	} else {
		callback(400, { 'Error': 'Missing required field' })
	}
}

// Users - delete
// Required: phone
_users.delete = function (data, callback) {
	// Check that the phone number is valid
	let phone = (
		typeof data.queryStringObject.phone == 'string' &&
		data.queryStringObject.phone.trim().length === 10
	) ? data.queryStringObject.phone.trim() : false
	if (phone) {
		// Get the token from the headers
		let token = typeof data.headers.token === 'string' ? data.headers.token : false
		// Verify that the token is valid for the phone number
		verifyToken(token, phone, tokenIsValid => {
			if (tokenIsValid) {
				// Lookup the user
				_data.read('users', phone, function (err, userData) {
					if (!err && userData) {
						_data.delete('users', phone, (err) => {
							if (!err) {
                // Delete each of the cheks associated with the user
                let userChecks = typeof userData.checks === 'object' && userData.checks instanceof Array ? userData.checks : []
                let checksToDelete = userChecks.length
                if (checksToDelete > 0) {
                  let checksDeleted = 0;
                  let deletionErrors = false;
                  // Loop through the cheks
                  userChecks.forEach(checkId => {
                    // Delete the check
                    _data.delete('checks', checkId, err => {
                      if (err) {
                        deletionErrors = true
                      }
                      checksDeleted++;
                      if (checksDeleted === checksToDelete) {
                        if (!deletionErrors) {
                          callback(200)
                        } else {
                          callback(500, { 'Error': 'Errors encountered while attempting to delete all of the user\'s checks' })
                        }
                      }
                    })
                  })
                } else {
                  callback(200)
                }
							} else {
								callback(500, { 'Error': 'Could not delete the specified user' })
							}
						})
					} else {
						callback(400, { 'Error': 'Cannot find the specified user' })
					}
				})
			} else {
				callback(403, { 'Error': 'Missing required token in header, or token is invalid' })
			}
		})
	} else {
		callback(400, { 'Error': 'Missing required field' })
	}
}

module.exports = users;