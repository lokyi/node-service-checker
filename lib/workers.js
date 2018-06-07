/*
 * Worker-related tasks
 */

const fs = require('fs')
const http = require('http')
const https = require('https');
const path = require('path')
const url = require('url')
const util = require('util')
const debug = util.debuglog('workers')

const _data = require('./data')
const helpers = require('./helpers')
const _logs = require('./logs')

const workers = {}

// Lookup all checks, get their data, send to a validator
workers.getherAllChecks = function () {
  // Get all the checks
  _data.list('checks', (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach(check => {
        // Read in the check data
        _data.read('checks', check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            // Pass it to the check validator, and let that function continue or leg error as needed
            this.validateCheckData(originalCheckData)
          } else {
            debug('Error reading one of the check\'s data')
          }
        })
      })
    } else {
      debug('Error: Could not find any checks to process')
    }
  })
}

// Sanity-check the check-data
workers.validateCheckData = function (originalCheckData) {
  originalCheckData = typeof originalCheckData === 'object' && originalCheckData !== null ? originalCheckData: {}
  originalCheckData.id = typeof originalCheckData.id === 'string' && originalCheckData.id.trim().length === 20 ? originalCheckData.id.trim() : false
  originalCheckData.userPhone = typeof originalCheckData.userPhone === 'string' && originalCheckData.userPhone.trim().length === 10 ? originalCheckData.userPhone.trim() : false
  originalCheckData.protocal = typeof originalCheckData.protocal === 'string' && ['http', 'https'].includes(originalCheckData.protocal) ? originalCheckData.protocal : false
  originalCheckData.url = typeof originalCheckData.url === 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false
  originalCheckData.method = typeof originalCheckData.method === 'string' && ['post', 'get', 'put', 'delete'].includes(originalCheckData.method) ? originalCheckData.method : false
  originalCheckData.successCodes = typeof originalCheckData.successCodes === 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false
  originalCheckData.timeoutSeconds = typeof originalCheckData.timeoutSeconds === 'number' && [1,2,3,4,5].includes(originalCheckData.timeoutSeconds) ? originalCheckData.timeoutSeconds : false

  // Set the keys that may not be set (if the workers have never seen this check before)
  originalCheckData.state = typeof originalCheckData.state === 'string' && ['up', 'down'].includes(originalCheckData.state) ? originalCheckData.state : 'down'
  originalCheckData.lastChecked = typeof originalCheckData.lastChecked === 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false

  // If all the checks pass, pass the data along to the next step in the process
  if (
    originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocal &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCodes &&
    originalCheckData.timeoutSeconds
  ) {
    this.performCheck(originalCheckData)
  } else {
    debug('Error: One of the checks is not properly formatted. Skipping it.')
  }
}

// Perform the check, send the original check data and the outcome the check process to the next step in the process
workers.performCheck = function (originalCheckData) {
  // Prepare the initial check outcome
  let checkOutcome = {
    'error': false,
    'responseCode': false
  }
  // Mark that the outcome has not been sent yet
  let outcomeSent = false

  // Parse the hostname and the path out of the original check data
  let parsedUrl = url.parse(originalCheckData.protocal + '://' + originalCheckData.url, true)
  let hostname = parsedUrl.hostname
  let path = parsedUrl.path // Using path and not "pathname" because we want the query string

  // Construct the request
  let requestDetails = {
    'protocal': originalCheckData.protocal + ':',
    'hostname' : hostname,
    'method' : originalCheckData.method.toUpperCase(),
    'path': path,
    'timeout': originalCheckData.timeoutSeconds * 1000
  }

  // Instantiate the request obkect (using the correct module)
  let _moduleToUse = originalCheckData.protocal === 'http' ? http : https;

  let req = _moduleToUse.request(requestDetails, res => {
    let status = res.statusCode

    // Update the check outcome
    checkOutcome.responseCode = status
    if (!outcomeSent) {
      this.processCheckOutcome(originalCheckData, checkOutcome)
      outcomeSent = true
    }
  })

  // Bind to the error
  req.on('error', e => {
    // Update the checkOutcome and pass the data along
    checkOutcome.error = { 'error': true, 'value': e }
    if (!outcomeSent) {
      this.processCheckOutcome(originalCheckData, checkOutcome)
      outcomeSent = true
    }
  })

  //Bind to timeout
  req.on('timeout', e => {
    // Update the checkOutcome and pass the data along
    checkOutcome.error = { 'error': true, 'value': 'timeout' }
    if (!outcomeSent) {
      this.processCheckOutcome(originalCheckData, checkOutcome)
      outcomeSent = true
    }
  })
  // End the request
  req.end()
}

// Proccess the outcome, update the check data, trigger an alert if needed
// Do not alert if never been tested before
workers.processCheckOutcome = function (originalCheckData, checkOutcome) {
  // Decide if the check is considered up or down
  let state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.includes(checkOutcome.responseCode) ? 'up' : 'down'

  // Decide if an alert is warranted
  let alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false

  // Log the outcome of the check
  let timeOfCheck = Date.now()
  workers.log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck)

  // Update the check data
  let newCheckData = originalCheckData
  newCheckData.state = state
  newCheckData.lastChecked = timeOfCheck

  // Save the updates
  _data.update('checks', newCheckData.id, newCheckData, err => {
    if (!err) {
      // Send the new check data to the next phase in the process if needed
      if (alertWarranted) {
        this.alertUserToStatusChange(newCheckData)
      } else {
        debug('Check outcome has not changed for id:', newCheckData.id)
      }
    } else {
      debug('Error tring to save updates to one of the checks')
    }
  })
}

// Alert the user as to a change in their check status
workers.alertUserToStatusChange = function (newCheckData) {
  let msg = `Alert: your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocal + '://' + newCheckData.url} is currently ${newCheckData.state}`
  helpers.sendTwilioSms(newCheckData.userPhone, msg, err => {
    if (!err) {
      debug('Success: User was alerted to a status change in their check, via sms')
    } else {
      debug('Error: Could not send sms alert to user who had a state change in their check')
    }
  });
}

workers.log = function (originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck) {
  // Form the log data
  let logData = {
    'check': originalCheckData,
    'outcome': checkOutcome,
    'state': state,
    'alert': alertWarranted,
    'time': timeOfCheck
  }

  // Convert data to a string
  let logString = JSON.stringify(logData)

  // Determine the name of the log file
  let logFileName = originalCheckData.id

  // Append the log string to the file
  _logs.append(logFileName, logString, err => {
    if (!err) {
      debug('Loggin to file succeeded')
    } else {
      debug("Logging to file failed")
    }
  })
}

// Timer to execute the worker-process once per minute
workers.loop = function () {
  setInterval(() => {
    this.getherAllChecks()
  }, 1000 * 60)
}


// Rotate (compress) the log files
workers.rotateLogs = function () {
  // List all the non-compressed log files
  _logs.list(false, (err, logs) => {
    if (!err && logs && logs.length > 0) {
      logs.forEach(logName => {
        // Compress the data to a different file
        let logId = logName.replace('.log', '')
        let newFileId = logId + '-' + Date.now()
        _logs.compress(logId, newFileId, err => {
          if (!err) {
            // Truncate the log
            _logs.truncate(logId, err => {
              if (!err) {
                debug('Success truncating logFile')
              } else {
                debug('Error truncating log file')
              }
            })
          } else {
            debug('Error compressing one of the log files', err)
          }
        })
      })
    } else {
      debug("Error: could not find any logs to rotate")
    }
  })
}

// Timer to execute the log ratation process every day
workers.logRotationLoop = function () {
  setInterval(() => {
    this.rotateLogs()
  }, 1000 * 60 * 60 * 24)
}

workers.init = function () {
  // Send to console, in yellow
  console.log('\x1b[33m%s\x1b[0m', 'Background workers are running')

	// Execute all the checks immediately
	// workers.getherAllChecks()

	// Call the loop so the checks will ececute later on
  // workers.loop()
  
  // Compress all the logs immediately
  // workers.rotateLogs();

  // Call the compression loop so logs will be compressed later on
  // workers.logRotationLoop()
}

module.exports = workers