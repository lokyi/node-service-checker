/*
 * Request handlers
*/

const _data = require('./data')
const helpers = require('./helpers')

//Define the handlers
var handlers = {}

// USERS
handlers.users = function (data, callback) {
  let acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.includes(data.method)) {
    handlers._users[data.method](data, callback)
  } else {
    callback(405)
  }
}
// Contianer for users submethods
handlers._users = {}

// Users -post
// Required: firstName, lastName, phone, password, tosAgreement
// Optional: none
handlers._users.post = function (data, callback) {
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
          callback(500, { 'Error': 'Cannot hash the password'})
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
handlers._users.get = function (data, callback) {
  // Check that the phone number is valid
  let phone = (
    typeof data.queryStringObject.phone == 'string' &&
    data.queryStringObject.phone.trim().length === 10
  ) ? data.queryStringObject.phone.trim() : false
  if (phone) {
    // Get the token from the headers
    let token = typeof data.headers.token === 'string' ? data.headers.token : false
    // Verify that the token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, tokenIsValid => {
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
handlers._users.put = function (data, callback) {
  let firstName = typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
  let lastName = typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
  let phone = typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false
  let password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

  // Error if the phone is invalid
  if (phone) {
    // Get the token from the headers
    let token = typeof data.headers.token === 'string' ? data.headers.token : false
    // Verify that the token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, tokenIsValid => {
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
// TODO: delete any other file associated
handlers._users.delete = function (data, callback) {
  // Check that the phone number is valid
  let phone = (
    typeof data.queryStringObject.phone == 'string' &&
    data.queryStringObject.phone.trim().length === 10
  ) ? data.queryStringObject.phone.trim() : false
  if (phone) {
    // Get the token from the headers
    let token = typeof data.headers.token === 'string' ? data.headers.token : false
    // Verify that the token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, tokenIsValid => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', phone, function (err, userData) {
          if (!err && userData) {
            _data.delete('users', phone, (err) => {
              if (!err) {
                callback(200)
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

// Tokens
handlers.tokens = function (data, callback) {
  let acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.includes(data.method)) {
    handlers._tokens[data.method](data, callback)
  } else {
    callback(405)
  }
}

handlers._tokens = {}

// Token - post
// Required: phone, password
// Optional: none
handlers._tokens.post = function (data, callback) {
  //Check that all required fields are filled out
  let phone = typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false
  let password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

  if (phone && password) {
    // Make sure that the user doesn't already exist
    _data.read('users', phone, function (err, userData) {
      if (!err && userData) {
        // Hash and compare the password
        let hashedPassword = helpers.hash(password)
        if (hashedPassword == userData.hashedPassword) {
          //If valid, create a new token with a random name, Set expiration date 1 hour in the future
          let tokenId = helpers.createRandomString(20)
          let expires = Date.now() + 1000 * 60 * 60

          let tokenObject = { 'phone': phone, 'id': tokenId, 'expires': expires }

          // Store Token
          _data.create('tokens', tokenId, tokenObject, err => {
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
handlers._tokens.get = function (data, callback) {
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
handlers._tokens.put = function (data, callback) {
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
handlers._tokens.delete = function (data, callback) {
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

// Verify if a given id is currently valid for a given user
handlers._tokens.verifyToken = function (id, phone, callback) {
  // Lookup the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true)
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  })
}

// Ping handler
handlers.ping = function (data, callback) {
  callback(200)
}

//Not found handler
handlers.notFound = function (data, callback) {
  callback(404)
}

module.exports = handlers;