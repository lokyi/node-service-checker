// Checks

const _data = require('../data')
const helpers = require('../helpers')
const config = require('../config')
const verifyToken = require('../verifyToken')

var checks = function (data, callback) {
  let acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.includes(data.method)) {
    _checks[data.method](data, callback)
  } else {
    callback(405)
  }
}
// Contianer for checks submethods
var _checks = {}

// checks -post
// Required: protocol, url, method, successCodes, timeoutSeconds
// Optional: none
_checks.post = function (data, callback) {
  //Check that all required fields are filled out
  let protocol = typeof data.payload.protocol === 'string' && ['https', 'http'].includes(data.payload.protocol.trim()) ? data.payload.protocol.trim() : false
  let url = typeof data.payload.url === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false
  let method = typeof data.payload.method === 'string' && ['post', 'get', 'put', 'delete'].includes(data.payload.method.trim()) ? data.payload.method.trim() : false
  let successCodes = typeof data.payload.successCodes === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false
  let timeoutSeconds = typeof data.payload.timeoutSeconds === 'number' && [1, 2, 3, 4, 5].includes(data.payload.timeoutSeconds) ? data.payload.timeoutSeconds : false

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // Get the token from the headers
    let token = typeof data.headers.token === 'string' ? data.headers.token : false
    
    // Lookup the user by reading the token
    _data.read('tokens', token, function (err, tokenData) {
      if (!err && tokenData) {
        let userPhone = tokenData.phone

        // Lookup the user data
        _data.read('users', userPhone, (err, userData) => {
          if (!err && userData) {
            let userChecks = typeof userData.checks === 'object' && userData.checks instanceof Array ? userData.checks : []
            // Verify that the user has less than the max number of checks
            if (userChecks.length < config.maxChecks) {
              // Create an random Id for the check
              let checkId = helpers.createRandomString(20)
              // Create the check object, and include the user's phone
              let checkObject = {
                'id': checkId,
                'userPhone': userPhone,
                'protocol': protocol,
                'url': url,
                'method': method,
                'successCodes': successCodes,
                'timeoutSeconds': timeoutSeconds
              }
              _data.create('checks', checkId, checkObject, err => {
                if (!err) {
                  // Add the check id to the user's object
                  userData.checks = userChecks
                  userData.checks.push(checkId)
                  // Save the new user data
                  _data.update('users', userPhone, userData, err => {
                    if (!err) {
                      // Return the data about the new check
                      callback(200, checkObject)
                    } else {
                      callback(500, { 'Error': 'Could not update the user with the new check' })
                    }
                  })
                } else {
                  callback(500, { 'Error': 'Failed to create new check' })
                }
              });
            } else {
              callback(400, { 'Error': `The user already has the maximum number of checks (${config.maxChecks})` })
            }
          } else {
            callback(403)
          }
        })
      } else {
        callback(403)
      }
    })
  } else {
    callback(400, { 'Error': 'Missing Required Fields, or inputs are invalid' })
  }
}

// checks -get
// Required data: id
// Optional data: none
_checks.get = function (data, callback) {
  // Check that the id number is valid
  let id = (
    typeof data.queryStringObject.id == 'string' &&
    data.queryStringObject.id.trim().length === 20
  ) ? data.queryStringObject.id.trim() : false
  if (id) {
    // Lookup the check
    _data.read('checks', id, function (err, checkData) {
      if (!err && checkData) {
        // Get the token from the headers
        let token = typeof data.headers.token === 'string' ? data.headers.token : false
        // Verify that the given token belongs to that user
        verifyToken(token, checkData.userPhone, tokenIsValid => {
          if (tokenIsValid) {
            // Return check data
            callback(200, checkData)
          } else {
            callback(403)
          }
        })
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

// checks -put
// Required data: id
// Optional data: (at least one of) protocol, url, method, successCodes, timeoutSeconds
_checks.put = function (data, callback) {
  let id = typeof data.payload.id === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false
  
  let protocol = typeof data.payload.protocol === 'string' && ['https', 'http'].includes(data.payload.protocol.trim()) ? data.payload.protocol.trim() : false
  let url = typeof data.payload.url === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false
  let method = typeof data.payload.method === 'string' && ['post', 'get', 'put', 'delete'].includes(data.payload.method.trim()) ? data.payload.method.trim() : false
  let successCodes = typeof data.payload.successCodes === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false
  let timeoutSeconds = typeof data.payload.timeoutSeconds === 'number' && [1, 2, 3, 4, 5].includes(data.payload.timeoutSeconds) ? data.payload.timeoutSeconds : false

  console.log(id, protocol, url, method, successCodes, timeoutSeconds )
  // Error if the id is invalid
  if (id) {
    // Check to make sure one or more optional fields has been set
    if (protocol || url || method || successCodes || timeoutSeconds) {
      // Lookup the check
      _data.read('checks', id, (err, checkData) => {
        if (!err && checkData) {
          // Get the token from the headers
          let token = typeof data.headers.token === 'string' ? data.headers.token : false

          // Verify that the token is valid for the id number
          verifyToken(token, checkData.userPhone, tokenIsValid => {
            if (tokenIsValid) {
              if (protocol) {
                checkData.protocol = protocol
              }
              if (url) {
                checkData.url = url
              }
              if (method) {
                checkData.method = method
              }
              if (successCodes) {
                checkData.successCodes = successCodes
              }
              if (timeoutSeconds) {
                checkData.timeoutSeconds = timeoutSeconds
              }
              // Store the new updates
              _data.update('checks', id, checkData, err => {
                if (!err) {
                  callback(200)
                } else {
                  console.log(err)
                  callback(500, { 'Error': 'Could not update the user' })
                }
              })
            } else {
              callback(403, { 'Error': 'Missing required token in header, or token is invalid' })
            }
          })
        } else {
          callback(400, { 'Error': 'Check ID did not exist' })
        }
      })
    } else {
      callback(400, { 'Error': 'Missing fields to update' })
    }
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

// checks - delete
// Required: phone
_checks.delete = function (data, callback) {
  // Check that the id number is valid
  let id = (
    typeof data.queryStringObject.id == 'string' &&
    data.queryStringObject.id.trim().length === 20
  ) ? data.queryStringObject.id.trim() : false
  if (id) {
    // Lookup the check
    _data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        // Get the token from the headers
        let token = typeof data.headers.token === 'string' ? data.headers.token : false
        // Verify that the token is valid for the phone number
        verifyToken(token, checkData.userPhone, tokenIsValid => {
          if (tokenIsValid) {
            // Delete the check data
            _data.delete('checks', id, err => {
              if (!err) {
                // Lookup the user
                _data.read('users', checkData.userPhone, function (err, userData) {
                  if (!err && userData) {
                    let userChecks = typeof userData.checks === 'object' && userData.checks instanceof Array ? userData.checks : []
                    // Remove the deleted check from their list of checks
                    let checkPosition = userChecks.indexOf(id)
                    if (checkPosition !== -1) {
                      userChecks.splice(checkPosition, 1)
                      // Re-save the user's data
                      userData.checks = userChecks
                      _data.update('users', checkData.userPhone, userData, (err) => {
                        if (!err) {
                          callback(200)
                        } else {
                          callback(500, { 'Error': 'Could not find the user who created the check' })
                        }
                      })
                    } else {
                      callback(500, { 'Error': 'Could not find the check on the user object' })
                    }
                  } else {
                    callback(400, { 'Error': 'Cannot find the user who created the check' })
                  }
                })  
              } else {
                callback(500, { 'Error': 'Could not delete the check data' })
              }
            })
          } else {
            callback(403, { 'Error': 'Missing required token in header, or token is invalid' })
          }
        })
      } else {
        callback(400, { 'Error': 'The speficied check Id does not exist' })
      }
    })

  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

module.exports = checks;