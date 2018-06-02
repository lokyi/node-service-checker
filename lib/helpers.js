/*
 * Helpers for various tasks
 */

const crypto = require('crypto')
const config = require('./config');

var helpers = {}

// Create a SHA256 hash
helpers.hash = function (str) {
  if (typeof str === 'string' && str.length > 0) {
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
    return hash
  } else {
    return false;
  }
}

// Convert Json String Buffer to Object, without throwing
helpers.parseJsonToObject = function (str) {
  try {
    var obj = JSON.parse(str)
    return obj
  } catch (error) {
    return {}
  }
}

// Create a string of random alphanumeric chars of a given length
helpers.createRandomString = function (strLength) {
  strLength = typeof strLength === 'number' && strLength > 0 ? strLength : false
  if (strLength) {
    // Define all the possible characters that could go into a string
    let possibleChars = 'abcdefghijklmnopqrstuvwxyz1234567890'
    let str = ''
    for (let i = 0; i < strLength; i++) {
      idx = Math.floor(Math.random() * strLength)
      str += possibleChars[idx]
    }
    return str
  } else {
    return false
  }
}

module.exports = helpers;