/*
 * Request handlers
*/
const users = require('./users')
const tokens = require('./tokens')
const checks = require('./checks')
const helpers = require('../helpers')

//Define the handlers
var handlers = {}

// Index handler
handlers.index = function (data, callback) {
	// Reject any request that isn't a GET
	if (data.method === 'get') {
		// Prepare data for the interpolation
		let templateData = {
			'head.title': 'Uptime Monitoring - Made Simple',
			'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds. When your site goes down, we will send you a text to let you know',
			'body.class': 'index'
		}
		helpers.getTemplate('index', templateData, (err, str) => {
			if (!err && str) {
				// Add the universal header and footer
				helpers.addUniversalTemplate(str, templateData, (err, fullStr) => {
					if (!err && fullStr) {
						callback(200, fullStr, 'html');
					} else {
						callback(500, undefined, 'html')
					}
				})
			} else {
				callback(500, undefined, 'html')
			}
		})
	} else {
		callback(405, undefined, 'html');
	}
}

// Create Account
handlers.accountCreate = function (data, callback) {
	// Reject any request that isn't a GET
	if (data.method === 'get') {
		// Prepare data for the interpolation
		let templateData = {
			'head.title': 'Create an account',
			'head.description': 'Sign up is easy and only takes a few seconds',
			'body.class': 'accountCreate'
		}
		helpers.getTemplate('accountCreate', templateData, (err, str) => {
			if (!err && str) {
				// Add the universal header and footer
				helpers.addUniversalTemplate(str, templateData, (err, fullStr) => {
					if (!err && fullStr) {
						callback(200, fullStr, 'html');
					} else {
						callback(500, undefined, 'html')
					}
				})
			} else {
				callback(500, undefined, 'html')
			}
		})
	} else {
		callback(405, undefined, 'html');
	}
}

// Account Edit
handlers.accountEdit = function (data, callback) {
	// Reject any request that isn't a GET
	if (data.method === 'get') {
		// Prepare data for the interpolation
		let templateData = {
			'head.title': 'Account Settings',
			'body.class': 'accountEdit'
		}
		helpers.getTemplate('accountEdit', templateData, (err, str) => {
			if (!err && str) {
				// Add the universal header and footer
				helpers.addUniversalTemplate(str, templateData, (err, fullStr) => {
					if (!err && fullStr) {
						callback(200, fullStr, 'html');
					} else {
						callback(500, undefined, 'html')
					}
				})
			} else {
				callback(500, undefined, 'html')
			}
		})
	} else {
		callback(405, undefined, 'html');
	}
}

// Create Session
handlers.sessionCreate = function (data, callback) {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for the interpolation
    let templateData = {
      'head.title': 'Login to your account',
      'head.description': 'Please enter your phone number and password to access your account',
      'body.class': 'sessionCreate'
    }
    helpers.getTemplate('sessionCreate', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplate(str, templateData, (err, fullStr) => {
          if (!err && fullStr) {
            callback(200, fullStr, 'html');
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(500, undefined, 'html')
      }
    })
  } else {
    callback(405, undefined, 'html');
  }
}

// Session Deleted
handlers.sessionDeleted = function (data, callback) {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for the interpolation
    let templateData = {
      'head.title': 'Logged Out',
      'head.description': 'You have been logged out of your account',
      'body.class': 'sessionDeleted'
    }
    helpers.getTemplate('sessionDeleted', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplate(str, templateData, (err, fullStr) => {
          if (!err && fullStr) {
            callback(200, fullStr, 'html');
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(500, undefined, 'html')
      }
    })
  } else {
    callback(405, undefined, 'html');
  }
}

// Account Deleted
handlers.accountDeleted = function (data, callback) {
	// Reject any request that isn't a GET
	if (data.method === 'get') {
		// Prepare data for the interpolation
		let templateData = {
			'head.title': 'Account Deleted',
			'head.description': 'Your account has been deleted',
			'body.class': 'accountDeleted'
		}
		helpers.getTemplate('accountDeleted', templateData, (err, str) => {
			if (!err && str) {
				// Add the universal header and footer
				helpers.addUniversalTemplate(str, templateData, (err, fullStr) => {
					if (!err && fullStr) {
						callback(200, fullStr, 'html');
					} else {
						callback(500, undefined, 'html')
					}
				})
			} else {
				callback(500, undefined, 'html')
			}
		})
	} else {
		callback(405, undefined, 'html');
	}
}

// Create a new check
handlers.checksCreate = function (data, callback) {
	// Reject any request that isn't a GET
	if (data.method === 'get') {
		// Prepare data for the interpolation
		let templateData = {
			'head.title': 'Create a New Check',
			'body.class': 'checksCreate'
		}
		helpers.getTemplate('checksCreate', templateData, (err, str) => {
			if (!err && str) {
				// Add the universal header and footer
				helpers.addUniversalTemplate(str, templateData, (err, fullStr) => {
					if (!err && fullStr) {
						callback(200, fullStr, 'html');
					} else {
						callback(500, undefined, 'html')
					}
				})
			} else {
				callback(500, undefined, 'html')
			}
		})
	} else {
		callback(405, undefined, 'html');
	}
}

// Dashbiard (view all checks)
handlers.checksList = function (data, callback) {
	// Reject any request that isn't a GET
	if (data.method === 'get') {
		// Prepare data for the interpolation
		let templateData = {
			'head.title': 'Dashboard',
			'body.class': 'checksList'
		}
		helpers.getTemplate('checksList', templateData, (err, str) => {
			if (!err && str) {
				// Add the universal header and footer
				helpers.addUniversalTemplate(str, templateData, (err, fullStr) => {
					if (!err && fullStr) {
						callback(200, fullStr, 'html');
					} else {
						callback(500, undefined, 'html')
					}
				})
			} else {
				callback(500, undefined, 'html')
			}
		})
	} else {
		callback(405, undefined, 'html');
	}
}

// Edit a Check
handlers.checksEdit = function (data, callback) {
	// Reject any request that isn't a GET
	if (data.method === 'get') {
		// Prepare data for the interpolation
		let templateData = {
			'head.title': 'Check Detials',
			'body.class': 'checksEdit'
		}
		helpers.getTemplate('checksEdit', templateData, (err, str) => {
			if (!err && str) {
				// Add the universal header and footer
				helpers.addUniversalTemplate(str, templateData, (err, fullStr) => {
					if (!err && fullStr) {
						callback(200, fullStr, 'html');
					} else {
						callback(500, undefined, 'html')
					}
				})
			} else {
				callback(500, undefined, 'html')
			}
		})
	} else {
		callback(405, undefined, 'html');
	}
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