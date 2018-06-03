/*
 * Request handlers
*/
const users = require('./users')
const tokens = require('./tokens')
const checks = require('./checks')

//Define the handlers
var handlers = {}

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