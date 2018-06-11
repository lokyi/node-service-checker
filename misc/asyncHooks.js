const async_hooks = require('async_hooks')
const fs = require('fs')

// Target Execution context

let targetExecutionContext = false

let whatTImeIsIt = function (callback) {
    setInterval(() => {
        fs.writeSync(1, 'When the setInterval runs, the execution context is' + async_hooks.executionAsyncId() + '\n')
        callback(Date.now())
    }, 1000)
}

whatTImeIsIt(time => {
    fs.writeSync(1, 'The time is ' + time + '\n')
})

// Hooks
let hooks = {
    init(asyncId, type, triggerAsyncId, resource) {
        fs.writeSync(1, 'Hook init ' + asyncId + '\n')
    },
    before(asyncId, type, triggerAsyncId, resource) {
        fs.writeSync(1, 'Hook before ' + asyncId + '\n')
    },
    after(asyncId, type, triggerAsyncId, resource) {
        fs.writeSync(1, 'Hook after ' + asyncId + '\n')
    },
    destroy(asyncId, type, triggerAsyncId, resource) {
        fs.writeSync(1, 'Hook destroy ' + asyncId + '\n')
    },
    promiseResolve(asyncId, type, triggerAsyncId, resource) {
        fs.writeSync(1, 'Hook promiseResolve ' + asyncId + '\n')
    } 
}

// Create a new AsyncHooks Instance
let asyncHook = async_hooks.createHook(hooks)
asyncHook.enable()