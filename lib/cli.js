/* 
 * CLI-Related tasks
*/

const readLine = require('readline')
const util = require('util')
const debug = util.debug('cli')
const events = require('events')

class _events extends evnets {}

let e = new _events();

// Instantiate the CLI module 
let cli = {}

cli.init = function () {
    // Send the start message to the console, in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'THe CLI is running')

    // Start the interface
    let _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ''
    })

    
}

module.exports = cli