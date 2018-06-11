/* 
 * CLI-Related tasks
*/

const readline = require('readline')
const util = require('util')
const events = require('events')
const os = require('os')
const v8 = require('v8')
const _data = require('./data')
const _logs = require('./logs')
const helpers = require('./helpers')
const childProcess = require('child_process')
class _events extends events {}

let e = new _events();

// Instantiate the CLI module 
let cli = {}

// Input handlers
e.on('man', function () {
  cli.responders.help()  
})
e.on('help', function () {
	cli.responders.help()
})
e.on('exit', function () {
	cli.responders.exit()
})
e.on('stats', function () {
	cli.responders.stats()
})
e.on('list users', function () {
	cli.responders.listUsers()
})
e.on('more user info', function (str) {
	cli.responders.moreUserInfo(str)
})
e.on('list checks', function (str) {
	cli.responders.listChecks(str)
})
e.on('more check info', function (str) {
	cli.responders.moreCheckInfo(str)
})
e.on('list logs', function () {
	cli.responders.listLogs()
})
e.on('more log info', function (str) {
	cli.responders.moreLogInfo(str)
})

// Responders
cli.responders = {}

// man / help
cli.responders.help = function () {
	let commands = {
		'exit': 'Kill the CLI (and the rest of the application)',
		'man': 'Show this help page',
		'help': 'Alias of the "man" command',
		'stats': 'Get statistics on the underlying operating system and resource utilization',
		'List users': 'Show a list of all the registered (undeleted) users in the system',
		'More user info --{userId}': 'Show details of a specified user',
		'List checks --up --down': 'Show a list of all the active checks in the system, including their state. The "--up" and "--down flags are both optional."',
		'More check info --{checkId}': 'Show details of a specified check',
		'List logs': 'Show a list of all the log files available to be read (compressed only)',
		'More log info --{logFileName}': 'Show details of a specified log file'
	}

	// Show a header for the help page that is as wide as the screen
	cli.horizontalLine();
	cli.centered('CLI MANUAL')
	cli.horizontalLine()
	cli.verticalSpace(2)

	// Show each command, followed by this explanation, in white and yellow respectively
	for (let key in commands) {
		if (commands.hasOwnProperty(key)) {
			let value = commands[key]
			let line = '    \x1b[33m' + key + '\x1b[0m    '
			let padding = 50 - line.length
			for (let i = 0; i < padding; i++) {
				line += ' '
			}
			line += value
			console.log(line)
			cli.verticalSpace()
		}
	}
	cli.verticalSpace(1)
	// End with another horizaontalLine
	cli.horizontalLine()
}

// Create a vertical space
cli.verticalSpace = function (lines) {
	lines = typeof lines === 'number' && lines > 0 ? lines : 1
	for (let i = 0; i < lines; i++) {
		console.log('')
	}
}

// Create a horizontal line across the screen
cli.horizontalLine = function () {
	// Get the available screen size
	let width = process.stdout.columns
	let line = ''
	for (let i = 0; i < width; i++) {
		line += '-'
	}
	console.log(line)
}

// Create centered text on the screen
cli.centered = function (str) {
	str = typeof str === 'string' && str.trim().length > 0 ? str.trim() : ''

	// Get the available screen size
	let width = process.stdout.columns

	// Calculate the left padding there should be
	let leftPadding = Math.floor((width - str.length) / 2)

	// Put in left padded spaces before hte string iteself
	let line = ''
	for (let i = 0; i < leftPadding; i++) {
		line += ' '
	}
	line += str
	console.log(line)
}

// exit
cli.responders.exit = function () {
	process.exit(0)
}
// stats
cli.responders.stats = function () {
	// Compile an object of stats
	let stats = {
    'Load Average': os.loadavg().join(' '),
    'CPU Count': os.cpus().length,
    'Free Memory': os.freemem(),
    'Current Malloaced Memory': v8.getHeapStatistics().malloced_memory,
    'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
    'Allocated Healp Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
    'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
    'Uptime': os.uptime() + ' Seconds'
  }
  // Create a header for the stats
  cli.horizontalLine()
  cli.centered('SYSTEM STATISTICS')
  cli.horizontalLine()
  cli.verticalSpace(2)

  // Log out each stat
  for (let key in stats) {
    if (stats.hasOwnProperty(key)) {
      let value = stats[key]
      let line = '    \x1b[33m' + key + '\x1b[0m    '
      let padding = 50 - line.length
      for (let i = 0; i < padding; i++) {
        line += ' '
      }
      line += value
      console.log(line)
      cli.verticalSpace()
    }
  }
  cli.verticalSpace(1)
  // End with another horizaontalLine
  cli.horizontalLine()
}
// list users
cli.responders.listUsers = function () {
  _data.list('users', (err, userIds) => {
    if (!err && userIds && userIds.length > 0) {
      cli.verticalSpace()
      userIds.forEach(userId => {
        _data.read('users', userId, (err, userData) => {
          if (!err && userData) {
            let line = `Name: ${userData.firstName} ${userData.lastName} Phone: ${userData.phone} Checks: `
            let numberOfChecks = typeof userData.checks === 'object' && userData.checks instanceof Array ? userData.checks.length : 0
            line += numberOfChecks
            console.log(line)
            cli.verticalSpace()
          }
        })
      })
    }    
  })
}
// more user info
cli.responders.moreUserInfo = function (str) {
  // Get the ID from the string
  let arr = str.split('--')
  let userId = typeof arr[1] === 'string' && arr[1].trim().length > 0 ? arr[1].trim(): false
  if (userId) {
    // Lookup the user
    _data.read('users', userId, (err, userData) => {
      if (!err && userData) {
        // Remove the hashed password
        delete userData.hashedPassword

        // Print the JSON with text highlighting
        cli.verticalSpace()
        console.dir(userData, { 'colors': true })
        cli.verticalSpace()
      }
    })
  }
}
// list checks
cli.responders.listChecks = function (str) {
  _data.list('checks', (err, checkIds) => {
    if (!err && checkIds && checkIds.length > 0) {
      cli.verticalSpace()
      let lowerString = str.toLowerCase()
      checkIds.forEach(checkId => {
        _data.read('checks', checkId, (err, checkData) => {
          if (!err && checkData) {
            let includeCheck = false
            // Get the state, default to down
            let state = typeof(checkData.state) === 'string' ? checkData.state : 'down'
            let stateOrUnknown = typeof (checkData.state) === 'string' ? checkData.state : 'unknown'
            // Filter by user input
            if (
              lowerString.includes(`--${state}`) ||
              (!lowerString.includes('--down') && !lowerString.includes('--up'))
            ) {
              let line = `ID :${checkData.id} ${checkData.method.toUpperCase()} ${checkData.protocal}://${checkData.url} State: ${stateOrUnknown}`
              console.log(line)
              cli.verticalSpace()
            }
          }
        })
      })
    }
  })
}
// more check info
cli.responders.moreCheckInfo = function (str) {
  // Get the ID from the string
  let arr = str.split('--')
  let checkId = typeof arr[1] === 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false
  if (checkId) {
    // Lookup the check
    _data.read('checks', checkId, (err, checkData) => {
      if (!err && checkData) {
        // Print the JSON with text highlighting
        cli.verticalSpace()
        console.dir(checkData, { 'colors': true })
        cli.verticalSpace()
      }
    })
  }
}
// list logs
cli.responders.listLogs = function () {
  let ls = childProcess.spawn('ls', ['./.logs/'])
  ls.stdout.on('data', dataObject => {
    // Explode into seperate lines
    let dataStr = dataObject.toString()
    let logFileNames = dataStr.split('\n')
    cli.verticalSpace()
    logFileNames.forEach(logFileName => {
      if (typeof logFileName === 'string' && logFileName.length > 0 && logFileName.includes('-')) {
        console.log(logFileName.trim().split('.')[0])
        cli.verticalSpace()
      }
    })
  })
}

// mroe log info
cli.responders.moreLogInfo = function (str) {
  // Get the file name from the string
  let arr = str.split('--')
  let logFileName = typeof arr[1] === 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false
  if (logFileName) {
    cli.verticalSpace()
    // Decompress the log file
    _logs.decompress(logFileName, (err, strData) => {
      if (!err && strData) {
        // Split into lines
        let lines = strData.split('\n')
        lines.forEach(line => {
          let logObject = helpers.parseJsonToObject(line)
          if (logObject && Object.keys(logObject).length > 0) {
            console.dir(logObject, { 'colors': true })
            cli.verticalSpace()
          }
        })
      }
    })
  }
}

// Input processor
cli.processInput = function (str) {
	str = typeof str === 'string' && str.trim().length > 0 ? str : false
	
	// Only process a non-empty str
	if (str) {
		// Codify the unique strings
		let uniqueInputs = [
			'man',
			'help',
			'exit',
			'stats',
			'list users',
			'more user info',
			'list checks',
			'more check info',
			'list logs',
			'more log info'
		]

		// Go through possible inputs, emit an event when a match is found
		let matchFound = false
		let counter = 0
		uniqueInputs.some((input) => {
			if (str.toLowerCase().includes(input)) {
				matchFound = true
				// Emit an event matching the unique input, and include the full string given
				e.emit(input, str)
				return true
			}
		})
		// If no match is found, tell the user to try again
		if (!matchFound) {
			console.log('Unknown command, please try again')
		}
	}
}

cli.init = function () {
	// Send the start message to the console, in dark blue
	console.log('\x1b[34m%s\x1b[0m', 'The CLI is running')

	// Start the interface
	let _interface = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: '> '
	})

	// Create an initial promp
	_interface.prompt()

	// Handle each line of input
	_interface.on('line', str => {
		// Send to the input processor
		this.processInput(str)
		// Reinitialize the prompt
		_interface.prompt()
	})
	
	// If the user stops the CLI, kill the process
	_interface.on('close', () => {
		process.exit(0)
	})
}

module.exports = cli