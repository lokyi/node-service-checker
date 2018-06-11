let http2 = require('http2')

let client = http2.connect('http://localhost:6000')

let req = client.request({
    ':path': '/'
})

// When a message is received, add the pieces of it together until reacted an end
let str = ''
req.on('data', chunk => {
    str += chunk
})

// When the message ends, log it out
req.on('end', () => {
    console.log(str)
})

req.end()