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
  'hashingSecret': 'thisIsASecret'
}

environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'thisIsAlsoASecret'
}

// Determine which should be exported out
var currentEnvironment = 'NODE_ENV' in process.env ?
  process.env.NODE_ENV.toLowerCase() : ''

// Check and defualt
var environmentToExport = currentEnvironment in environments ?
  environments[currentEnvironment] : environments.staging

module.exports = environmentToExport;
