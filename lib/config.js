/*
 * Create and export configuration variables
 */

 //Container for all the environments
var environments = {}

// Staging (default) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'thisIsASecret',
  'maxChecks': 5,
  'twilio': {
    'accountSid': 'ACb32d411ad7fe886aac54c665d25e5c5d',
    'authToken': '9455e3eb3109edc12e3d8c92768f7a67',
    'fromPhone': '+15005550006'
  },
  'templateGlobals': {
    'appName': 'Uptime Checker',
    'companyName': 'NotARealCompany, Inc',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost:3000'
  }
}

environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'thisIsAlsoASecret',
  'maxChecks': 5,
  'twilio': {
    'accountSid': '',
    'authToken': '',
    'fromPhone' : ''
  },
  'templateGlobals': {
    'appName': 'Uptime Checker',
    'companyName': 'NotARealCompany, Inc',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost: 5000'
  }
}

// Staging (default) environment
environments.testing = {
  'httpPort': 4000,
  'httpsPort': 4001,
  'envName': 'testing',
  'hashingSecret': 'thisIsASecret',
  'maxChecks': 5,
  'twilio': {
    'accountSid': 'ACb32d411ad7fe886aac54c665d25e5c5d',
    'authToken': '9455e3eb3109edc12e3d8c92768f7a67',
    'fromPhone': '+15005550006'
  },
  'templateGlobals': {
    'appName': 'Uptime Checker',
    'companyName': 'NotARealCompany, Inc',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost:3000'
  }
}

// Determine which should be exported out
var currentEnvironment = 'NODE_ENV' in process.env ?
  process.env.NODE_ENV.toLowerCase() : ''

// Check and defualt
var environmentToExport = currentEnvironment in environments ?
  environments[currentEnvironment] : environments.staging

module.exports = environmentToExport;
