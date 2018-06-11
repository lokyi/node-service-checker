const repl = require('repl')

repl.start({
    'prompt': '> ',
    'eval': function (str) {
        // Evaluate incoming inputs
        console.log(`Evaluating: ${str}`)

        if (str.includes('fizz')) {
            console.log('buzz')
        }
    }
})