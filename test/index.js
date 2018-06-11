/*
 * Test Runner
 */

process.env.NODE_ENV = 'testing'

 // Application logic for the test runner
_app = {}

// Container for the test
_app.tests = {}

_app.tests.unit = require('./unit')
_app.tests.api = require('./api')

_app.countTests = function () {
    let counter = 0
    for (let key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            let subTests = _app.tests[key]
            for (let testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    counter++
                }
            }
        }
    }
    return counter
}

// Produce a test outcome report
_app.produceTestReport = function (limit, successes, errors) {
    console.log('')
    console.log('-------------------BEGIN TEST REPORT---------------')
    console.log('')
    console.log('Total Tests: ', limit)
    console.log('Pass: ', successes)
    console.log('Fail: ', errors.length)
    console.log('')

    // If there are errors, print them in detail
    if (errors.length > 0) {
        console.log('-----------BEGIN ERROR DETAILS-----------')
        console.log('')
        errors.forEach(testError => {
          console.log('\x1b[31m%s\x1b[0m', testError.name) 
          console.log(testError.error)
          console.log('')
        })
        console.log('')
        console.log('------------END ERROR DETAILS-----------')
    }
    console.log('')
    console.log('------------------END TEST REPORT-------------------')
    process.exit(0)
}

// Run all the tests, collecting the errors and successes
_app.runTests = function () {
    let errors = []
    let successes = 0
    let limit = _app.countTests()

    let counter = 0
    for (let key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            let subTests = _app.tests[key]
            for (let testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    (function () {
                        let tmpTestName = testName
                        let testValue = subTests[testName]
                        // call the test
                        try {
                            testValue(function () {
                                // If no error thrown, then it succeeded, log in green
                                console.log('\x1b[32m%s\x1b[0m', tmpTestName)
                                counter++
                                successes++
                                if (counter === limit) {
                                    _app.produceTestReport(limit, successes, errors)
                                }
                            })
                        } catch (e) {
                            // If it throws, the it failed, log in red
                            errors.push({
                                'name': testName,
                                'error': e
                            })
                            console.log('\x1b[31m%s\x1b[0m', tmpTestName)
                            counter++
                            if (counter === limit) {
                                _app.produceTestReport(limit, successes, errors)
                            }
                        }
                    })()
                }
            }        
        }
    }
}

// Run the tests
_app.runTests()