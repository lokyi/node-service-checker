/*
 * Helpers for various tasks
 */

const crypto = require('crypto')
const https = require('https')
const querystring = require('querystring')
const path = require('path')
const fs = require('fs')

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
      'protocol': 'https:',
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

// Get the string content of a template
helpers.getTemplate = function (templateName, data, callback) {
  templateName = typeof templateName === 'string' && templateName.length > 0 ? templateName : false
  data = typeof data === 'object' && data !== null ? data : {}
  if (templateName) {
    let templatesDir = path.join(__dirname, '/../templates/')
    fs.readFile(templatesDir + templateName + '.html', 'utf8', (err, str) => {
      if (!err && str && str.length > 0) {
        let finalStr = this.interpolate(str, data)
        callback(false, finalStr)
      } else {
        callback('No template could be found')
      }
    })
  } else {
    callback('A valid template name was not specified')
  }
}

// Add the universal header and footer to a string and pass the provided data object
helpers.addUniversalTemplate = function (str, data, callback) {
  str = typeof str === 'string' && str.length > 0 ? str : '';
  data = typeof data === 'object' && data !== null ? data : {}

  // Get the header
  this.getTemplate('_header', data, (err, headerString) => {
    if (!err && headerString) {
      // Get the footer
      this.getTemplate('_footer', data, (err, footerString) => {
        if (!err && footerString) {
          // Add them all together
          let fullString = headerString + str + footerString;
          callback(false, fullString)
        } else {
          callback('Could not fint the footer template!')
        }
      })
    } else {
      callback('Could not find the header template!')
    }
  })
}

// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = function (str, data) {
  str = typeof str === 'string' && str.length > 0 ? str : '';
  data = typeof data === 'object' && data !== null ? data : {}

  // Add the templateGlobals to the data object, prepending their key anme with global
  for (let key in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(key)) {
      data['global.' + key] = config.templateGlobals[key]
    }
  }
  //For each key in the data object, insert its value into the string at the correct locations
  for (let key in data) {
    if (data.hasOwnProperty(key) && typeof data[key] === 'string') {
      let replace = data[key]
      str = str.replace(`{${key}}`, data[key])
    }
  }
  return str
}

// Get the contents of a static (public) asset
helpers.getStaticAsset = function (fileName, callback) {
  fileName = typeof fileName === 'string' && fileName.length > 0 ? fileName : false
  if (fileName) {
    let publicDir = path.join(__dirname, '/../public/')
    fs.readFile(publicDir + fileName, (err, data) => {
      if (!err && data) {
        callback(null, data)
      } else {
        callback('No file can be find')
      }
    })
  } else {
    callback('A valid file name was not specified')
  }
}

// Sample for testing that simply returns a number
helpers.getNumber = function () {
  return 1
}

module.exports = helpers;