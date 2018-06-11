// This is a library that demonstrate throwing whe init is called

let example = {}

example.init = function () {
    // This is an error created intentionally

    let foo = bar
}

module.exports = example