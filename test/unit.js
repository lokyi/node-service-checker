// This is the unit test

const helpers = require('../lib/helpers')
const assert = require('assert')
const logs = require('../lib/logs')
const exampleDebuggingProblem = require('../lib/exampleDebuggingProblem')

let unit = {}

// Assert that the get a number function is returning a number
unit['helpers.getNumber should return a number'] = function (done) {
	let val = helpers.getNumber()
	assert.equal(typeof val, 'number')
	done()
}

// Assert that the get a number function is returning a 1
unit['helpers.getNumber should return 1'] = function (done) {
	let val = helpers.getNumber()
	assert.equal(val, 1)
	done()
}

// Assert that the get a number function is returning a 2
unit['helpers.getNumber should return 2'] = function (done) {
	let val = helpers.getNumber()
	assert.equal(val, 2)
	done()
}

// Logs.list should callback an array and a false error
unit['logs.list should callback a false error and an array of log names'] = function (done) {
	logs.list(true, function (err, logFileNames) {
		assert.equal(err, null)
		assert.ok(logFileNames instanceof Array)
		assert.ok(logFileNames.length > 1)
		done()
	});
}

// Truncate should not throw
unit['Truncate should not throw even if the id does not exist'] = function (done) {
	assert.doesNotThrow(function () {
		logs.truncate('fakeID', err => {
			assert.ok(err)
			done()
		})
	}, TypeError)
}

// example debugging problem should throw
unit['exampleDebuggingProblem.init should not throw'] = function (done) {
	assert.doesNotThrow(function () {
		exampleDebuggingProblem.init()
		done()
	}, TypeError)
}

module.exports = unit
