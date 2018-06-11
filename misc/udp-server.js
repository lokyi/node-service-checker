const dgram = require('dgram')

// Creating a server
let server = dgram.createSocket('udp4')

server.on('message', (messageBuffer, sender) => {
    // Do something with the message or the sender
    let messageStr = messageBuffer.toString()
    console.log(messageStr)
})

server.bind(6000)