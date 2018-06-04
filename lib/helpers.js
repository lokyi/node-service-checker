/*
 * Helpers for various tasks
 */

const crypto = require('crypto')
const https = require('https')
const querystring = require('querystring')

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

// Send an SMS message via Twilio
helpers.sendTwilioSms = function (phone, msg, callback) {
  // Validate parameters
  phone = typeof phone === 'string' && phone.trim().length == 10 ? phone.trim() : false
  msg = typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false

  if (phone && msg) {
    // Configure the request payload
    let payload = {
      'From': config.twilio.fromPhone,
      'To': '+1' + phone,
      'Body': msg
    }

    // Stringify the payload
    let stringPayload = querystring.stringify(payload)
    // Configure the request details
    let requestDetails = {
      'protocal': 'https',
      'hostname': 'api.twilio.com',
      'method': 'POST',
      'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    }

    let req = https.request(requestDetails, res => {
      // Grab the status of the sent request
      let status = res.statusCode
      if (status === 200 || status === 201) {
        callback(null)
      } else {
        callback('Status code returned was ' + status)
      }
    })

    // Bind to the error event so it doesn't get thrown
    req.on('error', e => {
      callback(e)
    })

    req.write(stringPayload);
    req.end()
  } else {
    callback('Geven parameters are missing or invalid')
  }
}

module.exports = helpers;